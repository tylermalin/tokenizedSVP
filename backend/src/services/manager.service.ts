import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const prisma = new PrismaClient();

export class ManagerService {
  async getProfile(managerId: string) {
    const manager = await prisma.manager.findUnique({
      where: { userId: managerId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    return {
      id: manager.id,
      userId: manager.userId,
      email: manager.User.email,
      kycStatus: manager.kycStatus,
      amlStatus: manager.amlStatus,
      adminKycStatus: manager.adminKycStatus,
      jurisdiction: manager.jurisdiction,
      companyName: manager.companyName,
      companyAddress: manager.companyAddress,
      taxId: manager.taxId,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt,
    };
  }

  async updateProfile(
    managerId: string,
    data: {
      companyName?: string;
      companyAddress?: string;
      taxId?: string;
      jurisdiction?: string;
    }
  ) {
    const manager = await prisma.manager.findUnique({
      where: { userId: managerId },
    });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    return prisma.manager.update({
      where: { userId: managerId },
      data: {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.companyAddress && { companyAddress: data.companyAddress }),
        ...(data.taxId && { taxId: data.taxId }),
        ...(data.jurisdiction && { jurisdiction: data.jurisdiction }),
      },
    });
  }

  async getAllSPVs(managerId: string) {
    const spvs = await prisma.sPV.findMany({
      where: { managerId },
      include: {
        Subscription: {
          include: {
            Investor: {
              select: {
                id: true,
                kycStatus: true,
                amlStatus: true,
              },
            },
          },
        },
        CapTable: {
          select: {
            tokenBalance: true,
            investorId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return spvs.map((spv) => ({
      id: spv.id,
      name: spv.name,
      type: spv.type,
      status: spv.status,
      fundraisingStart: spv.fundraisingStart,
      fundraisingEnd: spv.fundraisingEnd,
      targetAmount: spv.targetAmount,
      currentNAV: spv.currentNAV,
      managementFee: spv.managementFee,
      carryFee: spv.carryFee,
      adminFee: spv.adminFee,
      lifespanYears: spv.lifespanYears,
      tokenContractAddress: spv.tokenContractAddress,
      createdAt: spv.createdAt,
      updatedAt: spv.updatedAt,
      totalSubscriptions: spv.Subscription.length,
      totalRaised: spv.Subscription.filter(
        (sub: any) => sub.status === "completed"
      ).reduce((sum: number, sub: any) => sum + sub.amount, 0),
      totalInvestors: new Set(
        spv.Subscription.map((sub: any) => sub.investorId)
      ).size,
      pendingSubscriptions: spv.Subscription.filter(
        (sub: any) => sub.status === "pending"
      ).length,
      completedSubscriptions: spv.Subscription.filter(
        (sub: any) => sub.status === "completed"
      ).length,
    }));
  }

  async getFundraisingInfo(managerId: string, spvId?: string) {
    const whereClause: any = { managerId };
    if (spvId) {
      whereClause.id = spvId;
    }

    const spvs = await prisma.sPV.findMany({
      where: whereClause,
      include: {
        Subscription: {
          include: {
            Investor: {
              select: {
                id: true,
                kycStatus: true,
                amlStatus: true,
                User: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        CapTable: {
          select: {
            tokenBalance: true,
            investorId: true,
            Investor: {
              select: {
                User: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalRaised = spvs.reduce((sum: number, spv: any) => {
      return (
        sum +
        spv.Subscription.filter(
          (sub: any) => sub.status === "completed"
        ).reduce((subSum: number, sub: any) => subSum + sub.amount, 0)
      );
    }, 0);

    const totalTarget = spvs.reduce(
      (sum, spv) => sum + (spv.targetAmount || 0),
      0
    );

    const allSubscriptions = spvs.flatMap((spv: any) =>
      spv.Subscription.map((sub: any) => ({
        ...sub,
        spvName: spv.name,
        spvId: spv.id,
      }))
    );

    return {
      summary: {
        totalSPVs: spvs.length,
        totalRaised,
        totalTarget,
        fundingProgress:
          totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0,
        totalInvestors: new Set(
          allSubscriptions.map((sub: any) => sub.investorId)
        ).size,
        activeSPVs: spvs.filter(
          (spv: any) => spv.status === "fundraising" || spv.status === "active"
        ).length,
        pendingSubscriptions: allSubscriptions.filter(
          (sub: any) => sub.status === "pending"
        ).length,
        completedSubscriptions: allSubscriptions.filter(
          (sub: any) => sub.status === "completed"
        ).length,
      },
      spvs: spvs.map((spv: any) => ({
        id: spv.id,
        name: spv.name,
        type: spv.type,
        status: spv.status,
        targetAmount: spv.targetAmount,
        raised: spv.Subscription.filter(
          (sub: any) => sub.status === "completed"
        ).reduce((sum: number, sub: any) => sum + sub.amount, 0),
        investors: new Set(spv.Subscription.map((sub: any) => sub.investorId))
          .size,
        subscriptions: spv.Subscription.map((sub: any) => ({
          id: sub.id,
          amount: sub.amount,
          status: sub.status,
          createdAt: sub.createdAt,
          investor: {
            email: sub.Investor.User.email,
            kycStatus: sub.Investor.kycStatus,
            amlStatus: sub.Investor.amlStatus,
          },
        })),
      })),
      recentSubscriptions: allSubscriptions
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map((sub: any) => ({
          id: sub.id,
          spvName: sub.spvName,
          spvId: sub.spvId,
          amount: sub.amount,
          status: sub.status,
          createdAt: sub.createdAt,
          investor: {
            email: sub.Investor?.User?.email || "",
            kycStatus: sub.Investor?.kycStatus || "",
            amlStatus: sub.Investor?.amlStatus || "",
          },
        })),
    };
  }

  async getSPVDetails(managerId: string, spvId: string) {
    const spv = await prisma.sPV.findFirst({
      where: {
        id: spvId,
        managerId,
      },
      include: {
        Subscription: {
          include: {
            Investor: {
              include: {
                User: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        CapTable: {
          include: {
            Investor: {
              include: {
                User: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        Distribution: {
          orderBy: {
            processedAt: "desc",
          },
        },
        Drawdown: {
          orderBy: {
            requestedAt: "desc",
          },
        },
        Milestone: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!spv) {
      throw new AppError("SPV not found or access denied", 404);
    }

    const totalRaised = spv.Subscription.filter(
      (sub: any) => sub.status === "completed"
    ).reduce((sum: number, sub: any) => sum + sub.amount, 0);

    return {
      ...spv,
      totalRaised,
      fundingProgress: spv.targetAmount
        ? (totalRaised / spv.targetAmount) * 100
        : 0,
      totalInvestors: new Set(
        spv.Subscription.map((sub: any) => sub.investorId)
      ).size,
    };
  }
}
