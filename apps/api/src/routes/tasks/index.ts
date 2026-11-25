import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";
import { TeamPermissions, UserPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { permissionService, roleService } from "../../rbac";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  deadline: z.string().datetime().optional().nullable(),
  assignedToId: z.string().min(1, "Assigned user is required").trim(),
  teamId: z.string().optional().nullable(),
  maxScore: z.number().int().min(1).max(1000).optional().default(100),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  deadline: z.string().datetime().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

async function canManageAllTasks(userId: string): Promise<boolean> {
  const [auth, roles] = await Promise.all([
    permissionService.getAuthorizationContext(userId),
    roleService.getUserRoles(userId),
  ]);

  if (auth.isSuperAdmin) return true;
  if (
    roles.some((r) =>
      ["super admin", "admin", "developer"].includes(r.name.toLowerCase()),
    )
  ) {
    return true;
  }

  return auth.permissions.some(
    (p) =>
      p.key === UserPermissions.UPDATE_ANY.key ||
      p.key === TeamPermissions.ASSIGN_ANY.key,
  );
}

export const tasksRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/tasks - List tasks (scoped to own tasks for regular members)
  app.get("/", async (request, reply) => {
    const actor = (request as any).user;
    const isManager = await canManageAllTasks(actor.id);

    const query = request.query as {
      status?: string;
      priority?: string;
      assignedToId?: string;
      createdById?: string;
      teamId?: string;
      search?: string;
    };

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.teamId) where.teamId = query.teamId;

    if (isManager) {
      if (query.assignedToId) where.assignedToId = query.assignedToId;
      if (query.createdById) where.createdById = query.createdById;
    } else {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [{ assignedToId: actor.id }, { createdById: actor.id }],
        },
      ];
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { assignedTo: { name: { contains: term, mode: "insensitive" } } },
          ],
        },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            department: true,
            post: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reply.send({ tasks });
  });

  // 2. GET /api/tasks/:id - Single task details (with IDOR guard)
  app.get("/:id", async (request, reply) => {
    const actor = (request as any).user;
    const { id } = request.params as { id: string };

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            department: true,
            post: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: "Task not found" });
    }

    const isManager = await canManageAllTasks(actor.id);
    if (!isManager && task.assignedToId !== actor.id && task.createdById !== actor.id) {
      return reply.status(403).send({ error: "Forbidden: You do not have access to this task" });
    }

    return reply.send({ task });
  });

  // 3. POST /api/tasks - Create task assigned to team member (Managers/Admins only)
  app.post("/", async (request, reply) => {
    const actor = (request as any).user;
    const isManager = await canManageAllTasks(actor.id);
    if (!isManager) {
      return reply.status(403).send({
        error: "Forbidden: Only Admins, Developers, or Team Managers can assign tasks.",
      });
    }

    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { title, description, priority, status, deadline, assignedToId, teamId, maxScore } =
      parsed.data;

    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, email: true },
    });

    if (!assignee) {
      return reply.status(400).send({
        error: "Assigned team member (User) does not exist in the database.",
      });
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) {
        return reply.status(400).send({ error: "Selected team does not exist." });
      }
    }

    const task = await prisma.task.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description: description || null,
        priority,
        status,
        deadline: deadline ? new Date(deadline) : null,
        createdById: actor.id,
        assignedToId: assignee.id,
        teamId: teamId || null,
        maxScore,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const actorRoles = await roleService.getUserRoles(actor.id);
    await prisma.systemActivityLog.create({
      data: {
        userId: actor.id,
        userName: actor.name || actor.email || "Admin",
        userRole: actorRoles[0]?.name || "Admin",
        action: `Assigned task "${title}" to team member ${assignee.name} (${assignee.email})`,
        category: "Tasks",
        type: "user-action",
        status: "Completed",
      },
    });

    return reply.status(201).send({ success: true, task });
  });

  // 4. PUT /api/tasks/:id - Update task details & reassignment (Managers/Admins only)
  app.put("/:id", async (request, reply) => {
    const actor = (request as any).user;
    const isManager = await canManageAllTasks(actor.id);
    if (!isManager) {
      return reply.status(403).send({
        error: "Forbidden: Only Admins or Team Managers can edit task details.",
      });
    }

    const { id } = request.params as { id: string };
    const parsed = updateTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Task not found" });
    }

    const { title, description, priority, status, deadline, assignedToId, teamId } =
      parsed.data;

    if (assignedToId && assignedToId !== existing.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignee) {
        return reply.status(400).send({
          error: "Reassigned team member (User) does not exist.",
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(deadline !== undefined
          ? { deadline: deadline ? new Date(deadline) : null }
          : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
        ...(teamId !== undefined ? { teamId } : {}),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reply.send({ success: true, task: updated });
  });

  // 5. PATCH /api/tasks/:id/status - Update task status (Assignee, Creator, or Manager)
  app.patch("/:id/status", async (request, reply) => {
    const actor = (request as any).user;
    const { id } = request.params as { id: string };
    const parsed = updateTaskStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Task not found" });
    }

    const isManager = await canManageAllTasks(actor.id);
    if (!isManager && existing.assignedToId !== actor.id && existing.createdById !== actor.id) {
      return reply.status(403).send({
        error: "Forbidden: You can only update the status of tasks assigned to you.",
      });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return reply.send({ success: true, task: updated });
  });

  // 6. DELETE /api/tasks/:id - Delete task (Managers/Admins only)
  app.delete("/:id", async (request, reply) => {
    const actor = (request as any).user;
    const isManager = await canManageAllTasks(actor.id);
    if (!isManager) {
      return reply.status(403).send({
        error: "Forbidden: Only Admins or Team Managers can delete tasks.",
      });
    }

    const { id } = request.params as { id: string };

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });

    return reply.send({ success: true, message: "Task deleted successfully" });
  });
};
