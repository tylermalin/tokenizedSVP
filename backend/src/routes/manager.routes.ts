import { Router } from 'express';
import { ManagerController } from '../controllers/manager.controller';
import { ComplianceController } from '../controllers/compliance.controller';
import { authenticate, requireManager } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateManagerProfileSchema, initiateManagerKYCSchema } from '../schemas/manager.schema';

const router = Router();
const managerController = new ManagerController();
const complianceController = new ComplianceController();

// Manager profile routes
router.get(
  '/me',
  authenticate,
  requireManager,
  managerController.getProfile.bind(managerController)
);

router.get(
  '/profile',
  authenticate,
  requireManager,
  managerController.getProfile.bind(managerController)
);

router.put(
  '/profile',
  authenticate,
  requireManager,
  validateRequest(updateManagerProfileSchema),
  managerController.updateProfile.bind(managerController)
);

// Manager SPV routes
router.get(
  '/spvs',
  authenticate,
  requireManager,
  managerController.getAllSPVs.bind(managerController)
);

router.get(
  '/spvs/:spvId',
  authenticate,
  requireManager,
  managerController.getSPVDetails.bind(managerController)
);

// Fundraising info routes
router.get(
  '/fundraising',
  authenticate,
  requireManager,
  managerController.getFundraisingInfo.bind(managerController)
);

// Manager KYC routes
router.post(
  '/kyc/initiate',
  authenticate,
  requireManager,
  validateRequest(initiateManagerKYCSchema),
  complianceController.initiateManagerKYC.bind(complianceController)
);

router.get(
  '/kyc/status',
  authenticate,
  requireManager,
  complianceController.getManagerKYCStatus.bind(complianceController)
);

router.post(
  '/kyc/token',
  authenticate,
  requireManager,
  complianceController.generateManagerSDKToken.bind(complianceController)
);

export default router;

