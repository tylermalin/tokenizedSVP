import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RealEstateService } from '../services/real-estate.service';

export class RealEstateController {
  private realEstateService: RealEstateService;

  constructor() {
    this.realEstateService = new RealEstateService();
  }

  async requestDrawdown(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const drawdown = await this.realEstateService.requestDrawdown(
        spvId,
        req.body,
        req.user!.id
      );
      res.status(201).json(drawdown);
    } catch (error) {
      throw error;
    }
  }

  async listDrawdowns(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const drawdowns = await this.realEstateService.listDrawdowns(
        spvId,
        req.user!.id
      );
      res.json(drawdowns);
    } catch (error) {
      throw error;
    }
  }

  async approveDrawdown(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const drawdown = await this.realEstateService.approveDrawdown(
        id,
        req.body,
        req.user!.id
      );
      res.json(drawdown);
    } catch (error) {
      throw error;
    }
  }

  async recordMilestone(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const milestone = await this.realEstateService.recordMilestone(
        spvId,
        req.body,
        req.user!.id
      );
      res.status(201).json(milestone);
    } catch (error) {
      throw error;
    }
  }

  async listMilestones(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const milestones = await this.realEstateService.listMilestones(
        spvId,
        req.user!.id
      );
      res.json(milestones);
    } catch (error) {
      throw error;
    }
  }
}

