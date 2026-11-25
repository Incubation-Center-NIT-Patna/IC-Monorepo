import type { PrismaClient } from "../../generated/prisma/client";

export async function seedInduction(prisma: PrismaClient): Promise<void> {
  console.log("\n🌱 Seeding Induction module (Candidates distinct from Users)...");

  // 1. Teams (Operational, Global Executive, and Faculty Team)
  const allTeams = [
    {
      id: "team-global",
      name: "Executive & Global Leadership",
      description: "Club Secretary, Student Coordinators, and Executive Leads",
      type: "GLOBAL" as const,
      order: 0,
    },
    {
      id: "team-faculty",
      name: "Faculty Team",
      description: "Professor-In-Charge, Faculty Advisors, and Faculty Mentors",
      type: "FACULTY" as const,
      order: 1,
    },
    {
      id: "team-tech",
      name: "Technical & Web Development",
      description: "Full-stack web, mobile, and software engineering",
      type: "OPERATIONAL" as const,
      order: 2,
    },
    {
      id: "team-media",
      name: "Media & PR Management",
      description: "Public relations, social media, content, and branding",
      type: "OPERATIONAL" as const,
      order: 3,
    },
  ];

  const teamsData = allTeams.filter((t) => t.type === "OPERATIONAL");

  for (const t of allTeams) {
    await prisma.team.upsert({
      where: { id: t.id },
      create: t,
      update: {
        name: t.name,
        description: t.description,
        type: t.type,
        order: t.order,
      },
    });
  }

  // Grant Media & PR Team access to Gallery Management
  const galleryPerm = await prisma.permission.findFirst({
    where: { resource: "cms_gallery", action: "manage" },
  });
  if (galleryPerm) {
    await prisma.teamPermission.upsert({
      where: {
        teamId_permissionId: {
          teamId: "team-media",
          permissionId: galleryPerm.id,
        },
      },
      create: {
        teamId: "team-media",
        permissionId: galleryPerm.id,
      },
      update: {},
    });
  }
  console.log(`   ✓ Seeded ${teamsData.length} induction teams`);

  // 2. Interview Rounds & Parameters for each team (1 round, 2 parameters)
  for (const t of teamsData) {
    const round1Id = `round-${t.id}-1`;

    await prisma.interviewRound.upsert({
      where: { id: round1Id },
      create: {
        id: round1Id,
        teamId: t.id,
        roundNumber: 1,
        roundName: "Technical Aptitude & Screening",
        duration: 30,
        active: true,
      },
      update: { roundName: "Technical Aptitude & Screening", active: true },
    });

    const paramsRound1 = [
      { id: `param-${round1Id}-1`, parameterName: "Technical Fundamentals", weighttage: 50 },
      { id: `param-${round1Id}-2`, parameterName: "Problem Solving & Logic", weighttage: 50 },
    ];

    for (const p of paramsRound1) {
      await prisma.evaluationParameter.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          roundId: round1Id,
          parameterName: p.parameterName,
          weighttage: p.weighttage,
        },
        update: { parameterName: p.parameterName, weighttage: p.weighttage },
      });
    }
  }
  console.log("   ✓ Seeded interview rounds & evaluation parameters");

  // 3. Find interviewer (Super Admin)
  const interviewer = await prisma.user.findFirst({
    where: { email: "madhukark.ug25.cs@nitp.ac.in" },
  });

  const interviewerId = interviewer?.id || (await prisma.user.findFirstOrThrow()).id;

  // 4. Induction Candidates (Separate from Users table)
  const candidateSeeds = [
    {
      id: "cand-101",
      appId: "app-101",
      name: "Aarav Sharma",
      email: "aarav.sharma@nitp.ac.in",
      rollNo: "2304081",
      branch: "Computer Science & Engineering",
      phone: "+91 9876543210",
      teamId: "team-tech",
      status: "ACCEPTED" as const, // Selected candidate ready for conversion to User
      priority: 1,
      notes: "Strong knowledge of React, Next.js, and Node.js. Built full-stack products.",
      score: 4.5,
      linkedUserId: null, // Distinct candidate entity, not yet converted
    },
    {
      id: "cand-102",
      appId: "app-102",
      name: "Sneha Kumari",
      email: "sneha.kumari@nitp.ac.in",
      rollNo: "2306012",
      branch: "Electronics & Communication",
      phone: "+91 9123456780",
      teamId: "team-media",
      status: "SHORTLISTED" as const,
      priority: 1,
      notes: "Excellent public speaking and graphic design skills.",
      score: 4.2,
      linkedUserId: null,
    },
  ];

  for (const c of candidateSeeds) {
    // 4.1 Upsert Candidate in the dedicated Candidate table (NOT User table)
    const candidate = await prisma.candidate.upsert({
      where: { email: c.email },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        rollNumber: c.rollNo,
        branch: c.branch,
        phone: c.phone,
        year: 2,
        linkedUserId: c.linkedUserId,
      },
      update: {
        name: c.name,
        rollNumber: c.rollNo,
        branch: c.branch,
        phone: c.phone,
        linkedUserId: c.linkedUserId,
        userCreatedById: null,
        userCreatedAt: null,
      },
    });

    // 4.2 Ensure Application linked to Candidate
    const app = await prisma.application.upsert({
      where: { id: c.appId },
      create: {
        id: c.appId,
        candidateId: candidate.id,
        teamId: c.teamId,
        priority: c.priority,
        currentStatus: c.status,
      },
      update: {
        candidateId: candidate.id,
        currentStatus: c.status,
        teamId: c.teamId,
      },
    });

    // 4.3 Ensure Interview
    const roundId = `round-${c.teamId}-1`;
    const interviewId = `interview-${c.appId}`;

    await prisma.interview.upsert({
      where: { id: interviewId },
      create: {
        id: interviewId,
        applicationId: app.id,
        roundId,
        InterviewerId: interviewerId,
        interviewNotes: c.notes,
        feedbackTags: ["Frontend", "Analytical", "Committed"],
        recommendation: c.status === "ACCEPTED" ? "Strong Hire" : "Under Consideration",
        conductAt: new Date(),
      },
      update: {
        interviewNotes: c.notes,
      },
    });

    // 4.4 Seed evaluation parameters scores
    const param1Id = `param-${roundId}-1`;
    await prisma.interviewEvaluation.upsert({
      where: {
        interviewId_parameterId: {
          interviewId,
          parameterId: param1Id,
        },
      },
      create: {
        interviewId,
        parameterId: param1Id,
        rawScore: c.score,
      },
      update: { rawScore: c.score },
    });
  }

  // Delete any leftover student test user records from previous turns
  await prisma.user.deleteMany({
    where: {
      email: { in: ["aarav.sharma@nitp.ac.in", "sneha.kumari@nitp.ac.in"] },
    },
  });

  console.log(`✅ Seeded ${candidateSeeds.length} distinct induction candidates (app-101 and app-102)\n`);
}
