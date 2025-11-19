-- CreateTable
CREATE TABLE "CapTable" (
    "id" TEXT NOT NULL,
    "spvId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "tokenBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onChainBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "spvId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "distributionType" TEXT NOT NULL,
    "perTokenAmount" DOUBLE PRECISION NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drawdown" (
    "id" TEXT NOT NULL,
    "spvId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "milestone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "documentsHash" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),

    CONSTRAINT "Drawdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT,
    "sumsubApplicantId" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'pending',
    "amlStatus" TEXT NOT NULL DEFAULT 'pending',
    "jurisdiction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "spvId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proof" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completionTime" TIMESTAMP(3),

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SPV" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'configuring',
    "managerId" TEXT NOT NULL,
    "tokenContractAddress" TEXT,
    "fundraisingStart" TIMESTAMP(3) NOT NULL,
    "fundraisingEnd" TIMESTAMP(3) NOT NULL,
    "targetAmount" DOUBLE PRECISION,
    "lifespanYears" INTEGER NOT NULL DEFAULT 3,
    "managementFee" DOUBLE PRECISION,
    "carryFee" DOUBLE PRECISION,
    "adminFee" DOUBLE PRECISION,
    "currentNAV" DOUBLE PRECISION,
    "navUpdatedAt" TIMESTAMP(3),
    "capitalStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SPV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "spvId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tokenAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "walletAddress" TEXT,
    "wireReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CapTable_investorId_idx" ON "CapTable"("investorId");

-- CreateIndex
CREATE INDEX "CapTable_spvId_idx" ON "CapTable"("spvId");

-- CreateIndex
CREATE UNIQUE INDEX "CapTable_spvId_investorId_key" ON "CapTable"("spvId", "investorId");

-- CreateIndex
CREATE INDEX "Distribution_processedAt_idx" ON "Distribution"("processedAt");

-- CreateIndex
CREATE INDEX "Distribution_spvId_idx" ON "Distribution"("spvId");

-- CreateIndex
CREATE INDEX "Drawdown_spvId_idx" ON "Drawdown"("spvId");

-- CreateIndex
CREATE INDEX "Drawdown_status_idx" ON "Drawdown"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_userId_key" ON "Investor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_walletAddress_key" ON "Investor"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_sumsubApplicantId_key" ON "Investor"("sumsubApplicantId");

-- CreateIndex
CREATE INDEX "Milestone_spvId_idx" ON "Milestone"("spvId");

-- CreateIndex
CREATE INDEX "Subscription_investorId_idx" ON "Subscription"("investorId");

-- CreateIndex
CREATE INDEX "Subscription_spvId_idx" ON "Subscription"("spvId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_spvId_investorId_key" ON "Subscription"("spvId", "investorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CapTable" ADD CONSTRAINT "CapTable_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapTable" ADD CONSTRAINT "CapTable_spvId_fkey" FOREIGN KEY ("spvId") REFERENCES "SPV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_spvId_fkey" FOREIGN KEY ("spvId") REFERENCES "SPV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drawdown" ADD CONSTRAINT "Drawdown_spvId_fkey" FOREIGN KEY ("spvId") REFERENCES "SPV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investor" ADD CONSTRAINT "Investor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_spvId_fkey" FOREIGN KEY ("spvId") REFERENCES "SPV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SPV" ADD CONSTRAINT "SPV_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_spvId_fkey" FOREIGN KEY ("spvId") REFERENCES "SPV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
