import type { PrismaClient } from "../../generated/prisma/client";

import { AllPermissions, SystemRoles } from "@repo/rbac";

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  console.log("\n Seeding system roles...");

  for (const roleDefinition of SystemRoles) {
    // Upsert role
    const role = await prisma.role.upsert({
      where: {
        name: roleDefinition.name,
      },

      create: {
        name: roleDefinition.name,
        description: roleDefinition.description,
        isSystem: roleDefinition.isSystem,
      },

      update: {
        description: roleDefinition.description,
        isSystem: roleDefinition.isSystem,
      },
    });

    // Remove existing mappings
    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
      },
    });

    const permissions = roleDefinition.isSuperAdmin
      ? AllPermissions
      : roleDefinition.permissions;

    for (const permission of permissions) {
      const dbPermission = await prisma.permission.findUnique({
        where: {
          resource_action_scope: {
            resource: permission.resource,
            action: permission.action,
            scope: permission.scope,
          },
        },
      });

      if (!dbPermission) {
        throw new Error(
          `Permission not found: ${permission.resource}:${permission.action}:${permission.scope}`,
        );
      }

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: dbPermission.id,
        },
      });
    }

    console.log(`   ✓ ${role.name}`);
  }

  console.log("✅ System roles seeded.");
}
