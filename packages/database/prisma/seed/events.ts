import type { PrismaClient } from "../../generated/prisma/client";

export async function seedEvents(prisma: PrismaClient) {
  console.log("\n🚀 Seeding events (2 records)...");

  const events = [
    {
      name: "Global Hackathon 2026",
      slug: "global-hackathon-2026",
      description: "Join the ultimate hacking experience to build the future. Build a full-stack web application in 48 hours to win amazing prizes.",
      type: "HACKATHON" as const,
      status: "ACTIVE" as const,
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Started yesterday
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // Ends in 2 days
    },
    {
      name: "Startup Hunt Challenge",
      slug: "startup-hunt-challenge",
      description: "Pitch your startup idea to top tier investors. Registration is open for teams of up to 4 members.",
      type: "STARTUP_HUNT" as const,
      status: "REGISTRATION_OPEN" as const,
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Starts next week
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // Ends in 10 days
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  console.log("✅ Seeded events successfully (2 records).");
}
