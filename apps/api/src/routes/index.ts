import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health";
import { authRoutes } from "./auth";
import { rolesRoutes } from "./roles";
import { usersRoutes } from "./users";
import { recoveryRoutes } from "./recovery";
import { adminRecoveryRoutes } from "./admin/recoveries";
import { eventsRoutes } from "./events";
import { inductionRoutes } from "../modules/incubation";
import { cmsRoutes, publicMainWebsiteRoutes } from "../modules/main-website";
import { activityLogsRoutes } from "./activity-logs";
import { systemSettingsRoutes } from "./settings";
import { dashboardRoutes } from "./dashboard";
import { uploadRoutes } from "./upload";
import { tasksRoutes } from "./tasks";
import { teamsRoutes } from "./teams";

export function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(rolesRoutes, { prefix: "/api/roles" });
  app.register(usersRoutes, { prefix: "/api/users" });
  app.register(teamsRoutes, { prefix: "/api/teams" });
  app.register(recoveryRoutes, { prefix: "/api/recovery" });
  app.register(adminRecoveryRoutes, { prefix: "/api/admin" });
  app.register(eventsRoutes, { prefix: "/api/events" });
  app.register(inductionRoutes, { prefix: "/api/induction" });
  app.register(cmsRoutes, { prefix: "/api/cms" });
  app.register(publicMainWebsiteRoutes, { prefix: "/api/public" });
  app.register(activityLogsRoutes, { prefix: "/api/activity-logs" });
  app.register(systemSettingsRoutes, { prefix: "/api/settings" });
  app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  app.register(uploadRoutes, { prefix: "/api/upload" });
  app.register(tasksRoutes, { prefix: "/api/tasks" });
}
