import { prisma } from "../../src/index";

import { seedPermissions } from "./permissions";
import { seedRoles } from "./roles";
import { seedSuperAdmin } from "./super-admin";
import { seedEvents } from "./events";
import { seedInduction } from "./induction";
import { seedCms } from "./cms";
import { seedTasks } from "./tasks";

async function main() {
  console.log("==================================");
  console.log("🌱 Starting database seed...");
  console.log("==================================");

  await seedPermissions(prisma);

  await seedRoles(prisma);

  await seedSuperAdmin(prisma);

  await seedEvents(prisma);

  await seedInduction(prisma);

  await seedCms(prisma);

  await seedTasks(prisma);

  console.log("\n🎉 Database seed completed.");
}

main()
  .catch((error) => {
    console.error("\n❌ Database seed failed.");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
