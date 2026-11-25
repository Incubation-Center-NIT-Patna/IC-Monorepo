import type { FastifyPluginAsync } from "fastify";
import { applicationRoutes } from "./applications";
import { interviewRoutes } from "./interviews";
import { settingsRoutes } from "./settings";
import { accountRoutes } from "./accounts";

export const inductionRoutes: FastifyPluginAsync = async (app) => {
  await app.register(applicationRoutes);
  await app.register(interviewRoutes);
  await app.register(settingsRoutes);
  await app.register(accountRoutes);
};

