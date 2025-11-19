import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async createSubscription(req: AuthRequest, res: Response) {
    try {
      const investorId = req.user!.id;
      const subscription = await this.subscriptionService.createSubscription({
        ...req.body,
        investorId
      });
      res.status(201).json(subscription);
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.getSubscriptionById(
        id,
        req.user!.id
      );
      res.json(subscription);
    } catch (error) {
      throw error;
    }
  }

  async submitFunding(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.submitFunding(
        id,
        req.body,
        req.user!.id
      );
      res.json(subscription);
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptionStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const status = await this.subscriptionService.getSubscriptionStatus(
        id,
        req.user!.id
      );
      res.json(status);
    } catch (error) {
      throw error;
    }
  }

  async submitWireTransfer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.submitWireTransfer(
        id,
        req.body,
        req.user!.id
      );
      res.json(subscription);
    } catch (error) {
      throw error;
    }
  }
}

