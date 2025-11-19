import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  private investorService: InvestorService;

  constructor() {
    this.investorService = new InvestorService();
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await this.investorService.getProfile(req.user!.id);
      res.json(profile);
    } catch (error) {
      throw error;
    }
  }

  async getTokenHoldings(req: AuthRequest, res: Response) {
    try {
      const holdings = await this.investorService.getTokenHoldings(req.user!.id);
      res.json(holdings);
    } catch (error) {
      throw error;
    }
  }

  async getDistributions(req: AuthRequest, res: Response) {
    try {
      const distributions = await this.investorService.getDistributions(req.user!.id);
      res.json(distributions);
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptions(req: AuthRequest, res: Response) {
    try {
      const subscriptions = await this.investorService.getSubscriptions(req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await this.investorService.updateProfile(
        req.user!.id,
        req.body
      );
      res.json(profile);
    } catch (error) {
      throw error;
    }
  }
}

