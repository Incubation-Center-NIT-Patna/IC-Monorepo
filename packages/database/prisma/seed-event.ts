import { prisma } from "../src/client";
import { randomBytes } from "crypto";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

async function main() {
  console.log("Seeding IC Events Platform...");

  // 1. Clean up existing test user to ensure correct password hashing
  await prisma.user.deleteMany({ where: { email: "participant@example.com" } });

  let user = null;
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "participant@example.com",
        password: "Password123!",
        name: "Test Participant",
      },
      headers: new Headers({
        "Origin": "http://localhost:4000",
        "Content-Type": "application/json"
      })
    });
    user = res.user;
    
    // Update ID to match expected test ID
    await prisma.user.update({
      where: { id: user.id },
      data: { id: "test-user-id-123" }
    });
    user.id = "test-user-id-123";
    
    await prisma.account.updateMany({
      where: { userId: user.id },
      data: { accountId: "test-user-id-123", userId: "test-user-id-123" }
    });
  } catch (err) {
    console.error("Failed to seed user via better-auth:", err);
    process.exit(1);
  }

  // 2. Create Startup Hunt Event
  const event = await prisma.event.upsert({
    where: { slug: "startup-hunt-2026" },
    update: {},
    create: {
      name: "Startup Hunt 2026",
      slug: "startup-hunt-2026",
      description: "A gamified startup building event",
      type: "STARTUP_HUNT",
      status: "ACTIVE",
    },
  });

  // 3. Register User as Participant
  const participant = await prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId: event.id, userId: user.id } },
    update: {},
    create: {
      eventId: event.id,
      userId: user.id,
    },
  });

  // 4. Create a Team
  const team = await prisma.eventTeam.upsert({
    where: { eventId_name: { eventId: event.id, name: "Team Alpha" } },
    update: {},
    create: {
      eventId: event.id,
      name: "Team Alpha",
    },
  });

  // 5. Add Participant to Team
  await prisma.eventTeamMember.upsert({
    where: { participantId: participant.id },
    update: { teamId: team.id },
    create: {
      participantId: participant.id,
      teamId: team.id,
    },
  });

  // 6. Create Checkpoint 1
  const checkpoint1 = await prisma.eventCheckpoint.upsert({
    where: { eventId_sequence: { eventId: event.id, sequence: 1 } },
    update: {},
    create: {
      eventId: event.id,
      sequence: 1,
      name: "Find the hidden investor",
      type: "QR",
      points: 100,
    },
  });

  // 7. Create Resource 1
  const resource1 = await prisma.eventResource.create({
    data: {
      eventId: event.id,
      name: "Customer Persona",
      type: "CUSTOMER",
      description: "You've unlocked the Target Audience demographic data.",
    },
  });

  // Update checkpoint to attach resource
  await prisma.eventCheckpoint.update({
    where: { id: checkpoint1.id },
    data: {
      config: { resourceId: resource1.id },
    },
  });

  // 8. Assign Checkpoint to Team (Generate QR Token)
  const token = randomBytes(16).toString("hex");
  const teamCheckpoint = await prisma.eventTeamCheckpoint.upsert({
    where: { teamId_checkpointId: { teamId: team.id, checkpointId: checkpoint1.id } },
    update: {},
    create: {
      teamId: team.id,
      checkpointId: checkpoint1.id,
      tokenHash: token,
      status: "LOCKED",
    },
  });

  console.log("Seeding complete!");
  console.log("-----------------------------------------");
  console.log(`Event ID: ${event.id}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Team ID: ${team.id}`);
  console.log(`Test QR Token for Checkpoint 1: ${token}`);
  console.log("-----------------------------------------");
  console.log("To test scanning, you can use the API:");
  console.log(`POST /api/events/${event.id}/checkpoints/scan`);
  console.log(`Body: { "token": "${token}" }`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
