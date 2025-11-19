import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new InvestorController();

// Get current investor profile
router.get('/me', authenticate, controller.getProfile.bind(controller));

// Get token holdings
router.get('/me/tokens', authenticate, controller.getTokenHoldings.bind(controller));

// Get distribution history
router.get('/me/distributions', authenticate, controller.getDistributions.bind(controller));

// Get subscriptions
router.get('/me/subscriptions', authenticate, controller.getSubscriptions.bind(controller));

// Update investor profile
router.patch('/me', authenticate, controller.updateProfile.bind(controller));

export default router;

