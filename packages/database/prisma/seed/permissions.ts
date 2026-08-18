import type { PrismaClient } from "../../generated/prisma/client";
import { AllPermissions } from "@repo/rbac";

export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  console.log("\n Seeding permissions...");

  for (const permission of AllPermissions) {
    await prisma.permission.upsert({
      where: {
        resource_action_scope: {
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
        },
      },
      create: {
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
      },
      update: {
        // Nothing to update if it exists
      },
    });
  }

  console.log("✅ Permissions seeded.");
}
