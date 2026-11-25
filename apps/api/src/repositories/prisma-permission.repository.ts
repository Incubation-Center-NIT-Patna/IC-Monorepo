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
    const [userRoles, teamMemberships] = await Promise.all([
      this.prisma.userRole.findMany({
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
      }),
      this.prisma.teamMember.findMany({
        where: {
          userId,
        },
        select: {
          team: {
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
              roles: {
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
              },
            },
          },
        },
      }),
    ]);

    const permissionMap = new Map<string, PermissionDefinition>();
    let isSuperAdmin = false;

    const addPerm = (p: { resource: string; action: string; scope: string }) => {
      const permission: PermissionDefinition = {
        resource: p.resource,
        action: p.action as PermissionAction,
        scope: p.scope.toLowerCase() as PermissionScope,
        get key() {
          return `${this.resource}:${this.action}:${this.scope}`;
        },
      };
      permissionMap.set(permission.key, permission);
    };

    // 1. Direct User Roles
    for (const userRole of userRoles) {
      if (userRole.role.name === "Super Admin") {
        isSuperAdmin = true;
      }

      for (const rolePermission of userRole.role.permissions) {
        addPerm(rolePermission.permission);
      }
    }

    // 2. Team-Based Roles & Permissions (TBAC)
    for (const tm of teamMemberships) {
      // 2a. Direct Team Permissions (e.g. Media Team -> Gallery)
      for (const tp of tm.team.permissions) {
        addPerm(tp.permission);
      }

      // 2b. Team Roles
      for (const tr of tm.team.roles) {
        if (tr.role.name === "Super Admin") {
          isSuperAdmin = true;
        }
        for (const rp of tr.role.permissions) {
          addPerm(rp.permission);
        }
      }
    }

    return {
      permissions: [...permissionMap.values()],
      isSuperAdmin,
    };
  }
}
