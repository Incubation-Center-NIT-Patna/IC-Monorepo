// Prisma config - env vars are injected by dotenv-cli at the root level
// Run prisma commands from monorepo root: pnpm db:studio / pnpm db:generate / pnpm db:migrate
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
