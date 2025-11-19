import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ManagerService } from '../services/manager.service';

export class ManagerController {
  private managerService: ManagerService;

  constructor() {
    this.managerService = new ManagerService();
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await this.managerService.getProfile(req.user!.id);
      res.json(profile);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await this.managerService.updateProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (error) {
      throw error;
    }
  }

  async getAllSPVs(req: AuthRequest, res: Response) {
    try {
      const spvs = await this.managerService.getAllSPVs(req.user!.id);
      res.json(spvs);
    } catch (error) {
      throw error;
    }
  }

  async getFundraisingInfo(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.query;
      const info = await this.managerService.getFundraisingInfo(
        req.user!.id,
        spvId as string | undefined
      );
      res.json(info);
    } catch (error) {
      throw error;
    }
  }

  async getSPVDetails(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const details = await this.managerService.getSPVDetails(req.user!.id, spvId);
      res.json(details);
    } catch (error) {
      throw error;
    }
  }
}

