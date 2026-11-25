import type { PrismaClient } from "../../generated/prisma/client";

export async function seedTasks(prisma: PrismaClient): Promise<void> {
  console.log("\n📋 Seeding tasks (2 records)...");

  const admin = await prisma.user.findFirst({
    where: { email: "madhukark.ug25.cs@nitp.ac.in" },
  });

  if (!admin) {
    console.log("   ⚠ Admin not found for tasks seeding; skipping.");
    return;
  }

  const tasksData = [
    {
      id: "task-seed-1",
      title: "Review Induction Candidate Portfolios",
      description: "Review and evaluate GitHub repositories and portfolios submitted by technical domain applicants.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdById: admin.id,
      assignedToId: admin.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // In 3 days
    },
    {
      id: "task-seed-2",
      title: "Verify Annual Hackathon Judging Rubrics",
      description: "Finalize evaluation parameters and scoring weights for the upcoming Global Hackathon 2026.",
      status: "PENDING",
      priority: "MEDIUM",
      createdById: admin.id,
      assignedToId: admin.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // In 7 days
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      create: t,
      update: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        assignedToId: t.assignedToId,
      },
    });
  }

  console.log("✅ Seeded tasks successfully (2 records).\n");
}

