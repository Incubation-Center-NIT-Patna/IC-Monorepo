import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health";
import { authRoutes } from "./auth";
import { rolesRoutes } from "./roles";
import { usersRoutes } from "./users";
import { recoveryRoutes } from "./recovery";
import { adminRecoveryRoutes } from "./admin/recoveries";
import { eventsRoutes } from "./events";


export function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(rolesRoutes, { prefix: "/api/roles" });
  app.register(usersRoutes, { prefix: "/api/users" });
  app.register(recoveryRoutes, { prefix: "/api/recovery" });
  app.register(adminRecoveryRoutes, { prefix: "/api/admin" });
  app.register(eventsRoutes, { prefix: "/api/events" });
}
