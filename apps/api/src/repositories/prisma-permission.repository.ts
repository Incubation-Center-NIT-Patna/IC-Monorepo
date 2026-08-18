import type { PrismaClient } from "@repo/database";
import type {
  PermissionDefinition,
  PermissionRepository,
  PermissionAction,
  PermissionScope,
  AuthorizationContext,
} from "@repo/rbac";

export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAuthorizationContext(userId: string): Promise<AuthorizationContext> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
      },

      select: {
        role: {
          select: {
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    resource: true,
                    action: true,
                    scope: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const permissionMap = new Map<string, PermissionDefinition>();
    let isSuperAdmin = false;

    for (const userRole of userRoles) {
      if (userRole.role.name === "Super Admin") {
        isSuperAdmin = true;
      }

      for (const rolePermission of userRole.role.permissions) {
        const permission: PermissionDefinition = {
          resource: rolePermission.permission.resource,

          action: rolePermission.permission.action as PermissionAction,

          scope:
            rolePermission.permission.scope.toLowerCase() as PermissionScope,

          get key() {
            return `${this.resource}:${this.action}:${this.scope}`;
          },
        };

        permissionMap.set(permission.key, permission);
      }
    }

    return {
      permissions: [...permissionMap.values()],
      isSuperAdmin,
    };
  }
}
