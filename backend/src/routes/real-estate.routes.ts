import { Router } from 'express';
import { RealEstateController } from '../controllers/real-estate.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  requestDrawdownSchema,
  recordMilestoneSchema
} from '../schemas/real-estate.schema';

const router = Router();
const controller = new RealEstateController();

// Request drawdown
router.post(
  '/spvs/:spvId/drawdowns',
  authenticate,
  validateRequest(requestDrawdownSchema),
  controller.requestDrawdown.bind(controller)
);

// List drawdowns
router.get(
  '/spvs/:spvId/drawdowns',
  authenticate,
  controller.listDrawdowns.bind(controller)
);

// Approve/reject drawdown
router.patch(
  '/drawdowns/:id',
  authenticate,
  controller.approveDrawdown.bind(controller)
);

// Record milestone
router.post(
  '/spvs/:spvId/milestones',
  authenticate,
  validateRequest(recordMilestoneSchema),
  controller.recordMilestone.bind(controller)
);

// List milestones
router.get(
  '/spvs/:spvId/milestones',
  authenticate,
  controller.listMilestones.bind(controller)
);

export default router;

