import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class RealEstateService {
  async requestDrawdown(spvId: string, data: {
    amount: number;
    milestone: string;
    documents?: string[];
  }, userId: string) {
    // Verify SPV is real estate type
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId }
    });

    if (!spv || spv.type !== 'real_estate') {
      throw new AppError('SPV not found or not a real estate SPV', 404);
    }

    // Verify user is the manager
    if (spv.managerId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Create drawdown request
    const drawdown = await prisma.drawdown.create({
      data: {
        spvId,
        developerId: userId,
        amount: data.amount,
        milestone: data.milestone,
        status: 'requested',
        documentsHash: data.documents ? JSON.stringify(data.documents) : null,
        requestedAt: new Date()
      }
    });

    return drawdown;
  }

  async listDrawdowns(spvId: string, userId: string) {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId }
    });

    if (!spv) {
      throw new AppError('SPV not found', 404);
    }

    // Check access
    const hasAccess = spv.managerId === userId || 
      await prisma.subscription.findFirst({
        where: {
          spvId,
          investorId: userId
        }
      });

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    return prisma.drawdown.findMany({
      where: { spvId },
      orderBy: { requestedAt: 'desc' }
    });
  }

  async approveDrawdown(drawdownId: string, data: {
    approved: boolean;
    reason?: string;
  }, userId: string) {
    const drawdown = await prisma.drawdown.findUnique({
      where: { id: drawdownId },
      include: { spv: true }
    });

    if (!drawdown) {
      throw new AppError('Drawdown not found', 404);
    }

    // Only admin or manager can approve
    // TODO: Add admin role check
    if (drawdown.spv.managerId !== userId) {
      throw new AppError('Access denied', 403);
    }

    if (data.approved) {
      // Update drawdown status
      const updated = await prisma.drawdown.update({
        where: { id: drawdownId },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
      });

      // TODO: Release funds to developer
      // This would integrate with banking service

      return updated;
    } else {
      return prisma.drawdown.update({
        where: { id: drawdownId },
        data: {
          status: 'rejected',
          rejectionReason: data.reason
        }
      });
    }
  }

  async recordMilestone(spvId: string, data: {
    milestoneId?: string;
    description: string;
    proof?: string;
  }, userId: string) {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId }
    });

    if (!spv || spv.type !== 'real_estate') {
      throw new AppError('SPV not found or not a real estate SPV', 404);
    }

    if (spv.managerId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const milestone = await prisma.milestone.create({
      data: {
        spvId,
        description: data.description,
        proof: data.proof,
        completed: true,
        completionTime: new Date()
      }
    });

    // TODO: Notify investors of milestone completion

    return milestone;
  }

  async listMilestones(spvId: string, userId: string) {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId }
    });

    if (!spv) {
      throw new AppError('SPV not found', 404);
    }

    // Check access
    const hasAccess = spv.managerId === userId || 
      await prisma.subscription.findFirst({
        where: {
          spvId,
          investorId: userId
        }
      });

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    return prisma.milestone.findMany({
      where: { spvId },
      orderBy: { completionTime: 'desc' }
    });
  }
}

