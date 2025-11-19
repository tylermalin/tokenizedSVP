import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export class InvestorService {
  async getProfile(investorId: string) {
    // investorId is a User ID, so query by userId
    const investor = await prisma.investor.findUnique({
      where: { userId: investorId },
      select: {
        id: true,
        User: {
          select: {
            email: true,
          },
        },
        walletAddress: true,
        kycStatus: true,
        amlStatus: true,
        jurisdiction: true,
        createdAt: true,
      },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    return {
      id: investor.id,
      email: investor.User.email,
      walletAddress: investor.walletAddress,
      kycStatus: investor.kycStatus,
      amlStatus: investor.amlStatus,
      jurisdiction: investor.jurisdiction,
      createdAt: investor.createdAt,
    };
  }

  async getTokenHoldings(investorId: string) {
    // investorId is a User ID, so first get Investor record
    const investor = await prisma.investor.findUnique({
      where: { userId: investorId },
      select: { id: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    const holdings = await prisma.capTable.findMany({
      where: { investorId: investor.id }, // Use Investor record ID
      include: {
        SPV: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });

    return holdings.map((holding) => ({
      spvId: holding.spvId,
      spvName: holding.SPV.name,
      spvType: holding.SPV.type,
      spvStatus: holding.SPV.status,
      tokenBalance: holding.tokenBalance,
      onChainBalance: holding.onChainBalance,
    }));
  }

  async getDistributions(investorId: string) {
    // investorId is a User ID, so first get Investor record
    const investor = await prisma.investor.findUnique({
      where: { userId: investorId },
      select: { id: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    // Get all SPVs where investor has tokens
    const spvIds = await prisma.capTable
      .findMany({
        where: { investorId: investor.id }, // Use Investor record ID
        select: { spvId: true },
      })
      .then((rows) => rows.map((r) => r.spvId));

    const distributions = await prisma.distribution.findMany({
      where: {
        spvId: { in: spvIds },
      },
      include: {
        SPV: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        processedAt: "desc",
      },
    });

    // Calculate investor's share for each distribution
    return distributions.map((dist) => {
      // TODO: Calculate actual share based on token balance at time of distribution
      return {
        id: dist.id,
        spvId: dist.spvId,
        spvName: dist.SPV.name,
        amount: dist.amount,
        perTokenAmount: dist.perTokenAmount,
        distributionType: dist.distributionType,
        processedAt: dist.processedAt,
      };
    });
  }

  async getSubscriptions(investorId: string) {
    // investorId is a User ID, so first get Investor record
    const investor = await prisma.investor.findUnique({
      where: { userId: investorId },
      select: { id: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { investorId: investor.id }, // Use Investor record ID
      include: {
        SPV: {
          select: {
            id: true,
            name: true,
            status: true,
            targetAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscriptions.map((sub) => ({
      id: sub.id,
      spvId: sub.spvId,
      spvName: sub.SPV.name,
      spvStatus: sub.SPV.status,
      amount: sub.amount,
      status: sub.status,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));
  }

  async updateProfile(investorId: string, data: any) {
    // investorId is a User ID, so query by userId
    return prisma.investor.update({
      where: { userId: investorId },
      data: {
        ...(data.walletAddress && { walletAddress: data.walletAddress }),
        ...(data.jurisdiction && { jurisdiction: data.jurisdiction }),
      },
    });
  }
}
