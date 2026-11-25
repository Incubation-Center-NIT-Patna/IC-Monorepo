import type { FastifyInstance } from "fastify";

/**
 * Legacy Credential Endpoints - Permanently Disabled
 * Platform policy enforces Google OAuth exclusively.
 */
export async function customRoutes(app: FastifyInstance) {
  app.all("/check-user", async (_request, reply) => {
    return reply.status(403).send({
      error:
        "Phone number lookup is disabled. Authentication is restricted to Google OAuth.",
    });
  });

}
