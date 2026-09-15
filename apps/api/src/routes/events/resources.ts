import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "@repo/database";

const quantitySchema = z.object({
  quantity: z.number().int().positive("Quantity must be a positive integer").default(1),
});

export async function resourceRoutes(app: FastifyInstance) {
  // GET /api/events/:eventId/resources - Get unlocked resources for the current team
  app.get(
    "/",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to view resources." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      const teamResources = await prisma.eventTeamResource.findMany({
        where: { teamId },
        include: {
          resource: true,
        },
        orderBy: { unlockedAt: "desc" },
      });

      return reply.send({ resources: teamResources });
    }
  );

  // GET /api/events/:eventId/resources/timeline - Get activity timeline for the team
  app.get(
    "/timeline",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to view timeline." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      const activities = await prisma.eventActivity.findMany({
        where: { eventId, teamId },
        include: {
          resource: { select: { id: true, name: true, type: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return reply.send({ activities });
    }
  );

  // POST /api/events/:eventId/resources/:resourceId/accept
  app.post(
    "/:resourceId/accept",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId, resourceId } = request.params as { eventId: string; resourceId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to perform this action." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      const teamResource = await prisma.eventTeamResource.findUnique({
        where: { teamId_resourceId: { teamId, resourceId } },
        include: { resource: true },
      });

      if (!teamResource) {
        return reply.status(404).send({ error: "This resource has not been unlocked by your team." });
      }

      if (teamResource.resource.eventId !== eventId) {
        return reply.status(400).send({ error: "Resource does not belong to this event." });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.eventTeamResource.update({
          where: { teamId_resourceId: { teamId, resourceId } },
          data: { status: "ACCEPTED" },
          include: { resource: true },
        });

        const activity = await tx.eventActivity.create({
          data: {
            eventId,
            teamId,
            userId: user.id,
            resourceId,
            action: "ACCEPT",
            metadata: {
              resourceName: teamResource.resource.name,
              resourceType: teamResource.resource.type,
            },
          },
        });

        return { teamResource: updated, activity };
      });

      return reply.send({ success: true, data: result.teamResource });
    }
  );

  // POST /api/events/:eventId/resources/:resourceId/reject
  app.post(
    "/:resourceId/reject",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId, resourceId } = request.params as { eventId: string; resourceId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to perform this action." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      const teamResource = await prisma.eventTeamResource.findUnique({
        where: { teamId_resourceId: { teamId, resourceId } },
        include: { resource: true },
      });

      if (!teamResource) {
        return reply.status(404).send({ error: "This resource has not been unlocked by your team." });
      }

      if (teamResource.resource.eventId !== eventId) {
        return reply.status(400).send({ error: "Resource does not belong to this event." });
      }

      if (teamResource.quantity > 0) {
        return reply.status(400).send({
          error: "You must release all acquired units of this resource before rejecting it.",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.eventTeamResource.update({
          where: { teamId_resourceId: { teamId, resourceId } },
          data: { status: "REJECTED" },
          include: { resource: true },
        });

        const activity = await tx.eventActivity.create({
          data: {
            eventId,
            teamId,
            userId: user.id,
            resourceId,
            action: "REJECT",
            metadata: {
              resourceName: teamResource.resource.name,
              resourceType: teamResource.resource.type,
            },
          },
        });

        return { teamResource: updated, activity };
      });

      return reply.send({ success: true, data: result.teamResource });
    }
  );

  // POST /api/events/:eventId/resources/:resourceId/acquire
  app.post(
    "/:resourceId/acquire",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId, resourceId } = request.params as { eventId: string; resourceId: string };
      const user = (request as any).user;

      const body = quantitySchema.safeParse(request.body || {});
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const acquireQty = body.data.quantity;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to acquire resources." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Verify resource exists and belongs to event
          const resource = await tx.eventResource.findUnique({
            where: { id: resourceId },
          });

          if (!resource || resource.eventId !== eventId) {
            throw { status: 404, message: "Resource not found for this event." };
          }

          if (!resource.active) {
            throw { status: 400, message: "This resource is currently inactive." };
          }

          // Verify team has unlocked this resource
          const teamResource = await tx.eventTeamResource.findUnique({
            where: { teamId_resourceId: { teamId, resourceId } },
          });

          if (!teamResource) {
            throw { status: 404, message: "Your team has not unlocked this resource yet." };
          }

          if (teamResource.status === "REJECTED") {
            throw { status: 400, message: "This resource was rejected. Accept it first to acquire." };
          }

          // Check stock availability
          if (resource.availableQuantity < acquireQty) {
            throw {
              status: 400,
              message: `Insufficient stock. Requested: ${acquireQty}, Available: ${resource.availableQuantity}`,
            };
          }

          // Deduct stock from EventResource
          await tx.eventResource.update({
            where: { id: resourceId },
            data: {
              availableQuantity: { decrement: acquireQty },
            },
          });

          // Update EventTeamResource
          const updatedTeamResource = await tx.eventTeamResource.update({
            where: { teamId_resourceId: { teamId, resourceId } },
            data: {
              quantity: { increment: acquireQty },
              status: "ACQUIRED",
              acquiredAt: new Date(),
            },
            include: { resource: true },
          });

          // Log ACQUIRE activity
          const activity = await tx.eventActivity.create({
            data: {
              eventId,
              teamId,
              userId: user.id,
              resourceId,
              action: "ACQUIRE",
              quantity: acquireQty,
              metadata: {
                resourceName: resource.name,
                resourceType: resource.type,
                quantityAcquired: acquireQty,
                totalTeamQuantity: updatedTeamResource.quantity,
                remainingStock: resource.availableQuantity - acquireQty,
              },
            },
          });

          return { teamResource: updatedTeamResource, activity };
        });

        return reply.send({ success: true, data: result.teamResource });
      } catch (err: any) {
        if (err.status) {
          return reply.status(err.status).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  // POST /api/events/:eventId/resources/:resourceId/release
  app.post(
    "/:resourceId/release",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId, resourceId } = request.params as { eventId: string; resourceId: string };
      const user = (request as any).user;

      const body = quantitySchema.safeParse(request.body || {});
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const releaseQty = body.data.quantity;

      const participant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } },
        include: { teamMemberships: true },
      });

      if (!participant || !participant.teamMemberships[0]) {
        return reply.status(403).send({ error: "You must be in a team to release resources." });
      }

      const teamId = participant.teamMemberships[0].teamId;

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Check resource
          const resource = await tx.eventResource.findUnique({
            where: { id: resourceId },
          });

          if (!resource || resource.eventId !== eventId) {
            throw { status: 404, message: "Resource not found for this event." };
          }

          // Check team resource
          const teamResource = await tx.eventTeamResource.findUnique({
            where: { teamId_resourceId: { teamId, resourceId } },
          });

          if (!teamResource) {
            throw { status: 404, message: "Your team has not unlocked this resource." };
          }

          // Validate release quantity against possessed quantity
          if (teamResource.quantity < releaseQty) {
            throw {
              status: 400,
              message: `Cannot release more units than possessed. Requested: ${releaseQty}, Possessed: ${teamResource.quantity}`,
            };
          }

          // Restore stock in EventResource (do not exceed totalQuantity)
          const newAvailable = Math.min(resource.totalQuantity, resource.availableQuantity + releaseQty);
          await tx.eventResource.update({
            where: { id: resourceId },
            data: {
              availableQuantity: newAvailable,
            },
          });

          const remainingTeamQty = teamResource.quantity - releaseQty;
          const updatedStatus = remainingTeamQty === 0 ? "RELEASED" : "ACQUIRED";

          // Update EventTeamResource
          const updatedTeamResource = await tx.eventTeamResource.update({
            where: { teamId_resourceId: { teamId, resourceId } },
            data: {
              quantity: remainingTeamQty,
              status: updatedStatus,
              releasedAt: new Date(),
            },
            include: { resource: true },
          });

          // Log RELEASE activity
          const activity = await tx.eventActivity.create({
            data: {
              eventId,
              teamId,
              userId: user.id,
              resourceId,
              action: "RELEASE",
              quantity: releaseQty,
              metadata: {
                resourceName: resource.name,
                resourceType: resource.type,
                quantityReleased: releaseQty,
                remainingTeamQuantity: remainingTeamQty,
                updatedStock: newAvailable,
              },
            },
          });

          return { teamResource: updatedTeamResource, activity };
        });

        return reply.send({ success: true, data: result.teamResource });
      } catch (err: any) {
        if (err.status) {
          return reply.status(err.status).send({ error: err.message });
        }
        throw err;
      }
    }
  );
}
