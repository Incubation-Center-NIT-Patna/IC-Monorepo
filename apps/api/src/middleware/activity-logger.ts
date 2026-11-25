import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma, Prisma } from "@repo/database";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXCLUDED_PREFIXES = ["/api/activity-logs", "/api/auth", "/health", "/metrics", "/favicon.ico"];
const SENSITIVE_PATTERN = /pass|token|secret|auth|session|card|cookie|key|credential|otp|pin|hash/i;

const METHOD_VERBS: Record<string, string> = {
  POST: "Created",
  PUT: "Updated",
  PATCH: "Updated",
  DELETE: "Deleted",
};

const CMS_CATEGORIES: Record<string, string> = {
  notices: "Notices",
  events: "Events",
  incubations: "Startups",
  talks: "Talks",
  team: "Team",
  leadership: "Leadership",
  faqs: "FAQs",
  gallery: "Gallery",
  queries: "Queries",
  categories: "Categories",
};

const safeStr = (val: unknown, fallback = ""): string =>
  typeof val === "string" ? val.replace(/[\r\n\x00-\x1F\x7F]/g, "").slice(0, 120) : fallback;

function normalizePath(rawUrl: string): string {
  try {
    return new URL(rawUrl, "http://localhost").pathname;
  } catch {
    return rawUrl.split("?")[0] || "";
  }
}

function sanitizeDetails(
  data: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): Prisma.InputJsonValue {
  if (data === null || data === undefined) return "";
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return data;
  }
  if (typeof data !== "object") return String(data);
  if (depth > 5) return "[TRUNCATED_DEPTH]";
  if (seen.has(data)) return "[CIRCULAR]";
  seen.add(data);

  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item) => sanitizeDetails(item, depth + 1, seen));
  }

  const clean: Record<string, Prisma.InputJsonValue> = {};
  for (const [key, value] of Object.entries(data)) {
    clean[key] = SENSITIVE_PATTERN.test(key)
      ? "[REDACTED]"
      : sanitizeDetails(value, depth + 1, seen);
  }
  return clean;
}

export function resolveActionAndCategory(
  method: string,
  urlPath: string,
  body: Record<string, any> = {},
): { action: string; category: string } {
  const verb = METHOD_VERBS[method] || "Modified";

  // 1. Induction & Evaluation
  if (urlPath.startsWith("/api/induction")) {
    if (urlPath.includes("/create-user"))
      return { category: "Induction", action: `Converted candidate to user (${safeStr(body.name || body.email, "Selected Candidate")})` };
    if (urlPath.includes("/status"))
      return { category: "Induction", action: `Updated candidate status to "${safeStr(body.status || body.currentStatus, "Updated")}"` };
    if (urlPath.includes("/evaluate"))
      return { category: "Evaluation", action: "Submitted candidate interview evaluation" };
    if (urlPath.includes("/interviews"))
      return { category: "Evaluation", action: method === "POST" ? "Scheduled candidate interview" : "Updated interview schedule" };
    if (urlPath.includes("/rounds"))
      return { category: "Induction", action: `${verb} interview round` };
    if (urlPath.includes("/parameters"))
      return { category: "Induction", action: `${verb} evaluation parameter ${safeStr(body.parameterName)}`.trim() };
    if (urlPath.includes("/accounts"))
      return { category: "Induction", action: `${verb} induction account ${safeStr(body.name)}`.trim() };
    return { category: "Induction", action: `${verb} induction records` };
  }

  // 2. Tasks
  if (urlPath.startsWith("/api/tasks")) {
    if (urlPath.includes("/status"))
      return { category: "Tasks", action: `Updated task status to "${safeStr(body.status, "Updated")}"` };
    return { category: "Tasks", action: `${verb} task "${safeStr(body.title, "Task")}"` };
  }

  // 3. Users
  if (urlPath.startsWith("/api/users") || urlPath.startsWith("/api/admin/users")) {
    if (urlPath.includes("/me")) return { category: "Users", action: "Updated personal profile" };
    if (method === "POST") return { category: "Users", action: `Registered user: "${safeStr(body.name || body.email, "Team Member")}"` };
    if (method === "DELETE") return { category: "Users", action: "Removed user or revoked session" };
    return { category: "Users", action: "Updated user details or role assignments" };
  }

  // 4. Roles
  if (urlPath.startsWith("/api/roles")) {
    if (urlPath.includes("/permissions")) {
      const count = Array.isArray(body.permissions) ? `${body.permissions.length} permissions assigned` : "Updated";
      return { category: "Roles", action: `Updated role permissions (${count})` };
    }
    return { category: "Roles", action: `${verb} system role ${safeStr(body.name)}`.trim() };
  }

  // 5. CMS Content
  if (urlPath.startsWith("/api/cms")) {
    const section = urlPath.split("/")[3] || "content";
    const category = CMS_CATEGORIES[section.toLowerCase()] || "CMS";
    const label = safeStr(body.title || body.name || body.caption || body.question);
    return { category, action: `${verb} ${section} entry${label ? ` "${label}"` : ""}` };
  }

  // 6. Settings & Media
  if (urlPath.startsWith("/api/settings"))
    return { category: "Settings", action: `Updated settings: ${safeStr(body.key, "Configuration").replace(/_/g, " ")}` };
  if (urlPath.startsWith("/api/upload"))
    return { category: "Media", action: "Uploaded media asset" };

  // 7. Fallback
  const segment = urlPath.replace(/^\/api\/?/, "").split("/")[0] || "General";
  return {
    category: segment.charAt(0).toUpperCase() + segment.slice(1),
    action: `${verb} resource at ${safeStr(urlPath)}`,
  };
}

export function registerActivityLogger(app: FastifyInstance) {
  app.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
    const method = request.method.toUpperCase();
    if (!MUTATION_METHODS.has(method) || reply.statusCode < 200 || reply.statusCode >= 400) return;
    if ((request as any).activityLogged) return;

    const urlPath = normalizePath(request.url || "");
    if (EXCLUDED_PREFIXES.some((prefix) => urlPath === prefix || urlPath.startsWith(`${prefix}/`))) return;

    (request as any).activityLogged = true;

    try {
      const reqUser = (request as any).user;
      let userId: string | null = reqUser?.id ?? null;
      let userName: string = reqUser?.name || reqUser?.email || "Administrator";
      let userRole: string = reqUser?.role || "";

      if (!userId && typeof request.headers.cookie === "string") {
        const match = request.headers.cookie.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
        const token = match?.[1] ? decodeURIComponent(match[1]).split(".")[0] : null;

        if (token) {
          const session = await prisma.session.findUnique({
            where: { token },
            select: { user: { select: { id: true, name: true, email: true } } },
          });

          if (session?.user) {
            userId = session.user.id;
            userName = session.user.name || session.user.email || "Administrator";
          }
        }
      }

      if (userId && !userRole) {
        const userRoleRecord = await prisma.userRole.findFirst({
          where: { userId },
          select: { role: { select: { name: true } } },
        });
        userRole = userRoleRecord?.role?.name || "Member";
      }

      const body = (request.body as Record<string, any>) || {};
      const { action, category } = resolveActionAndCategory(method, urlPath, body);

      const details: Prisma.InputJsonObject = {
        method,
        path: urlPath,
        params: sanitizeDetails(request.params ?? {}),
        query: sanitizeDetails(request.query ?? {}),
        body: sanitizeDetails(body),
        statusCode: reply.statusCode,
      };

      await prisma.systemActivityLog.create({
        data: {
          userId,
          userName: safeStr(userName, "Administrator"),
          userRole: safeStr(userRole || "System"),
          action,
          category,
          type: "admin-action",
          status: "Completed",
          details,
          timestamp: new Date(),
        },
      });
    } catch (err) {
      request.log.error(err, "[ActivityLogger] Failed to write system activity log");
    }
  });
}