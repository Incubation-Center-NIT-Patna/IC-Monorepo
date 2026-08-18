import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/database";

export const recoveryRoutes: FastifyPluginAsync = async (app) => {
  // 1. Request Account Recovery
  app.post("/request", async (request, reply) => {
    const schema = z.object({
      phoneNumber: z.string(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request body" });
    }

    const { phoneNumber } = parsed.data;

    // Check if user has exceeded max requests in the last 24 hours
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingRequest = await prisma.accountRecoveryRequest.findFirst({
      where: {
        phoneNumber,
        windowStart: { gte: windowStart },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingRequest) {
      if (existingRequest.requestCount > 10) {
        // Short-circuit to prevent excessive DB updates during a spam attack
        return reply.send({ success: true });
      }

      const newCount = existingRequest.requestCount + 1;
      let newStatus = existingRequest.status;
      if (newCount >= 3) {
        newStatus = "FLAGGED_SPAM";
      }

      await prisma.accountRecoveryRequest.update({
        where: { id: existingRequest.id },
        data: {
          requestCount: newCount,
          status: newStatus,
        },
      });

      return reply.send({ success: true });
    }

    // Create new request
    await prisma.accountRecoveryRequest.create({
      data: {
        phoneNumber,
        status: "PENDING",
        requestCount: 1,
        windowStart: new Date(),
      },
    });

    return reply.send({ success: true });
  });

  // 2. Check Cooldown Status
  app.get("/cooldown", async (request, reply) => {
    const schema = z.object({
      phoneNumber: z.string(),
    });

    const parsed = schema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query parameters" });
    }

    const { phoneNumber } = parsed.data;

    const cooldown = await prisma.otpCooldown.findUnique({
      where: { phoneNumber },
    });

    if (!cooldown) {
      return reply.send({ active: false, remainingSeconds: 0 });
    }

    const remaining = Math.floor(
      (cooldown.expiresAt.getTime() - Date.now()) / 1000,
    );
    if (remaining > 0) {
      return reply.send({ active: true, remainingSeconds: remaining });
    }

    // Expired
    await prisma.otpCooldown.delete({ where: { phoneNumber } });
    return reply.send({ active: false, remainingSeconds: 0 });
  });
};
