import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import { EntityFormationService } from "./entity-formation.service";
import { DocumentGenerationService } from "./document-generation.service";
import { InvitationService } from "./invitation.service";

const prisma = new PrismaClient();

export class SPVService {
  private entityFormationService: EntityFormationService;
  private documentGenerationService: DocumentGenerationService;
  private invitationService: InvitationService;

  constructor() {
    this.entityFormationService = new EntityFormationService();
    this.documentGenerationService = new DocumentGenerationService();
    this.invitationService = new InvitationService();
  }

  async createSPV(data: {
    name: string;
    type: "single_name" | "multi_name" | "real_estate";
    fundraisingStart: string;
    fundraisingEnd: string;
    lifespanYears: number;
    managerId: string;
    managementFee?: number;
    carryFee?: number;
    adminFee?: number;
    targetAmount?: number;
    capitalStack?: {
      equity?: number;
      preferred?: number;
      mezzanine?: number;
    };
  }) {
    // Validate fundraising period
    const startDate = new Date(data.fundraisingStart);
    const endDate = new Date(data.fundraisingEnd);

    if (endDate <= startDate) {
      throw new AppError("Fundraising end must be after start", 400);
    }

    if (data.lifespanYears < 3) {
      throw new AppError("Minimum lifespan is 3 years", 400);
    }

    // Create SPV
    const spv = await prisma.sPV.create({
      data: {
        name: data.name,
        type: data.type,
        fundraisingStart: startDate,
        fundraisingEnd: endDate,
        lifespanYears: data.lifespanYears,
        status: "configuring",
        managerId: data.managerId,
        managementFee: data.managementFee,
        carryFee: data.carryFee,
        adminFee: data.adminFee,
        targetAmount: data.targetAmount,
        capitalStack: data.capitalStack
          ? JSON.stringify(data.capitalStack)
          : null,
      },
    });

    // Generate initial documents
    await this.documentGenerationService.generateOperatingAgreement(spv.id);
    await this.documentGenerationService.generateSubscriptionAgreement(spv.id);
    await this.documentGenerationService.generatePPM(spv.id);

    // Token contract creation will happen AFTER admin approval
    // See deployTokenContract method and admin service approval flow

    return spv;
  }

  async getSPVById(id: string, userId: string) {
    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Build where clause based on user role
    let whereClause: any = { id };

    // Admins can see all SPVs, investors can see fundraising SPVs, managers can see their own
    if (user?.role === "admin") {
      // Admins can see all SPVs
    } else if (user?.role === "investor") {
      // Get Investor record ID first
      const investor = await prisma.investor.findUnique({
        where: { userId },
        select: { id: true },
      });

      // Investors can see fundraising or active SPVs, or SPVs they've subscribed to
      whereClause = {
        id,
        OR: [
          { status: { in: ["fundraising", "active"] } },
          ...(investor
            ? [
                {
                  Subscription: {
                    some: {
                      investorId: investor.id, // Use Investor record ID
                    },
                  },
                },
              ]
            : []),
        ],
      };
    } else {
      // Managers can see their own SPVs
      // Note: Managers don't subscribe as investors, so we only check managerId
      whereClause = {
        id,
        managerId: userId,
      };
    }

    const spv = await prisma.sPV.findFirst({
      where: whereClause,
      include: {
        User: {
          select: {
            email: true,
          },
        },
        Subscription: {
          include: {
            Investor: {
              select: {
                id: true,
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

    if (!spv) {
      throw new AppError("SPV not found", 404);
    }

    return spv;
  }

  async listSPVs(filters: {
    managerId?: string;
    status?: string;
    type?: string;
  }) {
    return prisma.sPV.findMany({
      where: {
        ...(filters.managerId && { managerId: filters.managerId }),
        ...(filters.status && { status: filters.status as any }),
        ...(filters.type && { type: filters.type as any }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateSPV(id: string, data: any, userId: string) {
    const spv = await prisma.sPV.findFirst({
      where: {
        id,
        managerId: userId,
      },
    });

    if (!spv) {
      throw new AppError("SPV not found or access denied", 404);
    }

    return prisma.sPV.update({
      where: { id },
      data,
    });
  }

  async inviteLPs(spvId: string, emails: string[], userId: string) {
    // Create invitations using invitation service
    const result = await this.invitationService.createInvitations(
      spvId,
      emails,
      userId,
      30 // 30 days expiration
    );

    // TODO: Send invitation emails
    // This would integrate with an email service (SendGrid, AWS SES, etc.)
    // For now, return the invitation URLs so they can be shared manually

    return {
      message: "Invitations created",
      count: result.invitations.length,
      invitations: result.invitations,
      spv: result.spv,
    };
  }

  async getSubscriptions(spvId: string, userId: string) {
    const spv = await prisma.sPV.findFirst({
      where: {
        id: spvId,
        managerId: userId,
      },
    });

    if (!spv) {
      throw new AppError("SPV not found or access denied", 404);
    }

    return prisma.subscription.findMany({
      where: { spvId },
      include: {
        Investor: {
          select: {
            id: true,
            User: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async initiateLiquidation(spvId: string, userId: string) {
    const spv = await prisma.sPV.findFirst({
      where: {
        id: spvId,
        managerId: userId,
      },
    });

    if (!spv) {
      throw new AppError("SPV not found or access denied", 404);
    }

    if (spv.status === "liquidated") {
      throw new AppError("SPV already liquidated", 400);
    }

    // Calculate early termination fee if applicable
    const lifespanDate = new Date(spv.createdAt);
    lifespanDate.setFullYear(lifespanDate.getFullYear() + spv.lifespanYears);
    const now = new Date();

    let earlyTerminationFee = 0;
    if (now < lifespanDate) {
      earlyTerminationFee = 5000; // $5,000 early termination fee
    }

    await prisma.sPV.update({
      where: { id: spvId },
      data: {
        status: "liquidating",
      },
    });

    return {
      spvId,
      earlyTerminationFee,
      status: "liquidating",
    };
  }

  /**
   * Deploy token contract for an approved SPV
   * Called by admin service after SPV approval
   */
  async deployTokenContract(spvId: string): Promise<string> {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId },
    });

    if (!spv) {
      throw new AppError("SPV not found", 404);
    }

    if (spv.adminStatus !== "approved") {
      throw new AppError(
        "SPV must be approved before token contract deployment",
        400
      );
    }

    if (spv.tokenContractAddress) {
      // Token contract already deployed
      return spv.tokenContractAddress;
    }

    if (!spv.targetAmount) {
      throw new AppError(
        "SPV must have a target amount to deploy token contract",
        400
      );
    }

    try {
      const { BlockchainService } = await import("./blockchain.service");
      const blockchainService = new BlockchainService();

      const tokenContractAddress = await blockchainService.createTokenContract(
        spv.id,
        spv.name,
        spv.targetAmount.toString()
      );

      // Update SPV with token contract address
      await prisma.sPV.update({
        where: { id: spv.id },
        data: { tokenContractAddress },
      });

      console.log(
        `[MOCK] Token contract deployed for SPV ${spv.name}: ${tokenContractAddress}`
      );
      return tokenContractAddress;
    } catch (error) {
      console.error("Failed to deploy token contract:", error);
      throw new AppError("Failed to deploy token contract", 500);
    }
  }
}
