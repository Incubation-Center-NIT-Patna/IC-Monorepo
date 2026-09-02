import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "@repo/database";

export async function participantRoutes(app: FastifyInstance) {
  app.get(
    "/:eventId/me",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: user.id,
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({ error: "Participant not found for this event" });
      }

      return reply.send({ participant });
    },
  );

  app.get(
    "/:eventId/team",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const user = (request as any).user;

      const participant = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: user.id,
          },
        },
        include: {
          teamMemberships: {
            include: {
              team: {
                include: {
                  members: {
                    include: {
                      participant: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  resources: {
                    include: {
                      resource: true,
                    }
                  }
                },
              },
            },
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({ error: "Participant not found for this event" });
      }

      const teamMembership = participant.teamMemberships[0];

      if (!teamMembership) {
        return reply.status(404).send({ error: "No team found for this participant" });
      }

      const team = teamMembership.team;

      // Format team members to be cleaner
      const formattedMembers = team.members.map((m) => ({
        id: m.id,
        participantId: m.participantId,
        joinedAt: m.joinedAt,
        user: {
          id: m.participant.user.id,
          name: m.participant.user.name,
          email: m.participant.user.email,
        },
      }));

      // Sort by joinedAt so the first element (oldest) is considered the Team Leader
      formattedMembers.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

      return reply.send({
        team: {
          id: team.id,
          eventId: team.eventId,
          name: team.name,
          totalPoints: team.totalPoints,
          metadata: team.metadata,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          members: formattedMembers,
          resources: team.resources,
        },
      });
    },
  );
}
