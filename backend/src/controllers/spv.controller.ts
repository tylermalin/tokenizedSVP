import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SPVService } from '../services/spv.service';
import { AppError } from '../middleware/errorHandler';

export class SPVController {
  private spvService: SPVService;

  constructor() {
    this.spvService = new SPVService();
  }

  async createSPV(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user!.id;
      const spv = await this.spvService.createSPV({
        ...req.body,
        managerId
      });
      res.status(201).json(spv);
    } catch (error) {
      throw error;
    }
  }

  async getSPVById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const spv = await this.spvService.getSPVById(id, req.user!.id);
      res.json(spv);
    } catch (error) {
      throw error;
    }
  }

  async listSPVs(req: AuthRequest, res: Response) {
    try {
      const filters = {
        managerId: req.user!.role === 'manager' ? req.user!.id : undefined,
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined
      };
      const spvs = await this.spvService.listSPVs(filters);
      res.json(spvs);
    } catch (error) {
      throw error;
    }
  }

  async updateSPV(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const spv = await this.spvService.updateSPV(id, req.body, req.user!.id);
      res.json(spv);
    } catch (error) {
      throw error;
    }
  }

  async inviteLPs(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { emails } = req.body;
      await this.spvService.inviteLPs(id, emails, req.user!.id);
      res.json({ message: 'Invitations sent' });
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const subscriptions = await this.spvService.getSubscriptions(id, req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      throw error;
    }
  }

  async initiateLiquidation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.spvService.initiateLiquidation(id, req.user!.id);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }
}

