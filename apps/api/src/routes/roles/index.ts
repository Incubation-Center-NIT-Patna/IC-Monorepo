import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AllPermissions, RolePermissions } from "@repo/rbac";

import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { roleService } from "../../rbac";

const createRoleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
      scope: z.enum(["own", "any"]),
    }),
  ),
});

const updateRoleSchema = createRoleSchema.partial();

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

  // POST /api/roles
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

        const role = await roleService.createRole({
          name: data.name,
          description: data.description || "",
          isSystem: false, // Cannot create system roles via API
          permissions: data.permissions as any,
        });

        return reply.send({ role });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // PUT /api/roles/:id
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

        // Ensure isSystem cannot be modified
        const updateData = {
          ...data,
          isSystem: undefined,
        };

        const role = await roleService.updateRole(id, updateData as any);
        return reply.send({ role });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // DELETE /api/roles/:id
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
        await roleService.deleteRole(id);
        return reply.send({ success: true });
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
}
