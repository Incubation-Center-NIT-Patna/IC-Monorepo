import type { FastifyPluginAsync } from "fastify";

/**
 * Account Recovery Routes - Permanently Disabled
 * Platform policy enforces Google OAuth exclusively.
 */
export const recoveryRoutes: FastifyPluginAsync = async (app) => {
  app.all("/request", async (_request, reply) => {
    return reply.status(403).send({
      error:
        "Account recovery is disabled. All users authenticate exclusively via Google OAuth (@nitp.ac.in).",
    });
  });

  app.all("/cooldown", async (_request, reply) => {
    return reply.status(403).send({
      error:
        "OTP cooldown checks are disabled. Phone authentication is not supported.",
    });
  });
};
