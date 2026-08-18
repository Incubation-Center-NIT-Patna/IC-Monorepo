import type { PrismaClient } from "../../generated/prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "super-admin-user@incubationcenter.local";
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "Your_Password_123";
const NAME = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

export async function seedSuperAdmin(prisma: PrismaClient): Promise<void> {
  console.log("\n Seeding Super Admin user...");
  console.log(`   Email : ${EMAIL}`);

  const existing = await prisma.user.findFirst({ where: { email: EMAIL } });

  if (!existing) {
    const localAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });

    const res = await localAuth.api.signUpEmail({
      body: { email: EMAIL, password: PASSWORD, name: NAME },
    });

    // better-auth returns a Response - check status
    if (!res || (res as unknown as Response).status >= 400) {
      const body = res
        ? await (res as unknown as Response).json().catch(() => null)
        : null;
      throw new Error(
        `Failed to create super admin user: ${JSON.stringify(body)}`,
      );
    }

    console.log(`   ✓ Created user`);
  } else {
    console.log(`   ✓ Already exists`);
  }

  const user = await prisma.user.findFirstOrThrow({ where: { email: EMAIL } });

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "Super Admin" },
  });
  if (!superAdminRole) {
    throw new Error(
      "Super Admin role not found - run pnpm db:seed (roles step) first.",
    );
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
    create: { userId: user.id, roleId: superAdminRole.id },
    update: {},
  });

  console.log(`✅ Super Admin ready - login: ${EMAIL} / ${PASSWORD}`);
  console.log("   ⚠  Change the password after first login!\n");
}
