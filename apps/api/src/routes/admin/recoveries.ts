import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";
import { UserPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const adminRecoveryRoutes: FastifyPluginAsync = async (app) => {
  // 1. Get all pending or flagged recoveries
  app.get(
    "/recoveries",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.READ_ANY }),
      ],
    },
    async (_request, reply) => {
      const recoveries = await prisma.accountRecoveryRequest.findMany({
        where: {
          status: {
            in: ["PENDING", "FLAGGED_SPAM"],
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.send({ data: recoveries });
    },
  );

  // 2. Resolve a recovery request
  app.post(
    "/recoveries/:id/resolve",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const schemaParams = z.object({ id: z.string() });
      const schemaBody = z.object({ status: z.enum(["RESOLVED", "REJECTED"]) });

      const paramsParsed = schemaParams.safeParse(request.params);
      const bodyParsed = schemaBody.safeParse(request.body);

      if (!paramsParsed.success || !bodyParsed.success) {
        return reply.status(400).send({ error: "Invalid parameters or body" });
      }

      const { id } = paramsParsed.data;
      const { status } = bodyParsed.data;

      await prisma.accountRecoveryRequest.update({
        where: { id },
        data: { status },
      });

      return reply.send({ success: true });
    },
  );

  // 3. Reset OTP cooldown
  app.post(
    "/cooldown/reset",
    {
      preHandler: [
        requireAuth,
        authorize({ permission: UserPermissions.UPDATE_ANY }),
      ],
    },
    async (request, reply) => {
      const schema = z.object({ phoneNumber: z.string() });
      const parsed = schema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({ error: "Invalid request body" });
      }

      const { phoneNumber } = parsed.data;

      try {
        await prisma.otpCooldown.delete({
          where: { phoneNumber },
        });
      } catch (error) {
        // Ignore if not found
      }

      return reply.send({ success: true });
    },
  );
};
