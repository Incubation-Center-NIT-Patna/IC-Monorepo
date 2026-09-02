export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Include credentials so BetterAuth cookies are sent
    credentials: "omit", // Wait, BetterAuth might need credentials: "include" if it's cross-origin, or it might be same-origin if proxied. Let's use "include".
  });
  
  // Actually, we must use credentials: "include" to pass the auth cookie to the Fastify backend.
  const modifiedOptions = { ...options, credentials: "include" as RequestCredentials };
  const res = await fetch(url, {
    ...modifiedOptions,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.error || "An error occurred");
  }

  return res.json();
}
