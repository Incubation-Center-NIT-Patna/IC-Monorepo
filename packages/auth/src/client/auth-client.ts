import { createAuthClient } from "better-auth/react";

export function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    // Google OAuth only - no phone number or credential plugins
    plugins: [],
  });
}

function getRequiredApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "Configuration Error: NEXT_PUBLIC_API_URL environment variable is required.",
    );
  }
  return apiUrl.replace(/\/+$/, "");
}

export const authClient = createClient(`${getRequiredApiUrl()}/auth`);
