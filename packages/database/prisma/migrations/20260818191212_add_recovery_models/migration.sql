-- CreateTable
CREATE TABLE "AccountRecoveryRequest" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCooldown" (
    "phoneNumber" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpCooldown_pkey" PRIMARY KEY ("phoneNumber")
);

-- CreateIndex
CREATE INDEX "AccountRecoveryRequest_phoneNumber_idx" ON "AccountRecoveryRequest"("phoneNumber");

-- CreateIndex
CREATE INDEX "AccountRecoveryRequest_windowStart_idx" ON "AccountRecoveryRequest"("windowStart");
