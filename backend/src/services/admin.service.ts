import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import { BlockchainService } from "./blockchain.service";

const prisma = new PrismaClient();

export class AdminService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async mintTokens(data: {
    spvId: string;
    investorId: string;
    amount: string;
  }) {
    // Verify subscription is funded
    const subscription = await prisma.subscription.findFirst({
      where: {
        spvId: data.spvId,
        investorId: data.investorId,
        status: "funded",
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found or not funded", 404);
    }

    // Get investor wallet address
    const investor = await prisma.investor.findUnique({
      where: { id: data.investorId },
    });

    if (!investor?.walletAddress) {
      throw new AppError("Investor wallet address not set", 400);
    }

    // Get SPV token contract address
    const spv = await prisma.sPV.findUnique({
      where: { id: data.spvId },
    });

    if (!spv?.tokenContractAddress) {
      throw new AppError("SPV token contract not deployed", 400);
    }

    // Mint tokens on blockchain
    const txHash = await this.blockchainService.mintTokens(
      spv.tokenContractAddress,
      investor.walletAddress,
      data.amount
    );

    // Update cap table
    await prisma.capTable.upsert({
      where: {
        spvId_investorId: {
          spvId: data.spvId,
          investorId: data.investorId,
        },
      },
      update: {
        tokenBalance: { increment: parseFloat(data.amount) },
        onChainBalance: { increment: parseFloat(data.amount) },
        lastSyncedAt: new Date(),
      },
      create: {
        spvId: data.spvId,
        investorId: data.investorId,
        tokenBalance: parseFloat(data.amount),
        onChainBalance: parseFloat(data.amount),
        lastSyncedAt: new Date(),
      },
    });

    // Update subscription status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "completed",
        tokenAmount: parseFloat(data.amount),
      },
    });

    return {
      success: true,
      txHash,
      amount: data.amount,
    };
  }

  async burnTokens(data: {
    spvId: string;
    investorId: string;
    amount: string;
  }) {
    const spv = await prisma.sPV.findUnique({
      where: { id: data.spvId },
    });

    if (!spv?.tokenContractAddress) {
      throw new AppError("SPV token contract not deployed", 404);
    }

    const investor = await prisma.investor.findUnique({
      where: { id: data.investorId },
    });

    if (!investor?.walletAddress) {
      throw new AppError("Investor wallet address not set", 400);
    }

    // Burn tokens on blockchain
    const txHash = await this.blockchainService.burnTokens(
      spv.tokenContractAddress,
      investor.walletAddress,
      data.amount
    );

    // Update cap table
    await prisma.capTable.update({
      where: {
        spvId_investorId: {
          spvId: data.spvId,
          investorId: data.investorId,
        },
      },
      data: {
        tokenBalance: { decrement: parseFloat(data.amount) },
        onChainBalance: { decrement: parseFloat(data.amount) },
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      txHash,
      amount: data.amount,
    };
  }

  async updateWhitelist(data: { walletAddress: string; whitelisted: boolean }) {
    // Update whitelist on blockchain
    // This would need to be called for each SPV token contract
    // For now, return success
    return {
      success: true,
      walletAddress: data.walletAddress,
      whitelisted: data.whitelisted,
    };
  }

  async updateNAV(data: { spvId: string; nav: string }) {
    await prisma.sPV.update({
      where: { id: data.spvId },
      data: {
        currentNAV: parseFloat(data.nav),
        navUpdatedAt: new Date(),
      },
    });

    return {
      success: true,
      spvId: data.spvId,
      nav: data.nav,
    };
  }

  async triggerDistribution(data: {
    spvId: string;
    totalAmount: string;
    distributionType: "income" | "capital_gain" | "liquidation";
  }) {
    // Get total token supply
    const totalSupply = await prisma.capTable.aggregate({
      where: { spvId: data.spvId },
      _sum: { tokenBalance: true },
    });

    const totalTokens = totalSupply._sum.tokenBalance || 0;
    const perTokenAmount =
      totalTokens > 0 ? parseFloat(data.totalAmount) / totalTokens : 0;

    // Create distribution record
    const distribution = await prisma.distribution.create({
      data: {
        spvId: data.spvId,
        amount: parseFloat(data.totalAmount),
        distributionType: data.distributionType,
        perTokenAmount,
        processedAt: new Date(),
      },
    });

    // TODO: Trigger blockchain distribution event
    // TODO: Process payments to investors

    return {
      success: true,
      distributionId: distribution.id,
      totalAmount: data.totalAmount,
      perTokenAmount,
      distributionType: data.distributionType,
    };
  }

  /**
   * Get admin dashboard with pending reviews
   */
  async getDashboard() {
    // Get pending investor KYC reviews
    const pendingInvestorKYC = await prisma.investor.findMany({
      where: {
        kycStatus: "verified",
        adminKycStatus: null,
      },
      include: {
        User: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get pending manager KYC reviews
    const pendingManagerKYC = await prisma.manager.findMany({
      where: {
        kycStatus: "verified",
        adminKycStatus: null,
      },
      include: {
        User: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get pending SPV approvals
    const pendingSPVs = await prisma.sPV.findMany({
      where: {
        adminStatus: "pending",
        status: "configuring",
      },
      include: {
        User: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get SPVs requesting changes
    const spvsChangesRequested = await prisma.sPV.findMany({
      where: {
        adminStatus: "changes_requested",
      },
      include: {
        User: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get pending account approvals
    const pendingAccounts = await prisma.user.findMany({
      where: {
        accountStatus: "pending",
        role: { in: ["investor", "manager"] },
      },
      include: {
        Investor: {
          select: {
            kycStatus: true,
            amlStatus: true,
          },
        },
        Manager: {
          select: {
            kycStatus: true,
            amlStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      pendingInvestorKYC: pendingInvestorKYC.map((inv) => ({
        id: inv.id,
        userId: inv.userId,
        email: inv.User.email,
        kycStatus: inv.kycStatus,
        amlStatus: inv.amlStatus,
        jurisdiction: inv.jurisdiction,
        sumsubApplicantId: inv.sumsubApplicantId,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      })),
      pendingManagerKYC: pendingManagerKYC.map((mgr) => ({
        id: mgr.id,
        userId: mgr.userId,
        email: mgr.User.email,
        kycStatus: mgr.kycStatus,
        amlStatus: mgr.amlStatus,
        companyName: mgr.companyName,
        jurisdiction: mgr.jurisdiction,
        sumsubApplicantId: mgr.sumsubApplicantId,
        createdAt: mgr.createdAt,
        updatedAt: mgr.updatedAt,
      })),
      pendingSPVs: pendingSPVs.map((spv) => ({
        id: spv.id,
        name: spv.name,
        type: spv.type,
        status: spv.status,
        managerEmail: spv.User.email,
        targetAmount: spv.targetAmount,
        fundraisingStart: spv.fundraisingStart,
        fundraisingEnd: spv.fundraisingEnd,
        createdAt: spv.createdAt,
        updatedAt: spv.updatedAt,
      })),
      spvsChangesRequested: spvsChangesRequested.map((spv) => ({
        id: spv.id,
        name: spv.name,
        type: spv.type,
        status: spv.status,
        managerEmail: spv.User.email,
        adminNotes: spv.adminNotes,
        updatedAt: spv.updatedAt,
      })),
      summary: {
        pendingInvestorKYC: pendingInvestorKYC.length,
        pendingManagerKYC: pendingManagerKYC.length,
        pendingSPVs: pendingSPVs.length,
        spvsChangesRequested: spvsChangesRequested.length,
        pendingAccounts: pendingAccounts.length,
      },
      pendingAccounts: pendingAccounts.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        kycStatus:
          user.Investor?.kycStatus || user.Manager?.kycStatus || "pending",
        amlStatus:
          user.Investor?.amlStatus || user.Manager?.amlStatus || "pending",
      })),
    };
  }

  /**
   * Approve or reject investor KYC
   */
  async reviewInvestorKYC(
    investorId: string,
    adminId: string,
    action: "approve" | "reject",
    notes?: string
  ) {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: { User: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    if (investor.kycStatus !== "verified") {
      throw new AppError(
        "Investor KYC must be verified by Sumsub before admin approval",
        400
      );
    }

    const adminStatus =
      action === "approve" ? "admin_approved" : "admin_rejected";

    // Update investor
    await prisma.investor.update({
      where: { id: investorId },
      data: {
        adminKycStatus: adminStatus,
        adminKycNotes: notes,
        kycReviewedBy: adminId,
        kycReviewedAt: new Date(),
      },
    });

    // Create review record
    await prisma.adminReview.create({
      data: {
        reviewType: "kyc_investor",
        entityId: investorId,
        status: action === "approve" ? "approved" : "rejected",
        notes,
        reviewedBy: adminId,
      },
    });

    return {
      success: true,
      investorId,
      action,
      adminStatus,
    };
  }

  /**
   * Approve or reject manager KYC
   */
  async reviewManagerKYC(
    managerId: string,
    adminId: string,
    action: "approve" | "reject",
    notes?: string
  ) {
    const manager = await prisma.manager.findUnique({
      where: { userId: managerId },
      include: { User: true },
    });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    if (manager.kycStatus !== "verified") {
      throw new AppError(
        "Manager KYC must be verified by Sumsub before admin approval",
        400
      );
    }

    const adminStatus =
      action === "approve" ? "admin_approved" : "admin_rejected";

    // Update manager
    await prisma.manager.update({
      where: { userId: managerId },
      data: {
        adminKycStatus: adminStatus,
        adminKycNotes: notes,
        kycReviewedBy: adminId,
        kycReviewedAt: new Date(),
      },
    });

    // Create review record
    await prisma.adminReview.create({
      data: {
        reviewType: "kyc_manager",
        entityId: manager.id,
        status: action === "approve" ? "approved" : "rejected",
        notes,
        reviewedBy: adminId,
      },
    });

    return {
      success: true,
      managerId,
      action,
      adminStatus,
    };
  }

  /**
   * Approve, reject, or request changes for SPV
   */
  async reviewSPV(
    spvId: string,
    adminId: string,
    action: "approve" | "reject" | "request_changes",
    notes?: string
  ) {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId },
      include: {
        User: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!spv) {
      throw new AppError("SPV not found", 404);
    }

    if (spv.adminStatus === "approved") {
      throw new AppError("SPV already approved", 400);
    }

    let adminStatus: string;
    let newStatus: string = spv.status;

    if (action === "approve") {
      adminStatus = "approved";
      // Change SPV status to fundraising if approved
      newStatus = "fundraising";
    } else if (action === "reject") {
      adminStatus = "rejected";
    } else {
      adminStatus = "changes_requested";
    }

    // Update SPV
    await prisma.sPV.update({
      where: { id: spvId },
      data: {
        adminStatus,
        adminNotes: notes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        status: newStatus,
      },
    });

    // If approved, deploy token contract
    if (action === "approve") {
      try {
        const { SPVService } = await import('./spv.service');
        const spvService = new SPVService();
        await spvService.deployTokenContract(spvId);
      } catch (error) {
        console.error('Failed to deploy token contract after approval:', error);
        // Log error but don't fail the approval
        // Token contract deployment can be retried later
      }
    }

    // Create review record
    await prisma.adminReview.create({
      data: {
        reviewType: "spv_approval",
        entityId: spvId,
        status:
          action === "approve"
            ? "approved"
            : action === "reject"
            ? "rejected"
            : "changes_requested",
        notes,
        reviewedBy: adminId,
      },
    });

    return {
      success: true,
      spvId,
      action,
      adminStatus,
      spvStatus: newStatus,
    };
  }

  /**
   * Get SPV details for review
   */
  async getSPVForReview(spvId: string) {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
          },
        },
        ReviewedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
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
        Invitations: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!spv) {
      throw new AppError("SPV not found", 404);
    }

    // Get manager KYC status
    const manager = await prisma.manager.findUnique({
      where: { userId: spv.managerId },
      select: {
        kycStatus: true,
        amlStatus: true,
        adminKycStatus: true,
        companyName: true,
        companyAddress: true,
        taxId: true,
      },
    });

    return {
      ...spv,
      managerKYC: manager,
      subscriptions: spv.Subscription || [],
      Invitations: spv.Invitations || [],
    };
  }

  /**
   * Get investor details for review
   */
  async getInvestorForReview(investorId: string) {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        KYCReviewedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        Subscription: {
          include: {
            SPV: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    return investor;
  }

  /**
   * Get manager details for review
   */
  async getManagerForReview(managerId: string) {
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
        KYCReviewedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    // Fetch SPVs created by this manager (SPV.managerId references User.id, not Manager.userId)
    // So we use manager.userId to find SPVs
    const spvs = await prisma.sPV.findMany({
      where: { managerId: manager.userId },
      select: {
        id: true,
        name: true,
        status: true,
        adminStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      ...manager,
      SPV: spvs,
    };
  }

  /**
   * Get review history
   */
  async getReviewHistory(filters?: {
    reviewType?: string;
    status?: string;
    limit?: number;
  }) {
    const reviews = await prisma.adminReview.findMany({
      where: {
        ...(filters?.reviewType && { reviewType: filters.reviewType }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        Reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      take: filters?.limit || 50,
    });

    return reviews;
  }

  /**
   * Approve or reject user account
   */
  async approveAccount(
    userId: string,
    adminId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === "admin") {
      throw new AppError("Cannot modify admin accounts", 400);
    }

    const accountStatus = action === "approve" ? "approved" : "rejected";

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus,
        accountApprovedBy: action === "approve" ? adminId : null,
        accountApprovedAt: action === "approve" ? new Date() : null,
        accountRejectionReason: action === "reject" ? rejectionReason : null,
      },
    });

    return {
      success: true,
      userId,
      action,
      accountStatus,
    };
  }

  /**
   * Override investor KYC without Sumsub verification
   */
  async overrideInvestorKYC(
    investorId: string,
    adminId: string,
    action: "approve" | "reject",
    notes?: string
  ) {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: { User: true },
    });

    if (!investor) {
      throw new AppError("Investor not found", 404);
    }

    const adminStatus =
      action === "approve" ? "admin_approved" : "admin_rejected";

    // Update investor KYC status directly (override)
    await prisma.investor.update({
      where: { id: investorId },
      data: {
        kycStatus: action === "approve" ? "verified" : "rejected",
        amlStatus: action === "approve" ? "cleared" : "failed",
        adminKycStatus: adminStatus,
        adminKycNotes: notes,
        kycReviewedBy: adminId,
        kycReviewedAt: new Date(),
      },
    });

    // Create review record
    await prisma.adminReview.create({
      data: {
        reviewType: "kyc_investor",
        entityId: investorId,
        status: action === "approve" ? "approved" : "rejected",
        notes: notes || "KYC overridden by admin",
        reviewedBy: adminId,
      },
    });

    return {
      success: true,
      investorId,
      action,
      adminStatus,
      override: true,
    };
  }

  /**
   * Override manager KYC without Sumsub verification
   */
  async overrideManagerKYC(
    managerId: string,
    adminId: string,
    action: "approve" | "reject",
    notes?: string
  ) {
    const manager = await prisma.manager.findUnique({
      where: { userId: managerId },
      include: { User: true },
    });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    const adminStatus =
      action === "approve" ? "admin_approved" : "admin_rejected";

    // Update manager KYC status directly (override)
    await prisma.manager.update({
      where: { userId: managerId },
      data: {
        kycStatus: action === "approve" ? "verified" : "rejected",
        amlStatus: action === "approve" ? "cleared" : "failed",
        adminKycStatus: adminStatus,
        adminKycNotes: notes,
        kycReviewedBy: adminId,
        kycReviewedAt: new Date(),
      },
    });

    // Create review record
    await prisma.adminReview.create({
      data: {
        reviewType: "kyc_manager",
        entityId: manager.id,
        status: action === "approve" ? "approved" : "rejected",
        notes: notes || "KYC overridden by admin",
        reviewedBy: adminId,
      },
    });

    return {
      success: true,
      managerId,
      action,
      adminStatus,
      override: true,
    };
  }

  /**
   * Get all active SPVs with their current status
   */
  async getAllActiveSPVs() {
    const activeSPVs = await prisma.sPV.findMany({
      where: {
        status: { in: ["fundraising", "active"] },
      },
      include: {
        User: {
          select: {
            email: true,
          },
        },
        Subscription: {
          select: {
            id: true,
            amount: true,
            status: true,
            investorId: true,
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

    return activeSPVs.map((spv) => {
      const totalRaised = spv.Subscription.filter(
        (sub: any) => sub.status === "completed"
      ).reduce((sum: number, sub: any) => sum + sub.amount, 0);

      const totalInvestors = new Set(
        spv.Subscription.map((sub: any) => sub.investorId)
      ).size;

      const fundingProgress = spv.targetAmount
        ? (totalRaised / spv.targetAmount) * 100
        : 0;

      return {
        id: spv.id,
        name: spv.name,
        type: spv.type,
        status: spv.status,
        adminStatus: spv.adminStatus,
        managerEmail: spv.User.email,
        targetAmount: spv.targetAmount,
        totalRaised,
        fundingProgress,
        totalInvestors,
        fundraisingStart: spv.fundraisingStart,
        fundraisingEnd: spv.fundraisingEnd,
        currentNAV: spv.currentNAV,
        navUpdatedAt: spv.navUpdatedAt,
        createdAt: spv.createdAt,
        updatedAt: spv.updatedAt,
        subscriptions: {
          total: spv.Subscription.length,
          completed: spv.Subscription.filter(
            (sub: any) => sub.status === "completed"
          ).length,
          pending: spv.Subscription.filter(
            (sub: any) => sub.status === "pending"
          ).length,
        },
      };
    });
  }

  /**
   * Get all users with their account status
   */
  async getAllUsers(filters?: {
    role?: string;
    accountStatus?: string;
    limit?: number;
  }) {
    const users = await prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.accountStatus && { accountStatus: filters.accountStatus }),
      },
      include: {
        Investor: {
          select: {
            kycStatus: true,
            amlStatus: true,
            adminKycStatus: true,
          },
        },
        Manager: {
          select: {
            kycStatus: true,
            amlStatus: true,
            adminKycStatus: true,
            companyName: true,
          },
        },
        AccountApprovedByUser: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters?.limit || 100,
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      accountApprovedBy: user.AccountApprovedByUser?.email,
      accountApprovedAt: user.accountApprovedAt,
      accountRejectionReason: user.accountRejectionReason,
      createdAt: user.createdAt,
      kycStatus: user.Investor?.kycStatus || user.Manager?.kycStatus,
      amlStatus: user.Investor?.amlStatus || user.Manager?.amlStatus,
      adminKycStatus:
        user.Investor?.adminKycStatus || user.Manager?.adminKycStatus,
      companyName: user.Manager?.companyName,
    }));
  }
}
