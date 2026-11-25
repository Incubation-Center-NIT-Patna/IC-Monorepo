import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";
import { TeamPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

const teamMemberInputSchema = z.object({
  userId: z.string().min(1),
  position: z.string().min(1).max(80).trim().default("Member"),
  order: z.coerce.number().int().default(0),
});

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100).trim(),
  description: z.string().max(500).optional(),
  type: z.enum(["OPERATIONAL", "GLOBAL", "FACULTY"]).default("OPERATIONAL"),
  order: z.coerce.number().int().default(0),
  permissionKeys: z.array(z.string()).optional(),
  memberUserIds: z.array(z.string()).optional(),
  members: z.array(teamMemberInputSchema).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["OPERATIONAL", "GLOBAL", "FACULTY"]).optional(),
  order: z.coerce.number().int().optional(),
  permissionKeys: z.array(z.string()).optional(),
  memberUserIds: z.array(z.string()).optional(),
  members: z.array(teamMemberInputSchema).optional(),
});

const addMembersSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
  position: z.string().min(1).max(80).trim().default("Member"),
});

const updateMemberPositionSchema = z.object({
  position: z.string().min(1, "Position is required").max(80).trim(),
  order: z.coerce.number().int().optional(),
});

export const teamsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/teams - List all teams with members, positions, and assigned permissions
  app.get(
    "/",
    {
      preHandler: [authorize({ permission: TeamPermissions.READ_ANY })],
    },
    async (_request, reply) => {
      const teams = await prisma.team.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          members: {
            orderBy: [{ order: "asc" }, { user: { name: "asc" } }],
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  department: true,
                  post: true,
                  banned: true,
                  roles: {
                    select: {
                      role: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
          permissions: {
            include: {
              permission: true,
            },
          },
          roles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              members: true,
              applications: true,
              tasks: true,
            },
          },
        },
      });

      const formatted = teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        type: team.type,
        order: team.order,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        memberCount: team._count.members,
        applicationCount: team._count.applications,
        taskCount: team._count.tasks,
        members: team.members.map((m) => ({
          ...m.user,
          position: m.position,
          memberOrder: m.order,
          roles: m.user.roles.map((r) => r.role.name),
        })),
        permissions: team.permissions.map((tp) => ({
          id: tp.permission.id,
          resource: tp.permission.resource,
          action: tp.permission.action,
          scope: tp.permission.scope,
          key: `${tp.permission.resource}:${tp.permission.action}:${tp.permission.scope.toLowerCase()}`,
        })),
        roles: team.roles.map((tr) => ({
          id: tr.role.id,
          name: tr.role.name,
        })),
      }));

      return reply.send({ teams: formatted });
    },
  );

  // 2. GET /api/teams/:id - Single team details
  app.get(
    "/:id",
    {
      preHandler: [authorize({ permission: TeamPermissions.READ_ANY })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          members: {
            orderBy: [{ order: "asc" }, { user: { name: "asc" } }],
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  department: true,
                  post: true,
                  banned: true,
                  roles: {
                    select: {
                      role: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
          permissions: {
            include: {
              permission: true,
            },
          },
          roles: {
            include: {
              role: true,
            },
          },
          interviewRounds: {
            include: {
              evaluationParameters: true,
            },
          },
        },
      });

      if (!team) {
        return reply.status(404).send({ error: "Team not found" });
      }

      return reply.send({
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          type: team.type,
          order: team.order,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          members: team.members.map((m) => ({
            ...m.user,
            position: m.position,
            memberOrder: m.order,
            roles: m.user.roles.map((r) => r.role.name),
          })),
          permissions: team.permissions.map((tp) => ({
            id: tp.permission.id,
            resource: tp.permission.resource,
            action: tp.permission.action,
            scope: tp.permission.scope,
            key: `${tp.permission.resource}:${tp.permission.action}:${tp.permission.scope.toLowerCase()}`,
          })),
          roles: team.roles.map((tr) => ({
            id: tr.role.id,
            name: tr.role.name,
          })),
          interviewRounds: team.interviewRounds,
        },
      });
    },
  );

  // 3. POST /api/teams - Create a new team with permissions and members + positions
  app.post(
    "/",
    {
      preHandler: [authorize({ permission: TeamPermissions.CREATE_ANY })],
    },
    async (request, reply) => {
      const parsed = createTeamSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const {
        name,
        description,
        type,
        order,
        permissionKeys,
        memberUserIds,
        members,
      } = parsed.data;
      const actor = (request as any).user;

      const existing = await prisma.team.findUnique({ where: { name } });
      if (existing) {
        return reply.status(409).send({ error: `A team named "${name}" already exists.` });
      }

      const team = await prisma.team.create({
        data: {
          name,
          description: description || null,
          type,
          order,
        },
      });

      // Assign Permissions
      if (permissionKeys && permissionKeys.length > 0) {
        for (const key of permissionKeys) {
          const [resource, action, scope] = key.split(":");
          if (!resource || !action || !scope) continue;

          const normalizedScope = scope.toLowerCase() as "own" | "any";
          const dbPerm = await prisma.permission.findFirst({
            where: {
              resource,
              action,
              scope: normalizedScope,
            },
          });

          if (dbPerm) {
            await prisma.teamPermission.upsert({
              where: {
                teamId_permissionId: {
                  teamId: team.id,
                  permissionId: dbPerm.id,
                },
              },
              create: {
                teamId: team.id,
                permissionId: dbPerm.id,
              },
              update: {},
            });
          }
        }
      }

      // Assign Members (structured members take precedence over legacy memberUserIds)
      const memberEntries =
        members && members.length > 0
          ? members
          : (memberUserIds || []).map((userId, idx) => ({
              userId,
              position: "Member",
              order: idx,
            }));

      for (const entry of memberEntries) {
        await prisma.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId: team.id,
              userId: entry.userId,
            },
          },
          create: {
            teamId: team.id,
            userId: entry.userId,
            position: entry.position || "Member",
            order: entry.order ?? 0,
          },
          update: {
            position: entry.position || "Member",
            order: entry.order ?? 0,
          },
        });
      }

      await prisma.systemActivityLog.create({
        data: {
          userId: actor.id,
          userName: actor.name || actor.email || "Administrator",
          userRole: actor.role || "Admin",
          action: `Created new team: "${team.name}" (${team.type})`,
          category: "Teams",
          type: "user-action",
          status: "Completed",
          details: {
            teamId: team.id,
            teamName: team.name,
            teamType: team.type,
            assignedPermissions: permissionKeys || [],
            assignedMemberCount: memberEntries.length,
          },
        },
      });

      return reply.status(201).send({ success: true, team });
    },
  );

  // 4. PUT /api/teams/:id - Update team details, permissions, and members + positions
  app.put(
    "/:id",
    {
      preHandler: [authorize({ permission: TeamPermissions.UPDATE_ANY })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateTeamSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const existing = await prisma.team.findUnique({
        where: { id },
        include: { members: true },
      });
      if (!existing) {
        return reply.status(404).send({ error: "Team not found" });
      }

      const {
        name,
        description,
        type,
        order,
        permissionKeys,
        memberUserIds,
        members,
      } = parsed.data;
      const actor = (request as any).user;

      if (name && name !== existing.name) {
        const nameConflict = await prisma.team.findUnique({ where: { name } });
        if (nameConflict) {
          return reply.status(409).send({ error: `A team named "${name}" already exists.` });
        }
      }

      const updated = await prisma.team.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(type !== undefined ? { type } : {}),
          ...(order !== undefined ? { order } : {}),
        },
      });

      // Update Permissions if provided
      if (permissionKeys !== undefined) {
        await prisma.teamPermission.deleteMany({ where: { teamId: id } });

        for (const key of permissionKeys) {
          const [resource, action, scope] = key.split(":");
          if (!resource || !action || !scope) continue;

          const normalizedScope = scope.toLowerCase() as "own" | "any";
          const dbPerm = await prisma.permission.findFirst({
            where: {
              resource,
              action,
              scope: normalizedScope,
            },
          });

          if (dbPerm) {
            await prisma.teamPermission.create({
              data: {
                teamId: id,
                permissionId: dbPerm.id,
              },
            });
          }
        }
      }

      // Update Members if provided
      if (members !== undefined || memberUserIds !== undefined) {
        const existingPositionMap = new Map(
          existing.members.map((m) => [m.userId, { position: m.position, order: m.order }]),
        );

        const nextMembers =
          members !== undefined
            ? members
            : (memberUserIds || []).map((userId, idx) => ({
                userId,
                position: existingPositionMap.get(userId)?.position || "Member",
                order: existingPositionMap.get(userId)?.order ?? idx,
              }));

        await prisma.teamMember.deleteMany({ where: { teamId: id } });

        for (const entry of nextMembers) {
          await prisma.teamMember.create({
            data: {
              teamId: id,
              userId: entry.userId,
              position: entry.position || "Member",
              order: entry.order ?? 0,
            },
          });
        }
      }

      await prisma.systemActivityLog.create({
        data: {
          userId: actor.id,
          userName: actor.name || actor.email || "Administrator",
          userRole: actor.role || "Admin",
          action: `Updated team configuration: "${updated.name}"`,
          category: "Teams",
          type: "user-action",
          status: "Completed",
          details: {
            teamId: id,
            teamName: updated.name,
            updatedPermissions: permissionKeys,
            memberCount: members?.length ?? memberUserIds?.length,
          },
        },
      });

      return reply.send({ success: true, team: updated });
    },
  );

  // 5. DELETE /api/teams/:id - Delete a team
  app.delete(
    "/:id",
    {
      preHandler: [authorize({ permission: TeamPermissions.DELETE_ANY })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const actor = (request as any).user;

      const team = await prisma.team.findUnique({
        where: { id },
        include: { _count: { select: { applications: true, tasks: true } } },
      });

      if (!team) {
        return reply.status(404).send({ error: "Team not found" });
      }

      if (team._count.applications > 0) {
        return reply.status(400).send({
          error: `Cannot delete team "${team.name}" because it has ${team._count.applications} linked induction applications. Reassign or resolve applications first.`,
        });
      }

      await prisma.team.delete({ where: { id } });

      await prisma.systemActivityLog.create({
        data: {
          userId: actor.id,
          userName: actor.name || actor.email || "Administrator",
          userRole: actor.role || "Admin",
          action: `Deleted team: "${team.name}"`,
          category: "Teams",
          type: "user-action",
          status: "Completed",
        },
      });

      return reply.send({ success: true, message: `Team "${team.name}" deleted successfully.` });
    },
  );

  // 6. POST /api/teams/:id/members - Add user(s) to team with optional position
  app.post(
    "/:id/members",
    {
      preHandler: [authorize({ permission: TeamPermissions.ASSIGN_ANY })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = addMembersSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const team = await prisma.team.findUnique({ where: { id } });
      if (!team) {
        return reply.status(404).send({ error: "Team not found" });
      }

      for (const userId of parsed.data.userIds) {
        await prisma.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId: id,
              userId,
            },
          },
          create: {
            teamId: id,
            userId,
            position: parsed.data.position,
          },
          update: {
            position: parsed.data.position,
          },
        });
      }

      return reply.send({ success: true, message: "Members assigned to team." });
    },
  );

  // 7. PATCH /api/teams/:id/members/:userId - Manually change a member's position inside the team
  app.patch(
    "/:id/members/:userId",
    {
      preHandler: [authorize({ permission: TeamPermissions.ASSIGN_ANY })],
    },
    async (request, reply) => {
      const { id, userId } = request.params as { id: string; userId: string };
      const parsed = updateMemberPositionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: id, userId } },
      });

      if (!membership) {
        return reply.status(404).send({ error: "Team membership not found" });
      }

      const updated = await prisma.teamMember.update({
        where: { teamId_userId: { teamId: id, userId } },
        data: {
          position: parsed.data.position,
          ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          team: { select: { id: true, name: true } },
        },
      });

      return reply.send({
        success: true,
        member: {
          ...updated.user,
          position: updated.position,
          order: updated.order,
          teamName: updated.team.name,
        },
      });
    },
  );

  // 8. DELETE /api/teams/:id/members/:userId - Remove user from team
  app.delete(
    "/:id/members/:userId",
    {
      preHandler: [authorize({ permission: TeamPermissions.ASSIGN_ANY })],
    },
    async (request, reply) => {
      const { id, userId } = request.params as { id: string; userId: string };

      await prisma.teamMember.deleteMany({
        where: {
          teamId: id,
          userId,
        },
      });

      return reply.send({ success: true, message: "Member removed from team." });
    },
  );
};
