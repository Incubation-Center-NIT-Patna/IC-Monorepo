import { createClient } from "@repo/auth/client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const authClient = createClient(`${apiUrl}/auth`);
