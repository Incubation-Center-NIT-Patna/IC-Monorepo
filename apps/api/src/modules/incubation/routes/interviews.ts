import type { FastifyPluginAsync } from "fastify";
import { InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../../middleware/auth";
import { authorize } from "../../../middleware/rbac";
import { inductionService } from "../induction.service";
import { permissionService } from "../../../rbac";
import {
  assignInterviewerSchema,
  submitEvaluationSchema,
} from "./schemas";

export const interviewRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/induction/interviews
  app.get(
    "/interviews",
    {
      preHandler: [
        authorize({
          any: [
            InductionPermissions.EVALUATION_READ_ANY,
            InductionPermissions.EVALUATION_READ_OWN,
          ],
        }),
      ],
    },
    async (request, reply) => {
      const user = (request as any).user;
      const { applicationId, roundId, interviewerId } = request.query as {
        applicationId?: string;
        roundId?: string;
        interviewerId?: string;
      };

      const authCtx = await permissionService.getAuthorizationContext(user.id);
      const isGlobal =
        authCtx.isSuperAdmin ||
        authCtx.permissions.some(
          (p) => p.key === InductionPermissions.EVALUATION_READ_ANY.key,
        );

      const filterInterviewerId = isGlobal ? interviewerId : user.id;

      const interviews = await inductionService.listInterviews({
        applicationId,
        roundId,
        interviewerId: filterInterviewerId,
      });

      return reply.send({ interviews });
    },
  );

  // 2. POST /api/induction/interviews (Assign Interviewer)
  app.post(
    "/interviews",
    {
      preHandler: [
        authorize({ permission: InductionPermissions.INTERVIEWER_ASSIGN }),
      ],
    },
    async (request, reply) => {
      const parsed = assignInterviewerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = (request as any).user;
      try {
        const interview = await inductionService.assignInterviewer(
          parsed.data,
          user.id,
        );
        return reply.status(201).send({ success: true, interview });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  // 3. GET /api/induction/interviews/:id
  app.get(
    "/interviews/:id",
    {
      preHandler: [
        authorize({
          any: [
            InductionPermissions.EVALUATION_READ_ANY,
            InductionPermissions.EVALUATION_READ_OWN,
          ],
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;

      const interview = await inductionService.getInterviewById(id);
      if (!interview) {
        return reply.status(404).send({ error: "Interview not found" });
      }

      // Check IDOR if scoped to own
      const authCtx = await permissionService.getAuthorizationContext(user.id);
      const isGlobal =
        authCtx.isSuperAdmin ||
        authCtx.permissions.some(
          (p) => p.key === InductionPermissions.EVALUATION_READ_ANY.key,
        );

      if (!isGlobal && interview.InterviewerId !== user.id) {
        return reply
          .status(403)
          .send({ error: "Forbidden: You are not assigned to this interview" });
      }

      return reply.send({ interview });
    },
  );

  // 4. POST /api/induction/interviews/:id/evaluate (Submit / Save Draft Evaluation)
  app.post(
    "/interviews/:id/evaluate",
    {
      preHandler: [
        authorize({
          any: [
            InductionPermissions.EVALUATION_CREATE_ANY,
            InductionPermissions.EVALUATION_CREATE_OWN,
            InductionPermissions.EVALUATION_UPDATE_ANY,
            InductionPermissions.EVALUATION_UPDATE_OWN,
          ],
        }),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;

      const parsed = submitEvaluationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const interview = await inductionService.getInterviewById(id);
      if (!interview) {
        return reply.status(404).send({ error: "Interview not found" });
      }

      // IDOR guard: check ownership if not super admin / admin
      const authCtx = await permissionService.getAuthorizationContext(user.id);
      const isGlobal =
        authCtx.isSuperAdmin ||
        authCtx.permissions.some(
          (p) =>
            p.key === InductionPermissions.EVALUATION_CREATE_ANY.key ||
            p.key === InductionPermissions.EVALUATION_UPDATE_ANY.key,
        );

      if (!isGlobal && interview.InterviewerId !== user.id) {
        return reply.status(403).send({
          error: "Forbidden: You can only evaluate candidates assigned to you",
        });
      }

      try {
        const result = await inductionService.submitEvaluation(
          id,
          parsed.data,
          user.id,
        );
        return reply.send({ success: true, ...result });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
};

