import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";
import { AnalyticsPermissions, InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { roleService } from "../../rbac";

const createLogSchema = z.object({
  action: z.string().min(1, "Action is required").max(500).trim(),
  category: z.string().min(1).max(60).trim().default("General"),
  status: z.string().min(1).max(40).trim().default("Completed"),
  type: z.string().min(1).max(40).trim().default("user-action"),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const activityLogsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/activity-logs
  app.get(
    "/",
    {
      preHandler: [
        authorize({
          any: [
            AnalyticsPermissions.READ_ANY,
            InductionPermissions.APPLICATION_READ_ANY,
          ],
        }),
      ],
    },
    async (request, reply) => {
      const { category, page = "1", limit = "50" } = request.query as {
        category?: string;
        page?: string;
        limit?: string;
      };

      const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
      const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

      const where =
        category && category.toLowerCase() !== "all"
          ? { category: { equals: category, mode: "insensitive" as const } }
          : {};

      const [logs, total] = await Promise.all([
        prisma.systemActivityLog.findMany({
          where,
          orderBy: { timestamp: "desc" },
          take,
          skip,
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        }),
        prisma.systemActivityLog.count({ where }),
      ]);

      const formattedLogs = logs.map((l) => ({
        id: l.id,
        user: l.userName,
        role: l.userRole,
        action: l.action,
        category: l.category,
        type: l.type,
        status: l.status,
        timestamp: l.timestamp.toISOString(),
      }));

      return reply.send({
        logs: formattedLogs,
        pagination: {
          page: parseInt(page, 10) || 1,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    },
  );

  // 2. POST /api/activity-logs (Client audit record)
  app.post("/", async (request, reply) => {
    const user = (request as any).user;
    const parsed = createLogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const roles = await roleService.getUserRoles(user.id);
    const primaryRole = roles[0]?.name || "Member";

    const log = await prisma.systemActivityLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email || "User",
        userRole: primaryRole,
        action: parsed.data.action,
        category: parsed.data.category,
        type: parsed.data.type,
        status: parsed.data.status,
        details: parsed.data.details as any,
      },
    });

    return reply.status(201).send({
      id: log.id,
      user: log.userName,
      role: log.userRole,
      action: log.action,
      category: log.category,
      status: log.status,
      timestamp: log.timestamp.toISOString(),
    });
  });
};
