import { createClient } from "@repo/auth/client";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export const authClient = createClient(`${process.env.NEXT_PUBLIC_API_URL}/auth`);
