import { Router } from 'express';
import { SPVController } from '../controllers/spv.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createSPVSchema, updateSPVSchema } from '../schemas/spv.schema';

const router = Router();
const controller = new SPVController();

// Create new SPV
router.post(
  '/',
  authenticate,
  validateRequest(createSPVSchema),
  controller.createSPV.bind(controller)
);

// Get SPV by ID
router.get('/:id', authenticate, controller.getSPVById.bind(controller));

// List SPVs (with filters)
router.get('/', authenticate, controller.listSPVs.bind(controller));

// Update SPV configuration
router.patch(
  '/:id',
  authenticate,
  validateRequest(updateSPVSchema),
  controller.updateSPV.bind(controller)
);

// Invite LPs to SPV
router.post(
  '/:id/invite',
  authenticate,
  controller.inviteLPs.bind(controller)
);

// Get SPV subscriptions
router.get(
  '/:id/subscriptions',
  authenticate,
  controller.getSubscriptions.bind(controller)
);

// Initiate liquidation
router.post(
  '/:id/liquidate',
  authenticate,
  controller.initiateLiquidation.bind(controller)
);

export default router;

