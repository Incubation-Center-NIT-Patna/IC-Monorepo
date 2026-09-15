import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { prisma, Prisma } from "@repo/database";
import { randomBytes, createHash } from "crypto";

const createEventSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["STARTUP_HUNT", "TREASURE_HUNT", "HACKATHON", "QUIZ", "COMPETITION", "CUSTOM"]),
  status: z.enum(["DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ACTIVE", "BUILDING", "SUBMISSIONS_OPEN", "SUBMISSIONS_CLOSED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
});

const createTeamSchema = z.object({
  name: z.string().min(1),
});

const createResourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  content: z.record(z.string(), z.any()).optional(),
});

const createCheckpointSchema = z.object({
  sequence: z.number().int().min(1),
  name: z.string().optional(),
  type: z.enum(["QR", "CODE", "NFC", "LOCATION", "MANUAL", "CUSTOM"]),
  points: z.number().int().default(0),
  config: z.record(z.string(), z.any()).optional(),
});

export async function adminRoutes(app: FastifyInstance) {
  // Enforce admin privileges for all routes in this plugin
  // RBAC checks (to be added)
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", async (request, reply) => {
    // Basic global admin check placeholder
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });
  
  // Event Management
  app.get("/events", async (request, reply) => {
    const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
    return reply.send({ events });
  });

  app.post("/events", async (request, reply) => {
    const body = createEventSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const event = await prisma.event.create({
        data: body.data,
      });
      return reply.send({ event });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.put("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = createEventSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const event = await prisma.event.update({
      where: { id },
      data: body.data,
    });
    return reply.send({ event });
  });

  // Team Management

  app.post("/events/:eventId/teams", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const body = createTeamSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const team = await prisma.eventTeam.create({
        data: {
          eventId,
          name: body.data.name,
        },
      });
      return reply.send({ team });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // Resource Management

  app.post("/events/:eventId/resources", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const body = createResourceSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const resource = await prisma.eventResource.create({
      data: {
        eventId,
        name: body.data.name,
        description: body.data.description,
        type: body.data.type,
        content: (body.data.content as Prisma.InputJsonValue) || {},
      },
    });
    return reply.send({ resource });
  });

  // Checkpoint Management
  app.post("/events/:eventId/checkpoints", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const body = createCheckpointSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const checkpoint = await prisma.eventCheckpoint.create({
        data: {
          eventId,
          sequence: body.data.sequence,
          name: body.data.name,
          type: body.data.type,
          points: body.data.points,
          config: (body.data.config as Prisma.InputJsonValue) || {},
        },
      });
      return reply.send({ checkpoint });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // Team-Wise QR Generation
  app.post("/events/:eventId/generate-qrs", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };

    const teams = await prisma.eventTeam.findMany({ where: { eventId } });
    const checkpoints = await prisma.eventCheckpoint.findMany({ where: { eventId } });

    if (teams.length === 0 || checkpoints.length === 0) {
      return reply.status(400).send({ error: "Ensure you have teams and checkpoints created first." });
    }

    let generatedCount = 0;
    const generatedTokens = [];

    for (const team of teams) {
      for (const checkpoint of checkpoints) {
        // Skip if this team-checkpoint combination already exists
        const existing = await prisma.eventTeamCheckpoint.findUnique({
          where: { teamId_checkpointId: { teamId: team.id, checkpointId: checkpoint.id } },
        });

        if (!existing) {
          // Generate a secure random token
          const rawToken = randomBytes(16).toString("hex");
          // Hash it before storing in the database
          const hashedToken = createHash("sha256").update(rawToken).digest("hex");
          
          await prisma.eventTeamCheckpoint.create({
            data: {
              teamId: team.id,
              checkpointId: checkpoint.id,
              tokenHash: hashedToken,
              status: "LOCKED",
            },
          });
          
          generatedTokens.push({
            teamId: team.id,
            teamName: team.name,
            checkpointId: checkpoint.id,
            checkpointSequence: checkpoint.sequence,
            rawToken
          });
          generatedCount++;
        }
      }
    }

    return reply.send({ 
      success: true, 
      generatedCount,
      tokens: generatedTokens,
      message: "Please save these raw tokens. They will not be accessible again. Print them as QR codes." 
    });
  });

  // Admin Recovery / View Operations
  app.get("/events/:eventId/live", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const data = await getLiveDashboardData(eventId);
    return reply.send(data);
  });
}

export async function getLiveDashboardData(eventId: string) {
  // Fetch teams with members, checkpoints, scans, and resources
  const teams = await prisma.eventTeam.findMany({
    where: { eventId },
    include: {
      members: { include: { participant: { include: { user: { select: { name: true } } } } } },
      checkpoints: { include: { checkpoint: true } },
      scans: true,
      resources: {
        include: {
          resource: true,
        },
      },
    },
  });

  const scans = await prisma.eventScan.count({
    where: { team: { eventId } },
  });

  // 1. Live Stock: All resources with available and total quantity
  const resources = await prisma.eventResource.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });

  const stock = resources.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    description: r.description,
    totalQuantity: r.totalQuantity,
    availableQuantity: r.availableQuantity,
    allocatedQuantity: Math.max(0, r.totalQuantity - r.availableQuantity),
    active: r.active,
  }));

  // 2. Team Allocations: All teams with acquired resources
  const teamAllocations = teams.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    totalPoints: t.totalPoints,
    allocations: t.resources
      .filter((tr) => tr.quantity > 0)
      .map((tr) => ({
        resourceId: tr.resourceId,
        resourceName: tr.resource.name,
        resourceType: tr.resource.type,
        quantity: tr.quantity,
        status: tr.status,
        acquiredAt: tr.acquiredAt,
        releasedAt: tr.releasedAt,
      })),
  }));

  // 3. Activity Log: Event activities ordered newest first
  const activities = await prisma.eventActivity.findMany({
    where: { eventId },
    include: {
      team: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      resource: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const activityLog = activities.map((a) => ({
    id: a.id,
    action: a.action,
    createdAt: a.createdAt,
    quantity: a.quantity,
    team: a.team ? { id: a.team.id, name: a.team.name } : null,
    user: a.user ? { id: a.user.id, name: a.user.name, email: a.user.email } : null,
    resource: a.resource ? { id: a.resource.id, name: a.resource.name, type: a.resource.type } : null,
    checkpointId: a.checkpointId,
    metadata: a.metadata,
  }));

  return {
    totalTeams: teams.length,
    totalScans: scans,
    teams: teams.map((t) => ({
      id: t.id,
      name: t.name,
      points: t.totalPoints,
      progress: t.checkpoints.filter((c) => c.status === "COMPLETED").length,
      totalCheckpoints: t.checkpoints.length,
      resources: t.resources
        .filter((r) => r.quantity > 0)
        .map((r) => ({
          name: r.resource.name,
          type: r.resource.type,
          quantity: r.quantity,
          status: r.status,
        })),
    })),
    stock,
    teamAllocations,
    activityLog,
  };
}
