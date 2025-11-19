import { Router } from 'express';
import multer from 'multer';
import { ComplianceController } from '../controllers/compliance.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { initiateKYCSchema } from '../schemas/compliance.schema';
import { webhookBodyParser } from '../middleware/webhookBodyParser';

const router = Router();
const controller = new ComplianceController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initiate KYC for investor
router.post(
  '/kyc/initiate',
  authenticate,
  validateRequest(initiateKYCSchema),
  controller.initiateKYC.bind(controller)
);

// Get KYC status
router.get(
  '/kyc/status',
  authenticate,
  controller.getKYCStatus.bind(controller)
);

// Generate SDK token for frontend
router.post(
  '/kyc/token',
  authenticate,
  controller.generateSDKToken.bind(controller)
);

// Webhook endpoint for Sumsub (no auth - uses signature verification)
// Note: This route must use raw body parser for signature verification
router.post(
  '/webhook/sumsub',
  webhookBodyParser,
  controller.handleWebhook.bind(controller)
);

// Submit KYC form (mock - for demo)
router.post(
  '/kyc/submit',
  authenticate,
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
  ]),
  controller.submitKYCForm.bind(controller)
);

// Manager KYC routes
router.post(
  '/kyc/manager/initiate',
  authenticate,
  validateRequest(initiateKYCSchema),
  controller.initiateManagerKYC.bind(controller)
);

router.get(
  '/kyc/manager/status',
  authenticate,
  controller.getManagerKYCStatus.bind(controller)
);

router.post(
  '/kyc/manager/token',
  authenticate,
  controller.generateManagerSDKToken.bind(controller)
);

router.post(
  '/kyc/manager/submit',
  authenticate,
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
  ]),
  controller.submitManagerKYCForm.bind(controller)
);

export default router;

