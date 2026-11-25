import type { PrismaClient } from "../../generated/prisma/client";

const SEED_STAFF = [
  {
    email: "madhukark.ug25.cs@nitp.ac.in",
    name: "MADHUKAR KUMAR",
    roleName: "Super Admin",
  },
  {
    email: "mkrmadhukarkumar@gmail.com",
    name: "Madhukar Kumar",
    roleName: "Admin",
  },
];

export async function seedSuperAdmin(prisma: PrismaClient): Promise<void> {
  console.log("\n👑 Seeding Super Admin & Admin users (Passwordless Google OAuth)...");

  const [superAdminRole, adminRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "Super Admin" } }),
    prisma.role.findUnique({ where: { name: "Admin" } }),
  ]);

  if (!superAdminRole || !adminRole) {
    throw new Error(
      "System roles (Super Admin / Admin) not found - run roles seed step first.",
    );
  }

  for (const account of SEED_STAFF) {
    console.log(`   Email : ${account.email} (${account.roleName})`);
    let user = await prisma.user.findFirst({
      where: { email: { equals: account.email, mode: "insensitive" } },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: account.email,
          name: account.name,
          emailVerified: true,
        },
      });
      console.log(`   ✓ Created passwordless user`);
    } else {
      console.log(`   ✓ Already exists`);
    }

    const targetRole =
      account.roleName === "Super Admin" ? superAdminRole : adminRole;

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: targetRole.id } },
      create: { userId: user.id, roleId: targetRole.id },
      update: {},
    });
  }

  console.log(`✅ Super Admin & Admin users ready (Passwordless OAuth)\n`);
}
