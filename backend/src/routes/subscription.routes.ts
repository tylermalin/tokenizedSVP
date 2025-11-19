import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createSubscriptionSchema } from '../schemas/subscription.schema';

const router = Router();
const controller = new SubscriptionController();

// Create subscription
router.post(
  '/',
  authenticate,
  validateRequest(createSubscriptionSchema),
  controller.createSubscription.bind(controller)
);

// Get subscription by ID
router.get('/:id', authenticate, controller.getSubscriptionById.bind(controller));

// Submit funding details
router.post(
  '/:id/fund',
  authenticate,
  controller.submitFunding.bind(controller)
);

// Get subscription status
router.get(
  '/:id/status',
  authenticate,
  controller.getSubscriptionStatus.bind(controller)
);

// Submit wire transfer details
router.post(
  '/:id/wire-transfer',
  authenticate,
  controller.submitWireTransfer.bind(controller)
);

export default router;

