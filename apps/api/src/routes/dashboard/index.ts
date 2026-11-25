import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@repo/database";
import { AnalyticsPermissions, InductionPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { permissionService } from "../../rbac";

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  app.get("/stats", async (request, reply) => {
    const user = (request as any).user;
    const auth = await permissionService.getAuthorizationContext(user.id);

    if (!auth.isSuperAdmin && auth.permissions.length === 0) {
      return reply.status(403).send({
        error: "Forbidden: Insufficient permissions to view dashboard statistics",
      });
    }

    const canViewLogs =
      auth.isSuperAdmin ||
      auth.permissions.some(
        (p) =>
          p.key === AnalyticsPermissions.READ_ANY.key ||
          p.key === InductionPermissions.APPLICATION_READ_ANY.key,
      );

    const [
      totalUsers,
      activeNotices,
      totalIncubations,
      graduatedStartups,
      upcomingEvents,
      totalMentors,
      totalStudents,
      pendingQueries,
      totalApplications,
      shortlistedApplications,
      acceptedApplications,
      pendingApplications,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.cmsNotice.count({ where: { active: true } }),
      prisma.cmsIncubation.count(),
      prisma.cmsIncubation.count({ where: { status: "Graduated" } }),
      prisma.cmsEvent.count({ where: { status: "Upcoming" } }),
      prisma.cmsTeamMember.count({ where: { category: "faculty" } }),
      prisma.cmsTeamMember.count({ where: { category: "student" } }),
      prisma.cmsQuery.count({ where: { status: "New" } }),
      prisma.application.count(),
      prisma.application.count({ where: { currentStatus: "SHORTLISTED" } }),
      prisma.application.count({ where: { currentStatus: "ACCEPTED" } }),
      prisma.application.count({ where: { currentStatus: "PENDING" } }),
      canViewLogs
        ? prisma.systemActivityLog.findMany({
            orderBy: { timestamp: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    return reply.send({
      // CMS Stats
      activeNotices,
      totalIncubations,
      graduatedStartups,
      upcomingEvents,
      totalMentors,
      totalStudents,
      pendingQueries,
      // User & Candidate Stats
      totalUsers,
      totalApplications,
      shortlistedApplications,
      acceptedApplications,
      pendingApplications,
      // Recent Activities preview
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        user: a.userName,
        role: a.userRole,
        action: a.action,
        category: a.category,
        type: a.type,
        status: a.status,
        timestamp: a.timestamp.toISOString(),
      })),
    });
  });
};
