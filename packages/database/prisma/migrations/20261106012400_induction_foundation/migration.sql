-- CreateEnum
CREATE TYPE "InductionAccountType" AS ENUM ('INTERVIEWER', 'EVALUATOR', 'TEAM_COORDINATOR', 'INDUCTION_VOLUNTEER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "InductionAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "InterviewRound" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "feedbackTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "recommendation" TEXT;

-- AlterTable
ALTER TABLE "InterviewEvaluation" ALTER COLUMN "rawScore" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InductionAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InductionAccountType" NOT NULL,
    "status" "InductionAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "teamId" TEXT,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InductionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InductionAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InductionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_rollNumber_key" ON "StudentProfile"("rollNumber");

-- CreateIndex
CREATE INDEX "StudentProfile_userId_idx" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_rollNumber_idx" ON "StudentProfile"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InductionAccount_userId_key" ON "InductionAccount"("userId");

-- CreateIndex
CREATE INDEX "InductionAccount_userId_idx" ON "InductionAccount"("userId");

-- CreateIndex
CREATE INDEX "InductionAccount_type_idx" ON "InductionAccount"("type");

-- CreateIndex
CREATE INDEX "InductionAccount_status_idx" ON "InductionAccount"("status");

-- CreateIndex
CREATE INDEX "InductionAccount_teamId_idx" ON "InductionAccount"("teamId");

-- CreateIndex
CREATE INDEX "InductionAuditLog_userId_idx" ON "InductionAuditLog"("userId");

-- CreateIndex
CREATE INDEX "InductionAuditLog_targetType_targetId_idx" ON "InductionAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "InductionAuditLog_timestamp_idx" ON "InductionAuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InductionAccount" ADD CONSTRAINT "InductionAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InductionAccount" ADD CONSTRAINT "InductionAccount_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InductionAccount" ADD CONSTRAINT "InductionAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InductionAuditLog" ADD CONSTRAINT "InductionAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

