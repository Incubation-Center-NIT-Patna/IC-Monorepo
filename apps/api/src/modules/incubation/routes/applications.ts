import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../../middleware/auth";
import { authorize } from "../../../middleware/rbac";
import { inductionService } from "../induction.service";
import {
  paginationQuerySchema,
  updateApplicationStatusSchema,
} from "./schemas";

export const applicationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/induction/statistics
  app.get(
    "/statistics",
    {
      preHandler: [
        authorize({ permission: InductionPermissions.APPLICATION_READ_ANY }),
      ],
    },
    async (request, reply) => {
      const { teamId } = request.query as { teamId?: string };
      const stats = await inductionService.getStatistics(teamId);
      return reply.send(stats);
    },
  );

  // 2. GET /api/induction/applications
  app.get(
    "/applications",
    {
      preHandler: [
        authorize({ permission: InductionPermissions.APPLICATION_READ_ANY }),
      ],
    },
    async (request, reply) => {
      const parsed = paginationQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const result = await inductionService.listApplications(parsed.data);
      return reply.send(result);
    },
  );

  // 3. GET /api/induction/applications/:id
  app.get(
    "/applications/:id",
    {
      preHandler: [
        authorize({ permission: InductionPermissions.APPLICATION_READ_ANY }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const application = await inductionService.getApplicationById(id);

      if (!application) {
        return reply.status(404).send({ error: "Application not found" });
      }

      return reply.send({ application });
    },
  );

  // 4. PATCH /api/induction/applications/:id/status
  app.patch(
    "/applications/:id/status",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.APPLICATION_UPDATE_STATUS,
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateApplicationStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      const updated = await inductionService.updateApplicationStatus(
        id,
        parsed.data.status,
        parsed.data.notes,
        user.id,
      );

      if (!updated) {
        return reply.status(404).send({ error: "Application not found" });
      }

      return reply.send({ success: true, application: updated });
    },
  );

  // 5. POST /api/induction/applications/:id/create-user
  // Candidate-to-User conversion: Manually initiated by authorized Admin
  app.post(
    "/applications/:id/create-user",
    {
      preHandler: [
        authorize({
          permission: InductionPermissions.APPLICATION_UPDATE_STATUS,
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const actor = (request as any).user;

      try {
        const user = await inductionService.createUserFromCandidate(id, actor);
        return reply.status(201).send({
          success: true,
          message: "User account successfully created for candidate",
          user,
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: err.message || "Failed to create user account from candidate",
        });
      }
    },
  );
};

