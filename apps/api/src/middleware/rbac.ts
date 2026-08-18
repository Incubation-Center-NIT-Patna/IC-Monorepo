import type { FastifyRequest, FastifyReply } from "fastify";
import type { PermissionDefinition } from "@repo/rbac";
import { permissionService } from "../rbac";

export interface AuthorizeOptions {
  all?: PermissionDefinition[];
  any?: PermissionDefinition[];
  permission?: PermissionDefinition;
}

export function authorize(options: AuthorizeOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    if (options.all && options.all.length > 0) {
      const allowed = await permissionService.hasAllPermissions({
        userId: user.id,
        permissions: options.all,
      });

      if (!allowed) {
        return reply
          .status(403)
          .send({ error: "Forbidden: Missing required permissions" });
      }
    }

    if (options.any && options.any.length > 0) {
      const allowed = await permissionService.hasAnyPermission({
        userId: user.id,
        permissions: options.any,
      });

      if (!allowed) {
        return reply
          .status(403)
          .send({ error: "Forbidden: Missing required permission" });
      }
    }

    if (options.permission) {
      const allowed = await permissionService.hasPermission({
        userId: user.id,
        permission: options.permission,
      });

      if (!allowed) {
        return reply
          .status(403)
          .send({ error: "Forbidden: Missing required permission" });
      }
    }
  };
}
