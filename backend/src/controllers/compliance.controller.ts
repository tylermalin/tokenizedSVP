import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ComplianceService } from '../services/compliance.service';
import { AppError } from '../middleware/errorHandler';

export class ComplianceController {
  private complianceService: ComplianceService;

  constructor() {
    this.complianceService = new ComplianceService();
  }

  async initiateKYC(req: AuthRequest, res: Response) {
    try {
      const investorId = req.user!.id;
      const { email } = req.body;

      const result = await this.complianceService.initiateKYC(investorId, email);
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }

  async getKYCStatus(req: AuthRequest, res: Response) {
    try {
      const investorId = req.user!.id;
      const status = await this.complianceService.getKYCStatus(investorId);
      res.json(status);
    } catch (error: any) {
      if (error.message === 'Investor not found') {
        return res.status(404).json({ error: 'Investor profile not found' });
      }
      throw error;
    }
  }

  async generateSDKToken(req: AuthRequest, res: Response) {
    try {
      const investorId = req.user!.id;
      const { SumsubService } = await import('../services/sumsub.service');
      const sumsubService = new SumsubService();
      
      const token = await sumsubService.generateSDKToken(investorId);
      res.json({ token });
    } catch (error) {
      throw error;
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-sumsub-signature'] as string;
      
      if (!signature) {
        throw new AppError('Missing signature', 401);
      }

      // Parse body if it's a Buffer (from raw parser)
      const rawBody = req.body instanceof Buffer ? req.body.toString() : undefined;
      const body = req.body instanceof Buffer 
        ? JSON.parse(req.body.toString())
        : req.body;

      const result = await this.complianceService.handleWebhook(body, signature, rawBody);
      res.json(result);
    } catch (error) {
      // Return 200 to prevent Sumsub from retrying
      res.status(200).json({ error: 'Webhook processing failed' });
    }
  }

  async initiateManagerKYC(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.id;
      const { email } = req.body;

      const result = await this.complianceService.initiateManagerKYC(managerId, email);
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }

  async getManagerKYCStatus(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.id;
      const status = await this.complianceService.getManagerKYCStatus(managerId);
      res.json(status);
    } catch (error: any) {
      if (error.message === 'Manager not found') {
        return res.status(404).json({ error: 'Manager profile not found' });
      }
      throw error;
    }
  }

  async generateManagerSDKToken(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.id;
      const { SumsubService } = await import('../services/sumsub.service');
      const sumsubService = new SumsubService();
      
      const token = await sumsubService.generateSDKToken(managerId);
      res.json({ token });
    } catch (error) {
      throw error;
    }
  }

  async submitKYCForm(req: AuthRequest, res: Response) {
    try {
      const investorId = req.user!.id;
      const files = (req as any).files;
      const result = await this.complianceService.submitKYCForm(investorId, req.body, files);
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }

  async submitManagerKYCForm(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.id;
      const files = (req as any).files;
      const result = await this.complianceService.submitManagerKYCForm(managerId, req.body, files);
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }
}

