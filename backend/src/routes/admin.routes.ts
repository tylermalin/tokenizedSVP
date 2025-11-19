import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import {
  mintTokensSchema,
  updateNAVSchema,
  triggerDistributionSchema,
  updateWhitelistSchema,
  reviewInvestorKYCSchema,
  reviewManagerKYCSchema,
  reviewSPVSchema,
} from "../schemas/admin.schema";

const router = Router();
const controller = new AdminController();

// Admin Dashboard
router.get(
  "/dashboard",
  authenticate,
  requireAdmin,
  controller.getDashboard.bind(controller)
);

// Review endpoints
router.get(
  "/reviews/history",
  authenticate,
  requireAdmin,
  controller.getReviewHistory.bind(controller)
);

// Investor KYC Review
router.get(
  "/reviews/investor/:investorId",
  authenticate,
  requireAdmin,
  controller.getInvestorForReview.bind(controller)
);

router.post(
  "/reviews/investor/:investorId",
  authenticate,
  requireAdmin,
  validateRequest(reviewInvestorKYCSchema),
  controller.reviewInvestorKYC.bind(controller)
);

// Manager KYC Review
router.get(
  "/reviews/manager/:managerId",
  authenticate,
  requireAdmin,
  controller.getManagerForReview.bind(controller)
);

router.post(
  "/reviews/manager/:managerId",
  authenticate,
  requireAdmin,
  validateRequest(reviewManagerKYCSchema),
  controller.reviewManagerKYC.bind(controller)
);

// SPV Review
router.get(
  "/reviews/spv/:spvId",
  authenticate,
  requireAdmin,
  controller.getSPVForReview.bind(controller)
);

router.post(
  "/reviews/spv/:spvId",
  authenticate,
  requireAdmin,
  validateRequest(reviewSPVSchema),
  controller.reviewSPV.bind(controller)
);

// Mint tokens (after funding)
router.post(
  "/mint",
  authenticate,
  requireAdmin,
  validateRequest(mintTokensSchema),
  controller.mintTokens.bind(controller)
);

// Burn tokens (liquidation)
router.post(
  "/burn",
  authenticate,
  requireAdmin,
  validateRequest(mintTokensSchema), // Reuse schema
  controller.burnTokens.bind(controller)
);

// Update whitelist
router.post(
  "/whitelist",
  authenticate,
  requireAdmin,
  validateRequest(updateWhitelistSchema),
  controller.updateWhitelist.bind(controller)
);

// Update NAV
router.post(
  "/nav",
  authenticate,
  requireAdmin,
  validateRequest(updateNAVSchema),
  controller.updateNAV.bind(controller)
);

// Trigger distribution
router.post(
  "/distribution",
  authenticate,
  requireAdmin,
  validateRequest(triggerDistributionSchema),
  controller.triggerDistribution.bind(controller)
);

// Account Management
router.post(
  "/accounts/:userId/approve",
  authenticate,
  requireAdmin,
  validateRequest(reviewInvestorKYCSchema), // Reuse schema
  controller.approveAccount.bind(controller)
);

// KYC Override
router.post(
  "/kyc/investor/:investorId/override",
  authenticate,
  requireAdmin,
  validateRequest(reviewInvestorKYCSchema),
  controller.overrideInvestorKYC.bind(controller)
);

router.post(
  "/kyc/manager/:managerId/override",
  authenticate,
  requireAdmin,
  validateRequest(reviewManagerKYCSchema),
  controller.overrideManagerKYC.bind(controller)
);

// Active Projects
router.get(
  "/spvs/active",
  authenticate,
  requireAdmin,
  controller.getAllActiveSPVs.bind(controller)
);

// User Management
router.get(
  "/users",
  authenticate,
  requireAdmin,
  controller.getAllUsers.bind(controller)
);

export default router;
