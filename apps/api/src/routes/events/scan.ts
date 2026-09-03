import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "@repo/database";
import { createHash } from "crypto";

const scanSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function scanRoutes(app: FastifyInstance) {
  // POST /api/events/:eventId/checkpoints/scan
  app.post(
    "/",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const user = (request as any).user;

      const body = scanSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ success: false, error: body.error.flatten() });
      }

      const { token } = body.data;

      // Ensure the event is active
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { status: true }
      });

      if (!event || (event.status !== "ACTIVE" && event.status !== "BUILDING")) {
        return reply.status(400).send({
          success: false,
          error: { code: "EVENT_INACTIVE", message: "This event is not currently active." }
        });
      }

      // Check if user is a participant
      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true }
      });

      if (!participant) {
        return reply.status(403).send({
          success: false,
          error: { code: "NOT_PARTICIPANT", message: "You are not participating in this event." }
        });
      }

      // Check if user is in a team
      const teamMembership = participant.teamMemberships[0];
      if (!teamMembership) {
        return reply.status(403).send({
          success: false,
          error: { code: "NO_TEAM", message: "You must be in a team to scan checkpoints." }
        });
      }

      const teamId = teamMembership.teamId;

      // Hash the incoming raw token to compare against the stored hash
      const hashedToken = createHash("sha256").update(token).digest("hex");

      const teamCheckpoint = await prisma.eventTeamCheckpoint.findUnique({
        where: { tokenHash: hashedToken },
        include: { checkpoint: true }
      });

      if (!teamCheckpoint) {
        return reply.status(400).send({
          success: false,
          error: { code: "INVALID_TOKEN", message: "This QR code is invalid." }
        });
      }

      // Validate wrong team
      if (teamCheckpoint.teamId !== teamId) {
        return reply.status(403).send({
          success: false,
          error: { code: "WRONG_TEAM", message: "This QR code belongs to another team." }
        });
      }

      // Validate wrong event
      if (teamCheckpoint.checkpoint.eventId !== eventId) {
        return reply.status(400).send({
          success: false,
          error: { code: "WRONG_EVENT", message: "This QR code is for a different event." }
        });
      }

      // Validate checkpoint active
      if (!teamCheckpoint.checkpoint.active) {
        return reply.status(400).send({
          success: false,
          error: { code: "CHECKPOINT_INACTIVE", message: "This checkpoint is not currently active." }
        });
      }

      // Check if already scanned
      if (teamCheckpoint.status === "COMPLETED") {
        return reply.status(400).send({
          success: false,
          error: { code: "ALREADY_SCANNED", message: "Your team has already scanned this checkpoint." }
        });
      }

      // TRANSACTIONAL SCAN ENGINE
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Mark team checkpoint as completed
          const updatedTeamCheckpoint = await tx.eventTeamCheckpoint.update({
            where: { id: teamCheckpoint.id, status: "LOCKED" }, // Optimistic concurrency check
            data: { status: "COMPLETED", completedAt: new Date() }
          });

          // Create audit scan record
          const scan = await tx.eventScan.create({
            data: {
              teamId: teamId,
              teamCheckpointId: teamCheckpoint.id,
              scannedByUserId: user.id,
              pointsAwarded: teamCheckpoint.checkpoint.points,
            }
          });

          // Award points to team
          const updatedTeam = await tx.eventTeam.update({
            where: { id: teamId },
            data: { totalPoints: { increment: teamCheckpoint.checkpoint.points } }
          });

          // Unlock resources associated with this checkpoint
          let unlockedResource = null;
          const config = teamCheckpoint.checkpoint.config as any;
          if (config && config.resourceId) {
            const resource = await tx.eventResource.findUnique({ where: { id: config.resourceId } });
            if (resource && resource.active) {
              unlockedResource = await tx.eventTeamResource.create({
                data: {
                  teamId: teamId,
                  resourceId: resource.id,
                  checkpointId: teamCheckpoint.checkpoint.id,
                },
                include: { resource: true }
              });
            }
          }

          return { scan, updatedTeam, unlockedResource };
        });

        return reply.send({
          success: true,
          data: {
            pointsAwarded: result.scan.pointsAwarded,
            totalPoints: result.updatedTeam.totalPoints,
            resourceUnlocked: result.unlockedResource?.resource ?? null,
          }
        });

      } catch (err: any) {
        // Handle concurrency failure (if update fails due to status already changed)
        if (err.code === 'P2025' || err.message?.includes("Record to update not found")) {
          return reply.status(409).send({
            success: false,
            error: { code: "ALREADY_SCANNED", message: "This checkpoint was just scanned by another team member." }
          });
        }
        throw err;
      }
    },
  );
}
