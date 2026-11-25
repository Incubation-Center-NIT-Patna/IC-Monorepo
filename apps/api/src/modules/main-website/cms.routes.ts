import type { FastifyPluginAsync } from "fastify";
import { CmsPermissions } from "@repo/rbac";
import { requireAuth } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { permissionService } from "../../rbac";
import { cmsService } from "./cms.service";

/**
 * Validates whether the user has authorization for a specific CMS section.
 * Checks Super Admin bypass, global CMS permission, section-specific manage permission,
 * and section-specific action permission.
 */
async function verifyCmsSectionAccess(
  userId: string,
  section: string,
  action: "read" | "create" | "update" | "delete",
): Promise<boolean> {
  const auth = await permissionService.getAuthorizationContext(userId);
  if (auth.isSuperAdmin) return true;

  const userPermKeys = new Set(auth.permissions.map((p) => p.key));

  // Global CMS Permission
  const globalKey = `cms:${action === "read" ? "read" : action}:any`;
  if (userPermKeys.has(globalKey)) return true;

  // Section-specific keys (e.g. cms_gallery:manage:any, cms_gallery:create:any, manage:gallery)
  const sectionManageKey = `cms_${section}:manage:any`;
  const sectionActionKey = `cms_${section}:${action}:any`;
  const legacyManageKey = `manage:${section}`;

  if (
    userPermKeys.has(sectionManageKey) ||
    userPermKeys.has(sectionActionKey) ||
    userPermKeys.has(legacyManageKey)
  ) {
    return true;
  }

  // Also allow read access if user has manage permission for that section
  if (action === "read" && userPermKeys.has(sectionManageKey)) {
    return true;
  }

  return false;
}

export const cmsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  // 1. GET /api/cms/stats
  app.get(
    "/stats",
    async (request, reply) => {
      const user = (request as any).user;
      const auth = await permissionService.getAuthorizationContext(user.id);
      if (!auth.isSuperAdmin && auth.permissions.length === 0) {
        return reply.status(403).send({ error: "Forbidden: Insufficient permissions" });
      }
      const stats = await cmsService.getStats();
      return reply.send(stats);
    },
  );

  // 2. Dynamic Categories
  app.get(
    "/categories/:module",
    async (request, reply) => {
      const { module } = request.params as { module: string };
      const categories = await cmsService.getCategories(module);
      return reply.send({ categories });
    },
  );

  app.post(
    "/categories/:module",
    async (request, reply) => {
      const { module } = request.params as { module: string };
      const user = (request as any).user;
      const isAllowed = await verifyCmsSectionAccess(user.id, module, "create");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No permission to manage categories for ${module}` });
      }

      const { name } = (request.body as { name?: string }) || {};
      if (!name) {
        return reply.status(400).send({ error: "Category name is required" });
      }

      const category = await cmsService.addCategory(module, name, {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      });
      return reply.status(201).send(category);
    },
  );

  app.delete(
    "/categories/:module/:name",
    async (request, reply) => {
      const { module, name } = request.params as { module: string; name: string };
      const user = (request as any).user;
      const isAllowed = await verifyCmsSectionAccess(user.id, module, "delete");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No permission to delete categories for ${module}` });
      }

      const deleted = await cmsService.deleteCategory(module, decodeURIComponent(name), {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      });
      return reply.send({ success: true, count: deleted.count });
    },
  );

  // 4. Section Items CRUD
  app.get(
    "/:section",
    async (request, reply) => {
      const { section } = request.params as { section: string };
      const user = (request as any).user;

      const isAllowed = await verifyCmsSectionAccess(user.id, section, "read");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No access to ${section} records` });
      }

      const query = request.query as any;
      try {
        const items = await cmsService.getItems(section, query);
        return reply.send({ items });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.get(
    "/:section/:id",
    async (request, reply) => {
      const { section, id } = request.params as { section: string; id: string };
      const user = (request as any).user;

      const isAllowed = await verifyCmsSectionAccess(user.id, section, "read");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No access to ${section} records` });
      }

      try {
        const item = await cmsService.getItemById(section, id);
        if (!item) {
          return reply.status(404).send({ error: "Item not found" });
        }
        return reply.send({ item });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post(
    "/:section",
    async (request, reply) => {
      const { section } = request.params as { section: string };
      const user = (request as any).user;

      const isAllowed = await verifyCmsSectionAccess(user.id, section, "create");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No permission to create ${section} records` });
      }

      try {
        const created = await cmsService.createItem(section, request.body, {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        });
        return reply.status(201).send({ success: true, item: created });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.put(
    "/:section/:id",
    async (request, reply) => {
      const { section, id } = request.params as { section: string; id: string };
      const user = (request as any).user;

      const isAllowed = await verifyCmsSectionAccess(user.id, section, "update");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No permission to update ${section} records` });
      }

      try {
        const updated = await cmsService.updateItem(section, id, request.body, {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        });
        return reply.send({ success: true, item: updated });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.delete(
    "/:section/:id",
    async (request, reply) => {
      const { section, id } = request.params as { section: string; id: string };
      const user = (request as any).user;

      const isAllowed = await verifyCmsSectionAccess(user.id, section, "delete");
      if (!isAllowed) {
        return reply.status(403).send({ error: `Forbidden: No permission to delete ${section} records` });
      }

      try {
        const deleted = await cmsService.deleteItem(section, id, {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        });
        return reply.send({ success: true, item: deleted });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
};
