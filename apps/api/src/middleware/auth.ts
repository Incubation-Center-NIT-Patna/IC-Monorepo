import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@repo/auth/server";
import { prisma } from "@repo/database";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const webHeaders = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === "string") {
        webHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      }
    }

    const session = await auth.api.getSession({
      headers: webHeaders,
    });

    if (session && session.user) {
      (request as any).user = session.user;
      (request as any).session = session.session;
      return;
    }

    // Direct token validation fallback (handles Bearer token & unsigned cookie)
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const cookieHeader = request.headers.cookie;
    const cookieMatch = cookieHeader?.match(/better-auth\.session_token=([^;]+)/);
    const rawCookieToken = cookieMatch && cookieMatch[1]
      ? decodeURIComponent(cookieMatch[1]).split(".")[0]
      : null;

    const tokenToVerify = bearerToken || rawCookieToken;
    if (tokenToVerify) {
      const dbSession = await prisma.session.findUnique({
        where: { token: tokenToVerify },
        include: { user: true },
      });

      if (
        dbSession &&
        dbSession.expiresAt > new Date() &&
        !dbSession.user.banned
      ) {
        (request as any).user = dbSession.user;
        (request as any).session = dbSession;
        return;
      }
    }

    return reply.status(401).send({ error: "Unauthorized" });
  } catch (error: any) {
    request.log.error(error, "[requireAuth] error verifying session");
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const webHeaders = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === "string") {
        webHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      }
    }

    const session = await auth.api.getSession({
      headers: webHeaders,
    });

    if (session && session.user) {
      (request as any).user = session.user;
      (request as any).session = session.session;
      return;
    }

    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const cookieHeader = request.headers.cookie;
    const cookieMatch = cookieHeader?.match(/better-auth\.session_token=([^;]+)/);
    const rawCookieToken = cookieMatch && cookieMatch[1]
      ? decodeURIComponent(cookieMatch[1]).split(".")[0]
      : null;

    const tokenToVerify = bearerToken || rawCookieToken;
    if (tokenToVerify) {
      const dbSession = await prisma.session.findUnique({
        where: { token: tokenToVerify },
        include: { user: true },
      });

      if (
        dbSession &&
        dbSession.expiresAt > new Date() &&
        !dbSession.user.banned
      ) {
        (request as any).user = dbSession.user;
        (request as any).session = dbSession;
      }
    }
  } catch {
    // optionalAuth does not block
  }
}

