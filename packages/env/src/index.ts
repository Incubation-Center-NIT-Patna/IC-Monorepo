import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
    PORT: z.coerce.number().default(4000),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string({ required_error: "JWT_SECRET is required" }).min(32),
    BETTER_AUTH_SECRET: z
    .string({ required_error: "BETTER_AUTH_SECRET is required" })
    .min(32),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:4000"),
    GOOGLE_ALLOWED_DOMAINS: z.string().default("nitp.ac.in"),
    CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000,http://localhost:7030")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.API_PORT,
    HOST: process.env.HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_ALLOWED_DOMAINS: process.env.GOOGLE_ALLOWED_DOMAINS,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
