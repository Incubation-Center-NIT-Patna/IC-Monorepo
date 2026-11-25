import type { FastifyPluginAsync } from "fastify";
import { InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../../middleware/auth";
import { authorize } from "../../../middleware/rbac";
import { inductionService } from "../induction.service";
import {
  createInductionAccountSchema,
  updateInductionAccountSchema,
} from "./schemas";

export const accountRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/induction/accounts
  app.get(
    "/accounts",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.ACCOUNT_READ_ANY,
        }),
      ],
    },
    async (_request, reply) => {
      const accounts = await inductionService.listInductionAccounts();
      return reply.send({ accounts });
    },
  );

  // 2. POST /api/induction/accounts
  app.post(
    "/accounts",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.ACCOUNT_CREATE_ANY,
        }),
      ],
    },
    async (request, reply) => {
      const parsed = createInductionAccountSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const account = await inductionService.createInductionAccount(
          parsed.data,
          user.id,
        );
        return reply.status(201).send({ success: true, account });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 3. PATCH /api/induction/accounts/:id
  app.patch(
    "/accounts/:id",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.ACCOUNT_UPDATE_ANY,
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateInductionAccountSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const account = await inductionService.updateInductionAccount(
          id,
          parsed.data,
          user.id,
        );
        return reply.send({ success: true, account });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
};

