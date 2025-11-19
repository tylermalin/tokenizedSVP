import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import { ComplianceService } from "./compliance.service";

const prisma = new PrismaClient();

export class SubscriptionService {
  private complianceService: ComplianceService;

  constructor() {
    this.complianceService = new ComplianceService();
  }

  async createSubscription(data: {
    spvId: string;
    investorId: string;
    amount: number;
    walletAddress?: string;
  }) {
    // Verify SPV exists and is in fundraising phase
    const spv = await prisma.sPV.findUnique({
      where: { id: data.spvId },
    });

    if (!spv) {
      throw new AppError("SPV not found", 404);
    }

    if (spv.status !== "fundraising") {
      throw new AppError("SPV is not accepting subscriptions", 400);
    }

    const now = new Date();
    if (now < spv.fundraisingStart || now > spv.fundraisingEnd) {
      throw new AppError("Fundraising period has ended", 400);
    }

    // Verify investor KYC status (mock - check if admin approved)
    // data.investorId is a User ID, so query by userId
    const investor = await prisma.investor.findUnique({
      where: { userId: data.investorId },
      include: { User: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    // Check for existing subscription using Investor record ID
    const existing = await prisma.subscription.findFirst({
      where: {
        spvId: data.spvId,
        investorId: investor.id,
      },
    });

    if (existing) {
      throw new AppError("Subscription already exists", 400);
    }

    // Check if investor KYC is verified and admin approved
    if (
      investor.kycStatus !== "verified" ||
      investor.adminKycStatus !== "admin_approved"
    ) {
      throw new AppError(
        "Investor KYC must be verified and admin approved before investing",
        400
      );
    }

    // Create subscription using Investor record ID
    const subscription = await prisma.subscription.create({
      data: {
        spvId: data.spvId,
        investorId: investor.id, // Use Investor record ID, not User ID
        userId: investor.User.id, // Required field in schema - use User.id
        amount: data.amount,
        status: "pending",
        walletAddress: data.walletAddress,
      },
    });

    return subscription;
  }

  async getSubscriptionById(id: string, userId: string) {
    // userId is a User ID, so we need to get the Investor record first
    const investor = await prisma.investor.findUnique({
      where: { userId },
      select: { id: true },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        OR: [
          // If user is an investor, check by Investor record ID
          ...(investor ? [{ investorId: investor.id }] : []),
          // Managers can access via SPV managerId (which is User ID)
          {
            SPV: {
              managerId: userId,
            },
          },
        ],
      },
      include: {
        SPV: {
          select: {
            id: true,
            name: true,
            status: true,
            targetAmount: true,
            tokenContractAddress: true,
          },
        },
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

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    return subscription;
  }

  async submitFunding(
    id: string,
    data: {
      wireReference: string;
      bankName?: string;
      accountNumber?: string;
    },
    userId: string
  ) {
    // userId is a User ID, so we need to get the Investor record first
    const investor = await prisma.investor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        investorId: investor.id, // Use Investor record ID
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    if (subscription.status !== "pending") {
      throw new AppError("Subscription already processed", 400);
    }

    // Update subscription with funding details
    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        wireReference: data.wireReference,
        status: "funded",
      },
    });

    // Note: Token minting will happen after admin confirms wire transfer receipt
    // See completeSubscription method which is called by admin

    return updated;
  }

  /**
   * Submit wire transfer details (alias for submitFunding for clarity)
   */
  async submitWireTransfer(
    subscriptionId: string,
    data: {
      wireReference: string;
      bankName?: string;
      accountNumber?: string;
    },
    investorId: string
  ) {
    return this.submitFunding(subscriptionId, data, investorId);
  }

  async getSubscriptionStatus(id: string, userId: string) {
    const subscription = await this.getSubscriptionById(id, userId);

    if (!subscription.SPV || !subscription.Investor) {
      throw new AppError("Subscription relations not found", 500);
    }

    return {
      id: subscription.id,
      status: subscription.status,
      amount: subscription.amount,
      tokenAmount: subscription.tokenAmount,
      spv: subscription.SPV,
      investor: subscription.Investor,
    };
  }

  /**
   * Mock: Complete subscription and mint tokens
   * In production, this would verify wire transfer and mint tokens on-chain
   */
  async completeSubscription(subscriptionId: string, adminId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        SPV: true,
        Investor: true,
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    if (subscription.status !== "funded") {
      throw new AppError("Subscription must be funded before completion", 400);
    }

    if (!subscription.SPV.tokenContractAddress) {
      throw new AppError("SPV token contract not created", 400);
    }

    // Mock: Calculate token amount (1 token per dollar invested)
    const tokenAmount = subscription.amount;

    // Mock: Mint tokens (in production, this would call blockchain service)
    const { BlockchainService } = await import("./blockchain.service");
    const blockchainService = new BlockchainService();

    const walletAddress =
      subscription.walletAddress ||
      subscription.Investor.walletAddress ||
      "0x0000000000000000000000000000000000000000";
    const txHash = await blockchainService.mintTokens(
      subscription.SPV.tokenContractAddress,
      walletAddress,
      tokenAmount.toString()
    );

    // Update subscription to completed
    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "completed",
        tokenAmount: tokenAmount,
      },
    });

    // Update cap table
    await prisma.capTable.upsert({
      where: {
        spvId_investorId: {
          spvId: subscription.spvId,
          investorId: subscription.investorId,
        },
      },
      update: {
        tokenBalance: { increment: tokenAmount },
        onChainBalance: { increment: tokenAmount },
        lastSyncedAt: new Date(),
      },
      create: {
        spvId: subscription.spvId,
        investorId: subscription.investorId,
        tokenBalance: tokenAmount,
        onChainBalance: tokenAmount,
        lastSyncedAt: new Date(),
      },
    });

    console.log(
      `[MOCK] Subscription ${subscriptionId} completed. Minted ${tokenAmount} tokens. TX: ${txHash}`
    );

    return {
      ...updated,
      txHash,
      tokenAmount,
    };
  }
}
