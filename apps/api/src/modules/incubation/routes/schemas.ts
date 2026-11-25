import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"]).optional(),
  sortBy: z.enum(["createdAt", "name", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"]),
  notes: z.string().optional(),
});

export const assignInterviewerSchema = z.object({
  applicationId: z.string().min(1),
  roundId: z.string().min(1),
  interviewerId: z.string().min(1),
  conductAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const evaluationScoreItemSchema = z.object({
  parameterId: z.string().min(1),
  rawScore: z.number().min(1).max(5),
});

export const submitEvaluationSchema = z.object({
  scores: z.array(evaluationScoreItemSchema).min(1),
  notes: z.string().optional(),
  feedbackTags: z.array(z.string()).default([]),
  recommendation: z.string().optional(),
  isFinal: z.boolean().default(false),
});

export const createRoundSchema = z.object({
  roundName: z.string().min(1).max(100),
  roundNumber: z.coerce.number().int().min(1),
  duration: z.coerce.number().int().min(1).default(15),
});

export const updateRoundSchema = z.object({
  roundName: z.string().min(1).max(100).optional(),
  roundNumber: z.coerce.number().int().min(1).optional(),
  duration: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
});

export const parameterInputSchema = z.object({
  id: z.string().min(1).optional(),
  parameterName: z.string().min(1).max(100),
  weighttage: z.coerce.number().int().min(1).max(100),
});

export const saveParametersSchema = z.object({
  parameters: z.array(parameterInputSchema).min(1),
});

export const createInductionAccountSchema = z.object({
  userId: z.string().min(1),
  type: z.enum([
    "INTERVIEWER",
    "EVALUATOR",
    "TEAM_COORDINATOR",
    "INDUCTION_VOLUNTEER",
    "REVIEWER",
  ]),
  teamId: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateInductionAccountSchema = z.object({
  type: z
    .enum([
      "INTERVIEWER",
      "EVALUATOR",
      "TEAM_COORDINATOR",
      "INDUCTION_VOLUNTEER",
      "REVIEWER",
    ])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
  teamId: z.string().min(1).nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
