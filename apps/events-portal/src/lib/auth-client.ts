import { createClient } from "@repo/auth/client";

export const authClient = createClient(
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") + "/auth"
);

export const { signIn, signUp, useSession, signOut } = authClient;
