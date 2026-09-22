-- CreateEnum
CREATE TYPE "EventResourceAction" AS ENUM ('ACQUIRE', 'RELEASE');

-- DropIndex
DROP INDEX "EventResource_eventId_idx";

-- AlterTable
ALTER TABLE "EventTeamResource" ADD COLUMN     "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "releasedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EventResourceAuditLog" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "action" "EventResourceAction" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventResourceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventResourceAuditLog_teamId_idx" ON "EventResourceAuditLog"("teamId");

-- CreateIndex
CREATE INDEX "EventResourceAuditLog_resourceId_idx" ON "EventResourceAuditLog"("resourceId");

-- CreateIndex
CREATE INDEX "EventResourceAuditLog_timestamp_idx" ON "EventResourceAuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "EventResourceAuditLog" ADD CONSTRAINT "EventResourceAuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "EventTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResourceAuditLog" ADD CONSTRAINT "EventResourceAuditLog_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "EventResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
