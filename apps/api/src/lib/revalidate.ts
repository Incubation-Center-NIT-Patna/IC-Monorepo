import { env } from "../env";

/**
 * Notifies apps/web to drop its own Next.js ISR/fetch cache for pages built
 * from blog data - specifically /current-affairs, which caches its curated
 * post fetch for up to 5 minutes independently of the Redis cache above.
 * Fails open and fires after the DB transaction commits: the web app being
 * unreachable or unconfigured must never fail the admin request.
 */
export async function triggerWebRevalidation(
  paths: string[],
  tags: string[] = [],
): Promise<void> {
  if (!env.WEB_REVALIDATE_URL || !env.WEB_REVALIDATE_SECRET) return;

  try {
    await fetch(`${env.WEB_REVALIDATE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": env.WEB_REVALIDATE_SECRET,
      },
      body: JSON.stringify({ paths, tags }),
    });
  } catch (err) {
    console.error("[revalidate] web app notification failed:", err);
  }
}
