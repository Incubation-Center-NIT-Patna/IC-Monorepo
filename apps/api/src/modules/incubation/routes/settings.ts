import type { FastifyPluginAsync } from "fastify";
import { InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../../middleware/auth";
import { authorize } from "../../../middleware/rbac";
import { inductionService } from "../induction.service";
import {
  createRoundSchema,
  updateRoundSchema,
  saveParametersSchema,
} from "./schemas";

export const settingsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/induction/teams
  app.get(
    "/teams",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_READ,
        }),
      ],
    },
    async (_request, reply) => {
      const teams = await inductionService.listTeamsWithRounds();
      return reply.send({ teams });
    },
  );

  // 2. GET /api/induction/teams/:teamId/rounds
  app.get(
    "/teams/:teamId/rounds",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_READ,
        }),
      ],
    },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      const rounds = await inductionService.getTeamRounds(teamId);
      return reply.send({ rounds });
    },
  );

  // 3. POST /api/induction/teams/:teamId/rounds
  app.post(
    "/teams/:teamId/rounds",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_UPDATE,
        }),
      ],
    },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      const parsed = createRoundSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const round = await inductionService.createRound(
          teamId,
          parsed.data,
          user.id,
        );
        return reply.status(201).send({ success: true, round });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 4. PUT /api/induction/rounds/:roundId
  app.put(
    "/rounds/:roundId",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_UPDATE,
        }),
      ],
    },
    async (request, reply) => {
      const { roundId } = request.params as { roundId: string };
      const parsed = updateRoundSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const round = await inductionService.updateRound(
          roundId,
          parsed.data,
          user.id,
        );
        return reply.send({ success: true, round });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 5. DELETE /api/induction/rounds/:roundId
  app.delete(
    "/rounds/:roundId",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_UPDATE,
        }),
      ],
    },
    async (request, reply) => {
      const { roundId } = request.params as { roundId: string };
      const user = (request as any).user;
      try {
        const round = await inductionService.deleteRound(roundId, user.id);
        return reply.send({ success: true, round });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 6. POST /api/induction/rounds/:roundId/parameters
  app.post(
    "/rounds/:roundId/parameters",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_UPDATE,
        }),
      ],
    },
    async (request, reply) => {
      const { roundId } = request.params as { roundId: string };
      const parsed = saveParametersSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const parameters = await inductionService.saveParameters(
          roundId,
          parsed.data.parameters,
          user.id,
        );
        return reply.send({ success: true, parameters });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 7. DELETE /api/induction/parameters/:id
  app.delete(
    "/parameters/:id",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_UPDATE,
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      try {
        const parameter = await inductionService.deleteParameter(id, user.id);
        return reply.send({ success: true, parameter });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 8. GET /api/induction/activity-logs
  app.get(
    "/activity-logs",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.SETTINGS_READ,
        }),
      ],
    },
    async (request, reply) => {
      const { page, limit, action } = request.query as {
        page?: string;
        limit?: string;
        action?: string;
      };

      const logs = await inductionService.listActivityLogs({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50,
        action,
      });

      return reply.send(logs);
    },
  );
};

