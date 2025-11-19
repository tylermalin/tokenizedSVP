import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticate, requireManager } from '../middleware/auth';

const router = Router();
const controller = new InvitationController();

// Validate invitation (used during registration)
router.post('/validate', controller.validateInvitation.bind(controller));

// Manager routes - get invitations for an SPV (must be before /:token route)
router.get(
  '/spv/:spvId',
  authenticate,
  requireManager,
  controller.getSPVInvitations.bind(controller)
);

// Public route - get invitation details by token (must be last to avoid matching /spv/:spvId)
router.get('/:token', controller.getInvitationByToken.bind(controller));

export default router;

