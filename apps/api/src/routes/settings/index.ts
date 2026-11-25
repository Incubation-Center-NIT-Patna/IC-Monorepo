import type { FastifyPluginAsync } from "fastify";
import { SettingsPermissions } from "@repo/rbac";
import { prisma } from "@repo/database";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const systemSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/settings/:key
  app.get(
    "/:key",
    {
      preHandler: [authorize({ permission: SettingsPermissions.READ_ANY })],
    },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const setting = await prisma.systemSetting.findUnique({
        where: { key },
      });

      if (!setting) {
        return reply.status(404).send({ error: `Setting ${key} not found` });
      }

      return reply.send({ key: setting.key, value: setting.value });
    },
  );

  // 2. PUT /api/settings/:key
  app.put(
    "/:key",
    {
      preHandler: [authorize({ permission: SettingsPermissions.UPDATE_ANY })],
    },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const user = (request as any).user;
      const { value, category = "general" } = request.body as {
        value: any;
        category?: string;
      };

      if (value === undefined) {
        return reply.status(400).send({ error: "Setting value is required" });
      }

      const updated = await prisma.systemSetting.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });

      // Log to SystemActivityLog
      await prisma.systemActivityLog.create({
        data: {
          userId: user.id,
          userName: user.name || user.email || "Administrator",
          userRole: user.role || "Admin",
          action: `Updated configuration settings: ${key.replace("_", " ")}`,
          category: "Settings",
          type: "settings-updated",
          status: "Approved",
        },
      });

      return reply.send({ success: true, setting: updated });
    },
  );

  // 3. GET /api/settings
  app.get(
    "/",
    {
      preHandler: [authorize({ permission: SettingsPermissions.READ_ANY })],
    },
    async (_request, reply) => {
      const settings = await prisma.systemSetting.findMany();
      const settingsMap: Record<string, any> = {};
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }
      return reply.send({ settings: settingsMap });
    },
  );
};

