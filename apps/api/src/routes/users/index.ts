import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { UserPermissions } from "@repo/rbac";
import { prisma } from "@repo/database";
import { isAllowedGoogleEmail } from "@repo/auth/server";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { permissionService, roleService } from "../../rbac";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Valid email is required").trim().toLowerCase(),
  phoneNumber: z.string().min(6).optional(),
  roleIds: z.array(z.string()).optional(),
  teamIds: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(6).optional(),
  roleIds: z.array(z.string()).optional(),
  teamIds: z.array(z.string()).optional(),
});

const banUserSchema = z.object({
  reason: z.string().min(1).optional(),
});

const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) =>
      val === "" ||
      val.startsWith("https://") ||
      val.startsWith("http://") ||
      val.startsWith("/"),
    { message: "URL must start with https://, http://, or /" },
  );

const updateMeSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).trim().optional(),
  phoneNumber: z.string().max(30).optional().nullable(),
  avatar: safeUrlSchema.optional().nullable(),
  image: safeUrlSchema.optional().nullable(),
  department: z.string().max(150).trim().optional().nullable(),
  post: z.string().max(150).trim().optional().nullable(),
  bio: z.string().max(2000).trim().optional().nullable(),
  linkedin: safeUrlSchema.optional().nullable(),
  github: safeUrlSchema.optional().nullable(),
  instagram: safeUrlSchema.optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  banned: z.enum(["true", "false"]).optional(),
  userType: z.enum(["all", "staff", "students"]).default("all"),
});

export async function usersRoutes(app: FastifyInstance) {
  // GET /api/users/me - current user + roles + teams (no permission check, auth only)
  app.get("/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const sessionUser = (request as any).user;
    const [freshUser, roles, authorization] = await Promise.all([
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: {
          teamMemberships: {
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      roleService.getUserRoles(sessionUser.id),
      permissionService.getAuthorizationContext(sessionUser.id),
    ]);

    const user = freshUser || sessionUser;
    const teams = (freshUser?.teamMemberships || []).map((tm) => tm.team);
    const primaryRole = authorization.isSuperAdmin
      ? "Super Admin"
      : roles[0]?.name || "Member";

    return reply.send({
      user: {
        ...user,
        avatar: user.image,
        role: primaryRole,
        teams,
      },
      roles,
      teams,
      permissions: authorization.permissions.map(
        (permission) => permission.key,
      ),
      isSuperAdmin: authorization.isSuperAdmin,
    });
  });

  // PUT /api/users/me & PATCH /api/users/me - update current user profile
  const handleUpdateMe = async (request: any, reply: any) => {
    const user = (request as any).user;
    const parsed = updateMeSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const body = parsed.data;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.phoneNumber !== undefined ? { phoneNumber: body.phoneNumber || null } : {}),
        ...(body.avatar !== undefined || body.image !== undefined
          ? { image: body.avatar || body.image || null }
          : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.post !== undefined ? { post: body.post } : {}),
        ...(body.bio !== undefined ? { bio: body.bio } : {}),
        ...(body.linkedin !== undefined ? { linkedin: body.linkedin } : {}),
        ...(body.github !== undefined ? { github: body.github } : {}),
        ...(body.instagram !== undefined ? { instagram: body.instagram } : {}),
        ...(body.metadata !== undefined ? { metadata: body.metadata as any } : {}),
      },
    });

    const [roles, authorization, freshWithTeams] = await Promise.all([
      roleService.getUserRoles(user.id),
      permissionService.getAuthorizationContext(user.id),
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          teamMemberships: {
            select: {
              team: { select: { id: true, name: true, description: true } },
            },
          },
        },
      }),
    ]);

    const primaryRole = authorization.isSuperAdmin
      ? "Super Admin"
      : roles[0]?.name || "Member";
    const teams = (freshWithTeams?.teamMemberships || []).map((tm) => tm.team);

    // Log profile update
    await prisma.systemActivityLog.create({
      data: {
        userId: user.id,
        userName: updated.name || updated.email || "User",
        userRole: primaryRole,
        action: "Updated profile information",
        category: "Users",
        type: "user-action",
        status: "Completed",
      },
    });

    return reply.send({
      success: true,
      user: {
        ...updated,
        avatar: updated.image,
        role: primaryRole,
        teams,
      },
      roles,
      teams,
      permissions: authorization.permissions.map((p) => p.key),
      isSuperAdmin: authorization.isSuperAdmin,
    });
  };

  app.put("/me", { preHandler: [requireAuth] }, handleUpdateMe);
  app.patch("/me", { preHandler: [requireAuth] }, handleUpdateMe);

  // GET /api/users/me/roles - roles only (used by admin login for role check)
  app.get("/me/roles", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = (request as any).user;
    const [roles, authorization] = await Promise.all([
      roleService.getUserRoles(user.id),
      permissionService.getAuthorizationContext(user.id),
    ]);
    return reply.send({ roles, isSuperAdmin: authorization.isSuperAdmin });
  });

  // GET /api/users/me/sessions - list current user's active sessions
  app.get(
    "/me/sessions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = (request as any).user;
      const currentSession = (request as any).session;

      const sessions = await prisma.session.findMany({
        where: { userId: user.id, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          ipAddress: true,
          userAgent: true,
          expiresAt: true,
        },
      });

      return reply.send({
        sessions,
        currentSessionId: currentSession?.id ?? null,
      });
    },
  );

  // DELETE /api/users/me/sessions/others - revoke all sessions except current
  app.delete(
    "/me/sessions/others",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = (request as any).user;
      const currentSession = (request as any).session;

      await prisma.session.deleteMany({
        where: {
          userId: user.id,
          id: { not: currentSession?.id },
        },
      });

      return reply.send({ success: true });
    },
  );

  // DELETE /api/users/me/sessions/:sessionId - revoke a specific session
  app.delete(
    "/me/sessions/:sessionId",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = (request as any).user;
      const { sessionId } = request.params as { sessionId: string };

      const session = await prisma.session.findFirst({
        where: { id: sessionId, userId: user.id },
      });

      if (!session) {
        return reply.status(404).send({ error: "Session not found" });
      }

      await prisma.session.delete({ where: { id: sessionId } });

      return reply.send({ success: true });
    },
  );

  // POST /api/users - Only Super Admin and Developer can add/register users
  app.post(
    "/",
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const actor = (request as any).user;
      const [actorRoles, actorAuth] = await Promise.all([
        roleService.getUserRoles(actor.id),
        permissionService.getAuthorizationContext(actor.id),
      ]);

      const isAllowed =
        actorAuth.isSuperAdmin ||
        actorRoles.some(
          (r) =>
            r.name.toLowerCase() === "developer" ||
            r.name.toLowerCase() === "super admin",
        );

      if (!isAllowed) {
        return reply.status(403).send({
          error:
            "Forbidden: Only Super Admins and Developers can add or register users.",
        });
      }

      const body = createUserSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const { name, email, phoneNumber, roleIds, teamIds } = body.data;

      // Policy: Validate email format
      if (!isAllowedGoogleEmail(email)) {
        return reply.status(400).send({
          error: "Invalid email address. Please provide a valid Google email.",
        });
      }

      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      if (existing) {
        return reply.status(409).send({
          error: "A user with this email address is already registered in the system.",
        });
      }

      // If assigning roles, prevent non-Super Admins from assigning the Super Admin role
      if (roleIds && roleIds.length > 0 && !actorAuth.isSuperAdmin) {
        const superAdminRole = await prisma.role.findUnique({
          where: { name: "Super Admin" },
        });
        if (superAdminRole && roleIds.includes(superAdminRole.id)) {
          return reply.status(403).send({
            error: "Only Super Admins can assign the Super Admin role.",
          });
        }
      }

      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email,
          phoneNumber: phoneNumber ?? null,
          emailVerified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (roleIds && roleIds.length > 0) {
        const validRoles = await prisma.role.findMany({
          where: { id: { in: roleIds } },
        });
        if (validRoles.length > 0) {
          await prisma.userRole.createMany({
            data: validRoles.map((role) => ({
              userId: user.id,
              roleId: role.id,
            })),
          });
        }
      }

      if (teamIds && teamIds.length > 0) {
        for (const teamId of teamIds) {
          await prisma.teamMember.create({
            data: {
              userId: user.id,
              teamId,
            },
          });
        }
      }

      const createdRoles = await roleService.getUserRoles(user.id);

      return reply.status(201).send({
        user: {
          ...user,
          roles: createdRoles,
        },
      });
    },
  );

  // GET /api/users - paginated list
  app.get(
    "/",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.READ_ANY }),
      ],
    },
    async (request, reply) => {
      const query = listUsersSchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({ error: query.error.flatten() });
      }

      const { page, limit, search, banned, userType } = query.data;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phoneNumber: { contains: search } },
        ];
      }
      if (banned !== undefined) {
        where.banned = banned === "true";
      }
      if (userType === "staff") {
        where.roles = { some: {} };
      } else if (userType === "students") {
        where.roles = { none: {} };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            phoneNumberVerified: true,
            emailVerified: true,
            image: true,
            creationSource: true,
            banned: true,
            bannedAt: true,
            bannedReason: true,
            createdAt: true,
            updatedAt: true,
            roles: {
              select: {
                role: {
                  select: { id: true, name: true },
                },
              },
            },
            teamMemberships: {
              select: {
                team: {
                  select: { id: true, name: true },
                },
              },
            },
            _count: {
              select: {
                assignedTasks: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const formatted = users.map((u) => ({
        ...u,
        roles: u.roles.map((r) => r.role),
        teams: u.teamMemberships.map((tm) => tm.team),
      }));

      return reply.send({
        users: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  );

  // GET /api/users/:id - single user detail
  app.get(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.READ_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          emailVerified: true,
          image: true,
          banned: true,
          bannedAt: true,
          bannedReason: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          sessions: {
            where: { expiresAt: { gt: new Date() } },
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
              ipAddress: true,
              userAgent: true,
              expiresAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        user: {
          ...user,
          roles: user.roles.map((r) => r.role),
        },
      });
    },
  );

  // PUT /api/users/:id - update user fields
  app.put(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = updateUserSchema.safeParse(request.body);
      if (!data.success) {
        return reply.status(400).send({ error: data.error.flatten() });
      }

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.data.name,
          email: data.data.email,
          phoneNumber: data.data.phoneNumber,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          updatedAt: true,
        },
      });

      if (data.data.roleIds !== undefined) {
        const actor = (request as any).user;
        const [actorRoles, authorization, targetRoles] = await Promise.all([
          roleService.getUserRoles(actor.id),
          permissionService.getAuthorizationContext(actor.id),
          roleService.getUserRoles(id),
        ]);

        const targetIsSuperAdmin = targetRoles.some(
          (r) => r.name.toLowerCase() === "super admin",
        );

        // If target is Super Admin, only another Super Admin can change their roles
        if (targetIsSuperAdmin && !authorization.isSuperAdmin) {
          return reply.status(403).send({
            error: "Forbidden: Only Super Admins can modify the roles of a Super Admin.",
          });
        }

        const canManageRoles =
          authorization.isSuperAdmin ||
          actorRoles.some((r) => r.name.toLowerCase() === "developer");

        if (canManageRoles) {
          const superAdminRole = await prisma.role.findUnique({
            where: { name: "Super Admin" },
          });

          if (!authorization.isSuperAdmin && superAdminRole && data.data.roleIds.includes(superAdminRole.id)) {
            return reply.status(403).send({
              error: "Only Super Admins can assign the Super Admin role.",
            });
          }

          // Protect the last active Super Admin from demotion
          if (
            targetIsSuperAdmin &&
            superAdminRole &&
            !data.data.roleIds.includes(superAdminRole.id)
          ) {
            const activeSuperAdminCount = await prisma.userRole.count({
              where: {
                roleId: superAdminRole.id,
                userId: { not: id },
                user: { banned: false },
              },
            });
            if (activeSuperAdminCount === 0) {
              return reply.status(400).send({
                error:
                  "Protected role: Cannot remove or demote the only active Super Admin in the system.",
              });
            }
          }

          await prisma.userRole.deleteMany({ where: { userId: id } });
          if (data.data.roleIds.length > 0) {
            await prisma.userRole.createMany({
              data: data.data.roleIds.map((roleId) => ({ userId: id, roleId })),
            });
          }
        }
      }

      if (data.data.teamIds !== undefined) {
        await prisma.teamMember.deleteMany({ where: { userId: id } });
        if (data.data.teamIds.length > 0) {
          for (const teamId of data.data.teamIds) {
            await prisma.teamMember.upsert({
              where: { teamId_userId: { teamId, userId: id } },
              create: { teamId, userId: id },
              update: {},
            });
          }
        }
      }

      return reply.send({ user });
    },
  );

  // DELETE /api/users/:id - permanently delete a user
  app.delete(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.DELETE_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const actor = (request as any).user;

      if (actor.id === id) {
        return reply
          .status(400)
          .send({ error: "Cannot delete your own account" });
      }

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      const [actorAuth, targetRoles] = await Promise.all([
        permissionService.getAuthorizationContext(actor.id),
        roleService.getUserRoles(id),
      ]);

      const targetIsSuperAdmin = targetRoles.some(
        (r) => r.name.toLowerCase() === "super admin",
      );

      if (targetIsSuperAdmin) {
        if (!actorAuth.isSuperAdmin) {
          return reply.status(403).send({
            error: "Forbidden: Only Super Admins can delete a Super Admin account.",
          });
        }

        const superAdminRole = await prisma.role.findUnique({
          where: { name: "Super Admin" },
        });

        if (superAdminRole) {
          const remainingSuperAdmins = await prisma.userRole.count({
            where: {
              roleId: superAdminRole.id,
              userId: { not: id },
              user: { banned: false },
            },
          });

          if (remainingSuperAdmins === 0) {
            return reply.status(400).send({
              error:
                "Protected role: Cannot delete the only active Super Admin in the system.",
            });
          }
        }
      }

      await prisma.user.delete({ where: { id } });

      return reply.send({ success: true });
    },
  );

  // POST /api/users/:id/ban - ban a user
  app.post(
    "/:id/ban",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.BAN_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = banUserSchema.safeParse(request.body ?? {});
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      const actor = (request as any).user;
      if (actor.id === id) {
        return reply.status(400).send({ error: "Cannot ban yourself" });
      }

      const [actorAuth, targetRoles] = await Promise.all([
        permissionService.getAuthorizationContext(actor.id),
        roleService.getUserRoles(id),
      ]);

      const targetIsSuperAdmin = targetRoles.some(
        (r) => r.name.toLowerCase() === "super admin",
      );

      if (targetIsSuperAdmin) {
        if (!actorAuth.isSuperAdmin) {
          return reply.status(403).send({
            error: "Forbidden: Only Super Admins can suspend a Super Admin account.",
          });
        }

        const superAdminRole = await prisma.role.findUnique({
          where: { name: "Super Admin" },
        });

        if (superAdminRole) {
          const remainingSuperAdmins = await prisma.userRole.count({
            where: {
              roleId: superAdminRole.id,
              userId: { not: id },
              user: { banned: false },
            },
          });

          if (remainingSuperAdmins === 0) {
            return reply.status(400).send({
              error:
                "Protected role: Cannot suspend the only active Super Admin in the system.",
            });
          }
        }
      }

      await prisma.user.update({
        where: { id },
        data: {
          banned: true,
          bannedAt: new Date(),
          bannedReason: body.data.reason ?? null,
        },
      });

      // Invalidate all active sessions for the banned user
      await prisma.session.deleteMany({ where: { userId: id } });

      return reply.send({ success: true });
    },
  );

  // DELETE /api/users/:id/ban - unban a user
  app.delete(
    "/:id/ban",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.BAN_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      await prisma.user.update({
        where: { id },
        data: { banned: false, bannedAt: null, bannedReason: null },
      });

      return reply.send({ success: true });
    },
  );

  // DELETE /api/users/:id/sessions/:sessionId - admin revokes one session of any user
  app.delete(
    "/:id/sessions/:sessionId",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const { id, sessionId } = request.params as {
        id: string;
        sessionId: string;
      };

      const session = await prisma.session.findFirst({
        where: { id: sessionId, userId: id },
      });

      if (!session) {
        return reply.status(404).send({ error: "Session not found" });
      }

      await prisma.session.delete({ where: { id: sessionId } });

      return reply.send({ success: true });
    },
  );

  // DELETE /api/users/:id/sessions - admin revokes ALL sessions of a user
  app.delete(
    "/:id/sessions",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      await prisma.session.deleteMany({ where: { userId: id } });

      return reply.send({ success: true });
    },
  );
}
