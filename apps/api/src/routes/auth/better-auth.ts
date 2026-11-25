import type { FastifyInstance } from "fastify";
import { toNodeHandler } from "better-auth/node";

import { auth } from "@repo/auth/server";
import { env } from "../../env";

const handler = toNodeHandler(auth);

export async function betterAuthRoutes(app: FastifyInstance) {
  // Support direct browser GET navigation to /sign-in/social
  app.get("/sign-in/social", async (request, reply) => {
    const query = (request.query || {}) as {
      provider?: string;
      callbackURL?: string;
    };
    const provider = query.provider || "google";
    const callbackURL = query.callbackURL;
    if (!callbackURL) {
      return reply.status(400).send({ error: "callbackURL query parameter is required" });
    }

    const webHeaders = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === "string") webHeaders.append(key, value);
      else if (Array.isArray(value)) value.forEach((v) => webHeaders.append(key, v));
    }

    try {
      const res = await auth.api.signInSocial({
        body: {
          provider: provider as any,
          callbackURL,
        },
        headers: webHeaders,
      });

      if (res && (res as any).url) {
        return reply.redirect((res as any).url);
      }
    } catch (err) {
      request.log.error(err, "Failed to get social sign-in URL from BetterAuth");
    }

    // Direct Google OAuth URL redirect fallback
    const clientId = env.GOOGLE_CLIENT_ID;
    const redirectUri = env.GOOGLE_URL;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=openid%20profile%20email&prompt=select_account&state=${encodeURIComponent(
      callbackURL,
    )}`;

    return reply.redirect(googleAuthUrl);
  });

  // Prevent Fastify from consuming the request body for standard BetterAuth endpoints -
  // BetterAuth needs to read the raw Node stream itself.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser("*", function (_request, _payload, done) {
    done(null);
  });

  app.all("/*", async (request, reply) => {
    // Copy headers set by Fastify (like CORS) to the raw Node response
    for (const [key, value] of Object.entries(reply.getHeaders())) {
      if (value !== undefined) {
        reply.raw.setHeader(key, value as any);
      }
    }

    reply.hijack();
    try {
      await handler(request.raw, reply.raw);
    } catch (err) {
      console.error("BetterAuth error:");
      console.error(err);
      throw err;
    }
    return;
  });
}
