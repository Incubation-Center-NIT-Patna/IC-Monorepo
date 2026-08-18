import { redisCache, REDIS_PREFIX } from "./redis";

const KEY_PREFIX = `${REDIS_PREFIX}:`;

/**
 * Cache-aside helper for the public blog read endpoints (listing, detail,
 * author page) - the highest-traffic, highest-repeat-read paths in the API.
 * Short TTL (default 60s) plus immediate invalidation on admin writes
 * (see invalidateCachePrefix below) is the sole freshness guarantee for
 * these routes - the Next.js frontend fetches with `cache: "no-store"` on
 * this same data, so this Redis layer is the only cache in the path and
 * must stay correctly invalidated.
 *
 * Fails open: any Redis error falls through to calling `fn()` directly rather
 * than 500ing the request - caching is a performance optimization, not a
 * correctness dependency.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await redisCache.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (err) {
    console.error("[cache] read failed, falling through to DB:", err);
  }

  const result = await fn();

  try {
    await redisCache.set(key, JSON.stringify(result), "EX", ttlSeconds);
  } catch (err) {
    console.error("[cache] write failed (result still returned):", err);
  }

  return result;
}

/**
 * Best-effort deletion of every key under a logical prefix - used to bust the
 * public blog cache immediately on admin writes (publish/unpublish/edit),
 * rather than waiting out the TTL. Uses SCAN, not KEYS, to avoid blocking
 * Redis on a large keyspace.
 *
 * ioredis's `keyPrefix` ("emw:") is transparently added/removed for ordinary
 * single-key commands (get/set/del with a plain key), but it is NOT applied
 * to SCAN's MATCH pattern, and the keys SCAN returns are the raw physical
 * keys (already carrying "emw:"). So: the MATCH pattern must include "emw:"
 * explicitly, and each scanned key must have "emw:" stripped again before
 * being passed to `.del()` - otherwise ioredis re-adds the prefix and you'd
 * silently delete nothing (or the wrong keys).
 */
export async function invalidateCachePrefix(prefix: string): Promise<void> {
  try {
    const rawKeys: string[] = [];
    let cursor = "0";
    do {
      const [nextCursor, batch] = await redisCache.scan(
        cursor,
        "MATCH",
        `${KEY_PREFIX}${prefix}*`,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      rawKeys.push(...batch);
    } while (cursor !== "0");

    if (rawKeys.length > 0) {
      const logicalKeys = rawKeys.map((k) =>
        k.startsWith(KEY_PREFIX) ? k.slice(KEY_PREFIX.length) : k,
      );
      await redisCache.del(...logicalKeys);
    }
  } catch (err) {
    console.error("[cache] invalidation failed:", err);
  }
}
