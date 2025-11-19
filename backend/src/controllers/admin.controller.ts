import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AdminService } from "../services/admin.service";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const dashboard = await this.adminService.getDashboard();
      res.json(dashboard);
    } catch (error) {
      throw error;
    }
  }

  async reviewInvestorKYC(req: AuthRequest, res: Response) {
    try {
      const { investorId } = req.params;
      const { action, notes } = req.body;
      const result = await this.adminService.reviewInvestorKYC(
        investorId,
        req.user!.id,
        action,
        notes
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async reviewManagerKYC(req: AuthRequest, res: Response) {
    try {
      const { managerId } = req.params;
      const { action, notes } = req.body;
      const result = await this.adminService.reviewManagerKYC(
        managerId,
        req.user!.id,
        action,
        notes
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async reviewSPV(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const { action, notes } = req.body;
      const result = await this.adminService.reviewSPV(
        spvId,
        req.user!.id,
        action,
        notes
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getSPVForReview(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const spv = await this.adminService.getSPVForReview(spvId);
      res.json(spv);
    } catch (error) {
      throw error;
    }
  }

  async getInvestorForReview(req: AuthRequest, res: Response) {
    try {
      const { investorId } = req.params;
      const investor = await this.adminService.getInvestorForReview(investorId);
      res.json(investor);
    } catch (error) {
      throw error;
    }
  }

  async getManagerForReview(req: AuthRequest, res: Response) {
    try {
      const { managerId } = req.params;
      const manager = await this.adminService.getManagerForReview(managerId);
      res.json(manager);
    } catch (error) {
      throw error;
    }
  }

  async getReviewHistory(req: AuthRequest, res: Response) {
    try {
      const { reviewType, status, limit } = req.query;
      const reviews = await this.adminService.getReviewHistory({
        reviewType: reviewType as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(reviews);
    } catch (error) {
      throw error;
    }
  }

  async mintTokens(req: AuthRequest, res: Response) {
    try {
      const result = await this.adminService.mintTokens(req.body);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async burnTokens(req: AuthRequest, res: Response) {
    try {
      const result = await this.adminService.burnTokens(req.body);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async updateWhitelist(req: AuthRequest, res: Response) {
    try {
      const result = await this.adminService.updateWhitelist(req.body);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async updateNAV(req: AuthRequest, res: Response) {
    try {
      const result = await this.adminService.updateNAV(req.body);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async triggerDistribution(req: AuthRequest, res: Response) {
    try {
      const result = await this.adminService.triggerDistribution(req.body);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async approveAccount(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { action, rejectionReason } = req.body;
      const result = await this.adminService.approveAccount(
        userId,
        req.user!.id,
        action,
        rejectionReason
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async overrideInvestorKYC(req: AuthRequest, res: Response) {
    try {
      const { investorId } = req.params;
      const { action, notes } = req.body;
      const result = await this.adminService.overrideInvestorKYC(
        investorId,
        req.user!.id,
        action,
        notes
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async overrideManagerKYC(req: AuthRequest, res: Response) {
    try {
      const { managerId } = req.params;
      const { action, notes } = req.body;
      const result = await this.adminService.overrideManagerKYC(
        managerId,
        req.user!.id,
        action,
        notes
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getAllActiveSPVs(req: AuthRequest, res: Response) {
    try {
      const spvs = await this.adminService.getAllActiveSPVs();
      res.json(spvs);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { role, accountStatus, limit } = req.query;
      const users = await this.adminService.getAllUsers({
        role: role as string,
        accountStatus: accountStatus as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(users);
    } catch (error) {
      throw error;
    }
  }
}
