import { prisma } from "../../src/index";
async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error("No users found.");
  }

  const adminRole = await prisma.role.findUnique({
    where: {
      name: "Admin",
    },
  });

  if (!adminRole) {
    throw new Error("Admin role not found.");
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },

    create: {
      userId: user.id,
      roleId: adminRole.id,
    },

    update: {},
  });

  console.log("✅ Admin role assigned.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
