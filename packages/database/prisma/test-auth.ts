import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../src/client";

async function main() {
  console.log("Testing temp auth instance...");
  const tempAuth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });

  try {
    const res = await tempAuth.api.signUpEmail({
      body: {
        email: "test_local@example.com",
        password: "Password123!",
        name: "Local Test User"
      }
    });
    console.log("Success:", !!res.user);
  } catch (err) {
    console.error("Failed:", err);
  }
}
main();
