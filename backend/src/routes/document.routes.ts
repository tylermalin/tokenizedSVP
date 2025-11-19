import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new DocumentController();

// Get all documents for an SPV
router.get(
  '/spv/:spvId',
  authenticate,
  controller.getSPVDocuments.bind(controller)
);

// Get a specific document
router.get(
  '/spv/:spvId/:documentType',
  authenticate,
  controller.getDocument.bind(controller)
);

// Regenerate documents (admin/manager only)
router.post(
  '/spv/:spvId/regenerate',
  authenticate,
  controller.regenerateDocuments.bind(controller)
);

export default router;

