-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('STARTUP_HUNT', 'TREASURE_HUNT', 'HACKATHON', 'QUIZ', 'COMPETITION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE', 'BUILDING', 'SUBMISSIONS_OPEN', 'SUBMISSIONS_CLOSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CheckpointType" AS ENUM ('QR', 'CODE', 'NFC', 'LOCATION', 'MANUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EventStaffRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'JUDGE', 'VIEWER');

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "issuer" TEXT;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTeam" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTeamMember" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStaff" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "EventStaffRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResource" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "content" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTeamResource" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "checkpointId" TEXT,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTeamResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCheckpoint" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT,
    "type" "CheckpointType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTeamCheckpoint" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "EventTeamCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventScan" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamCheckpointId" TEXT NOT NULL,
    "scannedByUserId" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSubmission" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT,
    "submittedByUserId" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_userId_idx" ON "EventParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_userId_key" ON "EventParticipant"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventTeam_eventId_idx" ON "EventTeam"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeam_eventId_name_key" ON "EventTeam"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeamMember_participantId_key" ON "EventTeamMember"("participantId");

-- CreateIndex
CREATE INDEX "EventTeamMember_teamId_idx" ON "EventTeamMember"("teamId");

-- CreateIndex
CREATE INDEX "EventStaff_userId_idx" ON "EventStaff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventStaff_eventId_userId_key" ON "EventStaff"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventResource_eventId_idx" ON "EventResource"("eventId");

-- CreateIndex
CREATE INDEX "EventTeamResource_teamId_idx" ON "EventTeamResource"("teamId");

-- CreateIndex
CREATE INDEX "EventTeamResource_resourceId_idx" ON "EventTeamResource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeamResource_teamId_resourceId_key" ON "EventTeamResource"("teamId", "resourceId");

-- CreateIndex
CREATE INDEX "EventCheckpoint_eventId_idx" ON "EventCheckpoint"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCheckpoint_eventId_sequence_key" ON "EventCheckpoint"("eventId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeamCheckpoint_tokenHash_key" ON "EventTeamCheckpoint"("tokenHash");

-- CreateIndex
CREATE INDEX "EventTeamCheckpoint_teamId_idx" ON "EventTeamCheckpoint"("teamId");

-- CreateIndex
CREATE INDEX "EventTeamCheckpoint_checkpointId_idx" ON "EventTeamCheckpoint"("checkpointId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeamCheckpoint_teamId_checkpointId_key" ON "EventTeamCheckpoint"("teamId", "checkpointId");

-- CreateIndex
CREATE INDEX "EventScan_teamId_idx" ON "EventScan"("teamId");

-- CreateIndex
CREATE INDEX "EventScan_scannedByUserId_idx" ON "EventScan"("scannedByUserId");

-- CreateIndex
CREATE INDEX "EventScan_scannedAt_idx" ON "EventScan"("scannedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventScan_teamId_teamCheckpointId_key" ON "EventScan"("teamId", "teamCheckpointId");

-- CreateIndex
CREATE INDEX "EventSubmission_eventId_idx" ON "EventSubmission"("eventId");

-- CreateIndex
CREATE INDEX "EventSubmission_teamId_idx" ON "EventSubmission"("teamId");

-- CreateIndex
CREATE INDEX "TeamJoinRequest_teamId_idx" ON "TeamJoinRequest"("teamId");

-- CreateIndex
CREATE INDEX "TeamJoinRequest_participantId_idx" ON "TeamJoinRequest"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamJoinRequest_teamId_participantId_key" ON "TeamJoinRequest"("teamId", "participantId");

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeam" ADD CONSTRAINT "EventTeam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamMember" ADD CONSTRAINT "EventTeamMember_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "EventParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamMember" ADD CONSTRAINT "EventTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResource" ADD CONSTRAINT "EventResource_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamResource" ADD CONSTRAINT "EventTeamResource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamResource" ADD CONSTRAINT "EventTeamResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "EventResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckpoint" ADD CONSTRAINT "EventCheckpoint_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamCheckpoint" ADD CONSTRAINT "EventTeamCheckpoint_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamCheckpoint" ADD CONSTRAINT "EventTeamCheckpoint_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "EventCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventScan" ADD CONSTRAINT "EventScan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventScan" ADD CONSTRAINT "EventScan_teamCheckpointId_fkey" FOREIGN KEY ("teamCheckpointId") REFERENCES "EventTeamCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventScan" ADD CONSTRAINT "EventScan_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubmission" ADD CONSTRAINT "EventSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubmission" ADD CONSTRAINT "EventSubmission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubmission" ADD CONSTRAINT "EventSubmission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "EventParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
