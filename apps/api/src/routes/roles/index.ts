import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AllPermissions, RolePermissions } from "@repo/rbac";
import { prisma } from "@repo/database";

import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { roleService } from "../../rbac";

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z
    .array(
      z.object({
        resource: z.string(),
        action: z.string(),
        scope: z.enum(["own", "any"]),
      }),
    )
    .optional(),
  permissionKeys: z.array(z.string()).optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z
    .array(
      z.object({
        resource: z.string(),
        action: z.string(),
        scope: z.enum(["own", "any"]),
      }),
    )
    .optional(),
  permissionKeys: z.array(z.string()).optional(),
});

export async function rolesRoutes(app: FastifyInstance) {
  // GET /api/roles/permissions - canonical permission registry for role editors
  app.get(
    "/permissions",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.READ_ANY }),
      ],
    },
    async (_request, reply) => {
      return reply.send({
        permissions: AllPermissions.map((permission) => ({
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
          key: permission.key,
        })),
      });
    },
  );

  // GET /api/roles
  app.get(
    "/",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.READ_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const roles = await roleService.listRoles();
        return reply.send({ roles });
      } catch (err: any) {
        return reply.status(500).send({ error: err.message });
      }
    },
  );

  // GET /api/roles/:id
  app.get(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.READ_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const role = await roleService.getRole(id);
        if (!role) {
          return reply.status(404).send({ error: "Role not found" });
        }
        return reply.send({ role });
      } catch (err: any) {
        return reply.status(500).send({ error: err.message });
      }
    },
  );

  // POST /api/roles - Create customizable custom role
  app.post(
    "/",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.CREATE_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const data = createRoleSchema.parse(request.body);

        // Check if role name already exists
        const existing = await prisma.role.findFirst({
          where: { name: { equals: data.name.trim(), mode: "insensitive" } },
        });
        if (existing) {
          return reply.status(409).send({ error: `A role named "${data.name}" already exists.` });
        }

        const role = await prisma.$transaction(async (tx: any) => {
          const created = await tx.role.create({
            data: {
              id: crypto.randomUUID(),
              name: data.name.trim(),
              description: data.description || "",
              isSystem: false,
            },
          });

          const keysToMatch: string[] = [
            ...(data.permissionKeys || []),
            ...(data.permissions ? data.permissions.map((p) => `${p.resource}:${p.action}:${p.scope}`) : []),
          ];

          if (keysToMatch.length > 0) {
            const dbPerms = await tx.permission.findMany();
            const permIdsToConnect: string[] = [];
            for (const key of keysToMatch) {
              const matched = dbPerms.find((p: any) => `${p.resource}:${p.action}:${p.scope.toLowerCase()}` === key);
              if (matched) {
                permIdsToConnect.push(matched.id);
              }
            }
            if (permIdsToConnect.length > 0) {
              await tx.rolePermission.createMany({
                data: permIdsToConnect.map((pId) => ({
                  roleId: created.id,
                  permissionId: pId,
                })),
              });
            }
          }

          const full = await tx.role.findUnique({
            where: { id: created.id },
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          });

          return {
            id: full.id,
            name: full.name,
            description: full.description,
            isSystem: full.isSystem,
            permissions: (full.permissions || []).map((rp: any) => ({
              resource: rp.permission.resource,
              action: rp.permission.action,
              scope: rp.permission.scope,
              key: `${rp.permission.resource}:${rp.permission.action}:${rp.permission.scope.toLowerCase()}`,
            })),
          };
        });

        return reply.status(201).send({ role });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // PUT /api/roles/:id - Update customizable role metadata & permissions
  app.put(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = updateRoleSchema.parse(request.body);

        const existing = await prisma.role.findUnique({ where: { id } });
        if (!existing) {
          return reply.status(404).send({ error: "Role not found" });
        }

        if (existing.name === "Super Admin" && data.name && data.name !== "Super Admin") {
          return reply.status(400).send({ error: "Super Admin role name cannot be modified." });
        }

        const role = await prisma.$transaction(async (tx: any) => {
          await tx.role.update({
            where: { id },
            data: {
              ...(data.name ? { name: data.name.trim() } : {}),
              ...(data.description !== undefined ? { description: data.description } : {}),
            },
          });

          const keysToMatch: string[] = [
            ...(data.permissionKeys || []),
            ...(data.permissions ? data.permissions.map((p) => `${p.resource}:${p.action}:${p.scope}`) : []),
          ];

          if (data.permissionKeys !== undefined || data.permissions !== undefined) {
            await tx.rolePermission.deleteMany({ where: { roleId: id } });
            if (keysToMatch.length > 0) {
              const dbPerms = await tx.permission.findMany();
              const permIdsToConnect: string[] = [];
              for (const key of keysToMatch) {
                const matched = dbPerms.find((p: any) => `${p.resource}:${p.action}:${p.scope.toLowerCase()}` === key);
                if (matched) {
                  permIdsToConnect.push(matched.id);
                }
              }
              if (permIdsToConnect.length > 0) {
                await tx.rolePermission.createMany({
                  data: permIdsToConnect.map((pId) => ({
                    roleId: id,
                    permissionId: pId,
                  })),
                });
              }
            }
          }

          const full = await tx.role.findUnique({
            where: { id },
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          });

          return {
            id: full.id,
            name: full.name,
            description: full.description,
            isSystem: full.isSystem,
            permissions: (full.permissions || []).map((rp: any) => ({
              resource: rp.permission.resource,
              action: rp.permission.action,
              scope: rp.permission.scope,
              key: `${rp.permission.resource}:${rp.permission.action}:${rp.permission.scope.toLowerCase()}`,
            })),
          };
        });

        return reply.send({ role });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // DELETE /api/roles/:id - Delete custom role (protect system roles)
  app.delete(
    "/:id",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.DELETE_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        const existing = await prisma.role.findUnique({ where: { id } });
        if (!existing) {
          return reply.status(404).send({ error: "Role not found" });
        }

        const SYSTEM_ROLES = ["Super Admin", "Admin", "Member", "Developer"];
        if (existing.isSystem || SYSTEM_ROLES.includes(existing.name)) {
          return reply.status(400).send({
            error: `Role "${existing.name}" is a protected core system role and cannot be deleted.`,
          });
        }

        // Find fallback Member role for reassignment of any existing users
        const memberRole = await prisma.role.findUnique({ where: { name: "Member" } });

        await prisma.$transaction(async (tx: any) => {
          // Reassign users with this role to Member role if they have no other roles
          if (memberRole) {
            const usersWithRole = await tx.userRole.findMany({ where: { roleId: id } });
            for (const ur of usersWithRole) {
              const otherRoles = await tx.userRole.count({
                where: { userId: ur.userId, roleId: { not: id } },
              });
              if (otherRoles === 0) {
                await tx.userRole.create({
                  data: { userId: ur.userId, roleId: memberRole.id },
                });
              }
            }
          }
          await tx.userRole.deleteMany({ where: { roleId: id } });
          await tx.rolePermission.deleteMany({ where: { roleId: id } });
          await tx.role.delete({ where: { id } });
        });

        return reply.send({ success: true, message: `Role "${existing.name}" deleted successfully.` });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // POST /api/roles/:id/users
  app.post(
    "/:id/users",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.ASSIGN_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { userId } = request.body as { userId: string };

        if (!userId) {
          return reply.status(400).send({ error: "userId is required" });
        }

        await roleService.assignRole(userId, id);
        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // DELETE /api/roles/:id/users/:userId
  app.delete(
    "/:id/users/:userId",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.ASSIGN_ANY }),
      ],
    },
    async (request, reply) => {
      try {
        const { id, userId } = request.params as { id: string; userId: string };
        await roleService.removeRole(userId, id);
        return reply.send({ success: true });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // PUT /api/roles/:id/permissions - update permissions assigned to a role
  app.put(
    "/:id/permissions",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: RolePermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { permissionKeys: string[] };

      if (!body || !Array.isArray(body.permissionKeys)) {
        return reply
          .status(400)
          .send({ error: "permissionKeys array is required" });
      }

      const role = await prisma.role.findUnique({ where: { id } });
      if (!role) {
        return reply.status(404).send({ error: "Role not found" });
      }

      if (role.name === "Super Admin") {
        return reply.status(400).send({
          error:
            "Super Admin inherently possesses all permissions and cannot be modified.",
        });
      }

      const permissionsToAssign: string[] = [];
      for (const key of body.permissionKeys) {
        const parts = key.split(":");
        if (parts.length === 3) {
          const [resource, action, scope] = parts;
          const perm = await prisma.permission.findFirst({
            where: {
              resource,
              action,
              scope: scope as any,
            },
          });
          if (perm) {
            permissionsToAssign.push(perm.id);
          }
        }
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionsToAssign.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionsToAssign.map((pId) => ({
              roleId: id,
              permissionId: pId,
            })),
          });
        }
      });

      const actor = (request as any).user;
      await prisma.systemActivityLog.create({
        data: {
          userId: actor.id,
          userName: actor.name || "Admin",
          userRole: actor.role || "Admin",
          action: `Updated permissions for role "${role.name}" (${permissionsToAssign.length} permissions assigned)`,
          category: "Roles",
          type: "admin-action",
          status: "Completed",
        },
      });

      (request as any).activityLogged = true;

      return reply.send({
        success: true,
        message: `Permissions updated for role ${role.name}`,
        assignedCount: permissionsToAssign.length,
      });
    },
  );
}
