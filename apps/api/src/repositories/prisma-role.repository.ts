import type { PrismaClient } from "@repo/database";
import type { RoleRepository, RoleDefinition, Role } from "@repo/rbac";

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createRole(role: RoleDefinition): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: {
          create: role.permissions.map((p) => ({
            permission: {
              connect: {
                resource_action_scope: {
                  resource: p.resource,
                  action: p.action,
                  scope: p.scope.toLowerCase() as any,
                },
              },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToRole(created);
  }

  async updateRole(id: string, role: Partial<RoleDefinition>): Promise<Role> {
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        ...(role.permissions && {
          permissions: {
            deleteMany: {},
            create: role.permissions.map((p) => ({
              permission: {
                connect: {
                  resource_action_scope: {
                    resource: p.resource,
                    action: p.action,
                    scope: p.scope.toLowerCase() as any,
                  },
                },
              },
            })),
          },
        }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToRole(updated);
  }

  async deleteRole(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async getRole(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return null;
    return this.mapToRole(role);
  }

  async listRoles(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles.map(this.mapToRole);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      create: {
        userId,
        roleId,
      },
      update: {},
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return userRoles.map((ur) => this.mapToRole(ur.role));
  }

  private mapToRole(role: any): Role {
    const permissions = role.permissions.map((rp: any) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.permission.scope.toLowerCase(),
      get key() {
        return `${this.resource}:${this.action}:${this.scope}`;
      },
    }));

    return {
      id: role.id,
      name: role.name,
      description: role.description || "",
      isSystem: role.isSystem,
      permissions,
      isSuperAdmin: role.name === "Super Admin",
    };
  }
}
