import type { PrismaClient } from "../../generated/prisma/client";

export async function seedEvents(prisma: PrismaClient) {
  console.log("\n🚀 Seeding events...");

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
    {
      name: "Cyber Security Quiz",
      slug: "cyber-security-quiz",
      description: "Test your knowledge on the latest cyber security trends and vulnerabilities.",
      type: "QUIZ" as const,
      status: "COMPLETED" as const,
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // Started 10 days ago
      endsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // Ended 9 days ago
    },
    {
      name: "Campus Treasure Hunt",
      slug: "campus-treasure-hunt",
      description: "Explore the campus and solve puzzles to win exciting prizes. Scan QR codes at checkpoints to earn points.",
      type: "TREASURE_HUNT" as const,
      status: "ACTIVE" as const,
      startsAt: new Date(Date.now() - 1000 * 60 * 60), // Started 1 hour ago
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Ends tomorrow
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  console.log("✅ Seeded events successfully.");
}
