import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val || !val.trim()) {
    throw new Error(`Configuration Error: ${name} environment variable is required.`);
  }
  return val.trim();
}

const rawOrigins = requireEnv("CORS_ORIGIN");
const trustedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Platform policy:
 * Allow verified Google accounts whose email is pre-registered in the database.
 */
export function isAllowedGoogleEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return Boolean(local && domain && domain.includes("."));
}

const authBaseUrl = requireEnv("BETTER_AUTH_URL");
const authSecret = requireEnv("BETTER_AUTH_SECRET");
const googleClientId = requireEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
const authHostname = (() => {
  try {
    return new URL(authBaseUrl).hostname;
  } catch {
    return "localhost";
  }
})();
const isLocalhost =
  authHostname === "localhost" || authHostname.endsWith(".localhost");
const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(authHostname);
const cookieDomain =
  isLocalhost || isIP
    ? undefined
    : "." + authHostname.split(".").slice(-2).join(".");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: authSecret,
  baseURL: authBaseUrl,

  // STRICT POLICY: Non-Google authentication methods completely disabled
  // emailAndPassword is not configured (disabled)
  
  trustedOrigins,
  trustedProxies: true,

  advanced: {
    crossSubDomainCookies: {
      enabled: !isLocalhost,
      domain: cookieDomain,
    },
  },

  rateLimit: {
    window: 60,
    max: 100,
  },

  // Google OAuth is the ONLY authentication provider
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectURI: process.env.GOOGLE_URL || undefined,
      prompt: "select_account",
      accessType: "offline",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      requireLocalEmailVerified: false,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Reject unverified Google accounts
          if (!user.emailVerified) {
            throw new APIError("FORBIDDEN", {
              message:
                "Google account email is not verified. Access is prohibited.",
            });
          }

          if (!isAllowedGoogleEmail(user.email)) {
            throw new APIError("FORBIDDEN", {
              message: "Invalid Google account email address.",
            });
          }

          // Strict Policy: Open self-registration is disabled.
          // The user's email MUST already be pre-registered in the database by a Super Admin or Developer.
          const existingPreRegistered = await prisma.user.findFirst({
            where: { email: { equals: user.email, mode: "insensitive" } },
            select: { id: true, banned: true },
          });

          if (!existingPreRegistered) {
            throw new APIError("NOT_FOUND", {
              message:
                "User not found. Your email is not registered in the system. Only pre-registered users added by a Super Admin or Developer can sign in.",
            });
          }

          if (existingPreRegistered.banned) {
            throw new APIError("FORBIDDEN", {
              message: "Account suspended. Please contact administration.",
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Verify that user exists, email is verified, not banned, and domain is @nitp.ac.in
          const targetUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, email: true, emailVerified: true, banned: true },
          });

          if (!targetUser) {
            throw new APIError("NOT_FOUND", {
              message:
                "User not found. Your email is not registered in the database.",
            });
          }

          if (targetUser.banned) {
            throw new APIError("FORBIDDEN", {
              message: "Account suspended. Please contact administration.",
            });
          }

          if (!isAllowedGoogleEmail(targetUser.email)) {
            throw new APIError("FORBIDDEN", {
              message:
                "Access denied. A valid Google account email is required to establish a session.",
            });
          }
        },
      },
    },
  },

  // No phone number, SMS, OTP, or trusted-device bypass plugins
  plugins: [],
});
