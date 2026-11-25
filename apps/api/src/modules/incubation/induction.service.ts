import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";

export class InductionService {
  /**
   * Get induction dashboard summary statistics
   */
  async getStatistics(teamId?: string) {
    const where: Prisma.ApplicationWhereInput = teamId ? { teamId } : {};

    const [total, pending, shortlisted, accepted, rejected, totalInterviews] =
      await Promise.all([
        prisma.application.count({ where }),
        prisma.application.count({ where: { ...where, currentStatus: "PENDING" } }),
        prisma.application.count({
          where: { ...where, currentStatus: "SHORTLISTED" },
        }),
        prisma.application.count({
          where: { ...where, currentStatus: "ACCEPTED" },
        }),
        prisma.application.count({
          where: { ...where, currentStatus: "REJECTED" },
        }),
        prisma.interview.count({
          where: teamId ? { round: { teamId } } : {},
        }),
      ]);

    return {
      total,
      pending,
      shortlisted,
      accepted,
      rejected,
      totalInterviews,
      // Map to frontend expected labels
      inReview: pending,
      interviewed: shortlisted,
      selected: accepted,
    };
  }

  /**
   * List candidate applications with search, filters, pagination
   */
  async listApplications(params: {
    page: number;
    limit: number;
    search?: string;
    teamId?: string;
    status?: "PENDING" | "SHORTLISTED" | "ACCEPTED" | "REJECTED";
    sortBy?: "createdAt" | "name" | "priority";
    sortOrder?: "asc" | "desc";
  }) {
    const {
      page,
      limit,
      search,
      teamId,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    if (teamId) {
      where.teamId = teamId;
    }

    if (status) {
      where.currentStatus = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { candidate: { name: { contains: term, mode: "insensitive" } } },
        { candidate: { email: { contains: term, mode: "insensitive" } } },
        { candidate: { rollNumber: { contains: term, mode: "insensitive" } } },
        { candidate: { branch: { contains: term, mode: "insensitive" } } },
        { student: { name: { contains: term, mode: "insensitive" } } },
        { student: { email: { contains: term, mode: "insensitive" } } },
        { student: { phoneNumber: { contains: term } } },
        { team: { name: { contains: term, mode: "insensitive" } } },
      ];
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput =
      sortBy === "name"
        ? { candidate: { name: sortOrder } }
        : sortBy === "priority"
        ? { priority: sortOrder }
        : { createdAt: sortOrder };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          candidate: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              image: true,
              studentProfile: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          interviews: {
            include: {
              interviewer: { select: { id: true, name: true, email: true } },
              round: { select: { id: true, roundName: true, roundNumber: true } },
              interviewEvaluations: {
                include: {
                  parameter: true,
                },
              },
            },
            orderBy: { conductAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    // Format for frontend convenience
    const formatted = applications.map((app) => {
      const latestInterview = app.interviews[0] || null;
      let calculatedScore = 0;
      let hasScores = false;

      if (latestInterview && latestInterview.interviewEvaluations.length > 0) {
        let weightedSum = 0;
        let totalWeight = 0;
        latestInterview.interviewEvaluations.forEach((ie) => {
          const weight = ie.parameter.weighttage || 1;
          weightedSum += ie.rawScore * weight;
          totalWeight += weight;
        });
        if (totalWeight > 0) {
          calculatedScore = Math.round((weightedSum / totalWeight / 5.0) * 100);
          hasScores = true;
        }
      }

      const candName = app.candidate?.name || app.student?.name || "Unnamed Candidate";
      const candEmail = app.candidate?.email || app.student?.email || "";
      const candPhone = app.candidate?.phone || app.student?.phoneNumber || "";
      const candRollNo = app.candidate?.rollNumber || app.student?.studentProfile?.rollNumber || "N/A";
      const candBranch = app.candidate?.branch || app.student?.studentProfile?.branch || "General";
      const isUserCreated = Boolean(app.candidate?.linkedUserId || app.studentId);

      return {
        id: app.id,
        applicationId: app.id,
        candidateId: app.candidate?.id || null,
        studentId: app.student?.id || app.candidate?.linkedUserId || null,
        name: candName,
        email: candEmail,
        phoneNumber: candPhone,
        rollNo: candRollNo,
        branch: candBranch,
        domain: app.team.name,
        teamId: app.team.id,
        priority: app.priority,
        isUserCreated,
        linkedUserId: app.candidate?.linkedUserId || app.studentId || null,
        userCreatedAt: app.candidate?.userCreatedAt || null,
        userCreatedById: app.candidate?.userCreatedById || null,
        status:
          app.currentStatus === "ACCEPTED"
            ? "Selected"
            : app.currentStatus === "SHORTLISTED"
            ? "Interviewed"
            : app.currentStatus === "REJECTED"
            ? "Rejected"
            : "In Review",
        rawStatus: app.currentStatus,
        score: hasScores ? calculatedScore : 0,
        evaluator: latestInterview?.interviewer?.name || "Pending Evaluation",
        evaluatorId: latestInterview?.interviewer?.id || null,
        activeInterviewId: latestInterview?.id || null,
        notes: latestInterview?.interviewNotes || "",
        selectedTags: latestInterview?.feedbackTags || [],
        recommendation: latestInterview?.recommendation || null,
        submittedAt: app.createdAt.toISOString(),
      };
    });

    return {
      candidates: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single application details
   */
  async getApplicationById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
            studentProfile: true,
          },
        },
        team: {
          include: {
            interviewRounds: {
              where: { active: true },
              orderBy: { roundNumber: "asc" },
              include: {
                evaluationParameters: true,
              },
            },
          },
        },
        interviews: {
          include: {
            interviewer: {
              select: { id: true, name: true, email: true },
            },
            round: true,
            interviewEvaluations: {
              include: {
                parameter: true,
              },
            },
          },
          orderBy: { conductAt: "desc" },
        },
        taskSubmissions: {
          include: {
            task: true,
            evaluatedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!application) return null;

    return application;
  }

  /**
   * Update candidate application status
   */
  async updateApplicationStatus(
    id: string,
    status: "PENDING" | "SHORTLISTED" | "ACCEPTED" | "REJECTED",
    notes?: string,
    actorId?: string,
  ) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { student: { select: { name: true } } },
    });

    if (!existing) return null;

    const updated = await prisma.application.update({
      where: { id },
      data: { currentStatus: status },
    });

    if (actorId) {
      await prisma.inductionAuditLog.create({
        data: {
          userId: actorId,
          action: "APPLICATION_STATUS_UPDATE",
          targetType: "APPLICATION",
          targetId: id,
          details: {
            previousStatus: existing.currentStatus,
            newStatus: status,
            candidateName: existing.student?.name || (existing as any).candidate?.name,
            notes: notes || null,
          },
        },
      });
    }

    return updated;
  }

  /**
   * Convert an ACCEPTED candidate into a system User account
   * Verified identity details are used, duplicate accounts are prevented,
   * and the candidate record is properly linked.
   */
  async createUserFromCandidate(
    applicationId: string,
    actor: { id: string; name?: string; role?: string }
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        student: true,
        team: true,
      },
    });

    if (!app) {
      throw new Error("Application not found");
    }

    if (app.currentStatus !== "ACCEPTED") {
      throw new Error(
        "Candidate cannot be converted to a user: Application status must be ACCEPTED (Selected)."
      );
    }

    const candidateName = app.candidate?.name || app.student?.name || "Team Member";
    const candidateEmail = app.candidate?.email || app.student?.email;
    const candidatePhone = app.candidate?.phone || app.student?.phoneNumber;
    const candidateBranch = app.candidate?.branch || app.team?.name;

    if (!candidateEmail) {
      throw new Error("Candidate has no valid email address.");
    }

    // Verify candidate does not already have a linked user account
    if (app.candidate?.linkedUserId) {
      throw new Error("Candidate is already linked to an existing system User account.");
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: candidateEmail, mode: "insensitive" } },
    });

    return await prisma.$transaction(async (tx) => {
      let targetUser = existingUser;

      if (!targetUser) {
        // Create the new User
        targetUser = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: candidateName,
            email: candidateEmail,
            phoneNumber: candidatePhone || null,
            emailVerified: true,
            department: candidateBranch || null,
            creationSource: "induction",
          },
        });

        // Assign default "Member" role
        const memberRole = await tx.role.findUnique({
          where: { name: "Member" },
        });

        if (memberRole) {
          await tx.userRole.create({
            data: {
              userId: targetUser.id,
              roleId: memberRole.id,
            },
          });
        }
      } else {
        // Update creationSource if not set
        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            creationSource: targetUser.creationSource || "induction",
          },
        });
      }

      // Link Candidate to User
      if (app.candidate) {
        await tx.candidate.update({
          where: { id: app.candidate.id },
          data: {
            linkedUserId: targetUser.id,
            userCreatedById: actor.id,
            userCreatedAt: new Date(),
          },
        });
      }

      // Also ensure application links to User
      if (!app.studentId) {
        await tx.application.update({
          where: { id: app.id },
          data: { studentId: targetUser.id },
        });
      }

      // Link User to Team (e.g. Technical Team, Media Team)
      if (app.teamId) {
        await tx.teamMember.upsert({
          where: { teamId_userId: { teamId: app.teamId, userId: targetUser.id } },
          create: { teamId: app.teamId, userId: targetUser.id },
          update: {},
        });
      }

      // Log to SystemActivityLog
      await tx.systemActivityLog.create({
        data: {
          userId: actor.id,
          userName: actor.name || "Admin",
          userRole: actor.role || "Admin",
          action: `Created system User account for selected candidate: ${candidateName} (${candidateEmail})`,
          category: "Induction",
          type: "user-action",
          status: "Completed",
        },
      });

      return targetUser;
    });
  }

  /**
   * List interviews
   */
  async listInterviews(filters: {
    applicationId?: string;
    interviewerId?: string;
    roundId?: string;
  }) {
    const where: Prisma.InterviewWhereInput = {};
    if (filters.applicationId) where.applicationId = filters.applicationId;
    if (filters.interviewerId) where.InterviewerId = filters.interviewerId;
    if (filters.roundId) where.roundId = filters.roundId;

    return prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentProfile: true,
              },
            },
            team: { select: { id: true, name: true } },
          },
        },
        interviewer: { select: { id: true, name: true, email: true } },
        round: {
          include: {
            evaluationParameters: true,
          },
        },
        interviewEvaluations: {
          include: { parameter: true },
        },
      },
      orderBy: { conductAt: "desc" },
    });
  }

  /**
   * Get single interview details with parameters and existing evaluations
   */
  async getInterviewById(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                studentProfile: true,
              },
            },
            team: true,
          },
        },
        interviewer: { select: { id: true, name: true, email: true } },
        round: {
          include: {
            evaluationParameters: true,
          },
        },
        interviewEvaluations: {
          include: { parameter: true },
        },
      },
    });
  }

  /**
   * Assign an interviewer to an application round
   */
  async assignInterviewer(
    data: {
      applicationId: string;
      roundId: string;
      interviewerId: string;
      conductAt?: Date;
      notes?: string;
    },
    actorId: string,
  ) {
    const { applicationId, roundId, interviewerId, conductAt, notes } = data;

    // Check application and round existence
    const [application, round, interviewer] = await Promise.all([
      prisma.application.findUnique({
        where: { id: applicationId },
        include: { student: { select: { name: true } } },
      }),
      prisma.interviewRound.findUnique({ where: { id: roundId } }),
      prisma.user.findUnique({ where: { id: interviewerId } }),
    ]);

    if (!application) throw new Error("Application not found");
    if (!round) throw new Error("Interview round not found");
    if (!interviewer) throw new Error("Interviewer user not found");

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        roundId,
        InterviewerId: interviewerId,
        conductAt: conductAt || new Date(),
        interviewNotes: notes || null,
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
        round: true,
      },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "INTERVIEWER_ASSIGNED",
        targetType: "INTERVIEW",
        targetId: interview.id,
        details: {
          applicationId,
          candidateName: (application as any).candidate?.name || application.student?.name || "Candidate",
          roundName: round.roundName,
          interviewerName: interviewer.name,
        },
      },
    });

    return interview;
  }

  /**
   * Submit or save evaluation scores for an interview
   */
  async submitEvaluation(
    interviewId: string,
    data: {
      scores: Array<{ parameterId: string; rawScore: number }>;
      notes?: string;
      feedbackTags?: string[];
      recommendation?: string;
      isFinal?: boolean;
    },
    actorId: string,
  ) {
    const { scores, notes, feedbackTags = [], recommendation, isFinal = false } = data;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: { student: { select: { name: true } } },
        },
        round: true,
      },
    });

    if (!interview) throw new Error("Interview not found");

    // Execute atomic update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Interview remarks and feedback tags
      const updatedInterview = await tx.interview.update({
        where: { id: interviewId },
        data: {
          interviewNotes: notes !== undefined ? notes : interview.interviewNotes,
          feedbackTags,
          recommendation: recommendation || null,
        },
      });

      // 2. Upsert parameter evaluations
      const evaluationResults = [];
      const paramNameMap: Record<string, string> = {
        tech: "Technical & Domain Depth",
        prob: "Problem Solving & Logic",
        comm: "Communication & Articulation",
        team: "Teamwork & Collaboration",
        lead: "Initiative & Leadership",
      };

      for (const item of scores) {
        let parameterId = item.parameterId;

        // Verify that parameterId exists in EvaluationParameter
        let param = await tx.evaluationParameter.findUnique({
          where: { id: parameterId },
        });

        if (!param) {
          const resolvedName = paramNameMap[parameterId] || parameterId;

          // Check if an existing parameter for this round matches by name
          param = await tx.evaluationParameter.findFirst({
            where: {
              roundId: interview.roundId,
              parameterName: { equals: resolvedName, mode: "insensitive" },
            },
          });

          if (!param) {
            // Create parameter for this round to satisfy foreign key integrity
            param = await tx.evaluationParameter.create({
              data: {
                roundId: interview.roundId,
                parameterName: resolvedName,
                weighttage: 20,
              },
            });
          }
          parameterId = param.id;
        }

        const evalRecord = await tx.interviewEvaluation.upsert({
          where: {
            interviewId_parameterId: {
              interviewId,
              parameterId,
            },
          },
          update: { rawScore: item.rawScore },
          create: {
            interviewId,
            parameterId,
            rawScore: item.rawScore,
          },
          include: { parameter: true },
        });
        evaluationResults.push(evalRecord);
      }

      // 3. Compute weighted aggregate score
      let weightedSum = 0;
      let totalWeight = 0;
      evaluationResults.forEach((er) => {
        const weight = er.parameter.weighttage || 1;
        weightedSum += er.rawScore * weight;
        totalWeight += weight;
      });
      const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const percentageScore = Math.round((avgScore / 5.0) * 100);

      // 4. If finalized, automatically update Application status
      if (isFinal) {
        const nextStatus = percentageScore >= 80 ? "ACCEPTED" : "SHORTLISTED";
        await tx.application.update({
          where: { id: interview.applicationId },
          data: { currentStatus: nextStatus },
        });
      }

      // 5. Append audit log
      await tx.inductionAuditLog.create({
        data: {
          userId: actorId,
          action: isFinal ? "EVALUATION_SUBMITTED" : "EVALUATION_DRAFT_SAVED",
          targetType: "INTERVIEW",
          targetId: interviewId,
          details: {
            candidateName: (interview.application as any).candidate?.name || interview.application.student?.name || "Candidate",
            roundName: interview.round.roundName,
            aggregatePercentage: percentageScore,
            isFinal,
            recommendation: recommendation || null,
          },
        },
      });

      return {
        interview: updatedInterview,
        evaluations: evaluationResults,
        aggregateScore: avgScore.toFixed(2),
        percentageScore,
      };
    });

    return result;
  }

  /**
   * List all teams (domains) with their interview rounds and criteria
   */
  async listTeamsWithRounds() {
    return prisma.team.findMany({
      orderBy: { name: "asc" },
      include: {
        interviewRounds: {
          orderBy: { roundNumber: "asc" },
          include: {
            evaluationParameters: {
              orderBy: { weighttage: "desc" },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            members: true,
          },
        },
      },
    });
  }

  /**
   * Get rounds for a specific team
   */
  async getTeamRounds(teamId: string) {
    return prisma.interviewRound.findMany({
      where: { teamId },
      orderBy: { roundNumber: "asc" },
      include: {
        evaluationParameters: {
          orderBy: { weighttage: "desc" },
        },
      },
    });
  }

  /**
   * Create a new interview round for a team
   */
  async createRound(
    teamId: string,
    data: { roundName: string; roundNumber: number; duration?: number },
    actorId: string,
  ) {
    const round = await prisma.interviewRound.create({
      data: {
        teamId,
        roundName: data.roundName,
        roundNumber: data.roundNumber,
        duration: data.duration || 15,
        active: true,
      },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "ROUND_CREATED",
        targetType: "INTERVIEW_ROUND",
        targetId: round.id,
        details: { teamId, roundName: data.roundName, roundNumber: data.roundNumber },
      },
    });

    return round;
  }

  /**
   * Update an existing interview round
   */
  async updateRound(
    roundId: string,
    data: { roundName?: string; roundNumber?: number; duration?: number; active?: boolean },
    actorId: string,
  ) {
    const round = await prisma.interviewRound.update({
      where: { id: roundId },
      data,
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "ROUND_UPDATED",
        targetType: "INTERVIEW_ROUND",
        targetId: round.id,
        details: data,
      },
    });

    return round;
  }

  /**
   * Delete or deactivate an interview round
   */
  async deleteRound(roundId: string, actorId: string) {
    const round = await prisma.interviewRound.update({
      where: { id: roundId },
      data: { active: false },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "ROUND_DEACTIVATED",
        targetType: "INTERVIEW_ROUND",
        targetId: round.id,
        details: { roundName: round.roundName },
      },
    });

    return round;
  }

  /**
   * Batch save evaluation parameters for a round
   */
  async saveParameters(
    roundId: string,
    parameters: Array<{ id?: string; parameterName: string; weighttage: number }>,
    actorId: string,
  ) {
    const round = await prisma.interviewRound.findUnique({ where: { id: roundId } });
    if (!round) throw new Error("Round not found");

    const results = await prisma.$transaction(async (tx) => {
      const savedParams = [];
      for (const param of parameters) {
        if (param.id) {
          const updated = await tx.evaluationParameter.upsert({
            where: { id: param.id },
            update: {
              parameterName: param.parameterName,
              weighttage: param.weighttage,
            },
            create: {
              id: param.id,
              roundId,
              parameterName: param.parameterName,
              weighttage: param.weighttage,
            },
          });
          savedParams.push(updated);
        } else {
          const created = await tx.evaluationParameter.create({
            data: {
              roundId,
              parameterName: param.parameterName,
              weighttage: param.weighttage,
            },
          });
          savedParams.push(created);
        }
      }

      await tx.inductionAuditLog.create({
        data: {
          userId: actorId,
          action: "PARAMETERS_CONFIGURED",
          targetType: "INTERVIEW_ROUND",
          targetId: roundId,
          details: { roundName: round.roundName, parameterCount: savedParams.length },
        },
      });

      return savedParams;
    });

    return results;
  }

  /**
   * Delete an evaluation parameter
   */
  async deleteParameter(parameterId: string, actorId: string) {
    const param = await prisma.evaluationParameter.delete({
      where: { id: parameterId },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "PARAMETER_DELETED",
        targetType: "EVALUATION_PARAMETER",
        targetId: parameterId,
        details: { parameterName: param.parameterName },
      },
    });

    return param;
  }

  /**
   * List persistent induction activity logs
   */
  async listActivityLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.InductionAuditLogWhereInput = {};
    if (params.action) {
      where.action = params.action;
    }

    const [logs, total] = await Promise.all([
      prisma.inductionAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.inductionAuditLog.count({ where }),
    ]);

    const formatted = logs.map((log) => ({
      id: log.id,
      user: log.user.name || log.user.email || "Admin",
      role: "Staff",
      action: log.action.replace(/_/g, " ").toLowerCase(),
      category:
        log.targetType === "APPLICATION"
          ? "Evaluation"
          : log.targetType === "INTERVIEW"
          ? "Evaluation"
          : log.targetType === "INTERVIEW_ROUND"
          ? "Settings"
          : "General",
      type: log.action,
      timestamp: log.timestamp.toISOString(),
      status: "Completed",
      details: log.details,
    }));

    return {
      logs: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List induction accounts (interviewers, evaluators, reviewers)
   */
  async listInductionAccounts() {
    return prisma.inductionAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true, image: true },
        },
        team: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Create an induction account profile for an existing User
   */
  async createInductionAccount(
    data: {
      userId: string;
      type: "INTERVIEWER" | "EVALUATOR" | "TEAM_COORDINATOR" | "INDUCTION_VOLUNTEER" | "REVIEWER";
      teamId?: string;
      metadata?: Record<string, any>;
    },
    actorId: string,
  ) {
    const { userId, type, teamId, metadata } = data;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) throw new Error("User does not exist");

    const account = await prisma.inductionAccount.create({
      data: {
        userId,
        type,
        teamId: teamId || null,
        metadata: metadata || {},
        createdById: actorId,
        status: "ACTIVE",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: true,
      },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "INDUCTION_ACCOUNT_CREATED",
        targetType: "INDUCTION_ACCOUNT",
        targetId: account.id,
        details: { targetUserName: existingUser.name, accountType: type },
      },
    });

    return account;
  }

  /**
   * Update an induction account
   */
  async updateInductionAccount(
    id: string,
    data: {
      type?: "INTERVIEWER" | "EVALUATOR" | "TEAM_COORDINATOR" | "INDUCTION_VOLUNTEER" | "REVIEWER";
      status?: "ACTIVE" | "INACTIVE" | "PENDING";
      teamId?: string | null;
      metadata?: Record<string, any>;
    },
    actorId: string,
  ) {
    const updated = await prisma.inductionAccount.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: true,
      },
    });

    await prisma.inductionAuditLog.create({
      data: {
        userId: actorId,
        action: "INDUCTION_ACCOUNT_UPDATED",
        targetType: "INDUCTION_ACCOUNT",
        targetId: id,
        details: data,
      },
    });

    return updated;
  }
}

export const inductionService = new InductionService();

