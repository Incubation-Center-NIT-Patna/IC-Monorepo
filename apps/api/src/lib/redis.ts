import Redis from "ioredis";
import { env } from "../env";

export const REDIS_PREFIX = "emw";

const base = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

export const bullmqConnection = { ...base, db: env.REDIS_DB };

/**
 * Cache Redis DB (DB 2 by default).
 * We use this for API caching and temporary storage like in-progress quiz answers.
 */
export const redisCache = new Redis({
  ...base,
  db: env.CACHE_REDIS_DB,
  keyPrefix: `${REDIS_PREFIX}:`,
});

redisCache.on("error", (error) => {
  console.error("❌ Redis Cache Error:", error);
});
