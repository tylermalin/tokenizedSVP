-- AlterTable: Add admin review fields to Investor
ALTER TABLE "Investor" ADD COLUMN "adminKycStatus" TEXT;
ALTER TABLE "Investor" ADD COLUMN "adminKycNotes" TEXT;
ALTER TABLE "Investor" ADD COLUMN "kycReviewedBy" TEXT;
ALTER TABLE "Investor" ADD COLUMN "kycReviewedAt" TIMESTAMP(3);

-- AlterTable: Add admin review fields to Manager
ALTER TABLE "Manager" ADD COLUMN "adminKycStatus" TEXT;
ALTER TABLE "Manager" ADD COLUMN "adminKycNotes" TEXT;
ALTER TABLE "Manager" ADD COLUMN "kycReviewedBy" TEXT;
ALTER TABLE "Manager" ADD COLUMN "kycReviewedAt" TIMESTAMP(3);

-- AlterTable: Add admin review fields to SPV
ALTER TABLE "SPV" ADD COLUMN "adminStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "SPV" ADD COLUMN "adminNotes" TEXT;
ALTER TABLE "SPV" ADD COLUMN "reviewedBy" TEXT;
ALTER TABLE "SPV" ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- CreateTable: AdminReview
CREATE TABLE "AdminReview" (
    "id" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "reviewedBy" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminReview_reviewType_status_idx" ON "AdminReview"("reviewType", "status");
CREATE INDEX "AdminReview_entityId_idx" ON "AdminReview"("entityId");
CREATE INDEX "AdminReview_reviewedBy_idx" ON "AdminReview"("reviewedBy");

-- AddForeignKey: Investor KYC Reviewed By
ALTER TABLE "Investor" ADD CONSTRAINT "Investor_kycReviewedBy_fkey" FOREIGN KEY ("kycReviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Manager KYC Reviewed By
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_kycReviewedBy_fkey" FOREIGN KEY ("kycReviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: SPV Reviewed By
ALTER TABLE "SPV" ADD CONSTRAINT "SPV_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: AdminReview Reviewer
ALTER TABLE "AdminReview" ADD CONSTRAINT "AdminReview_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

