import { PrismaClient } from "@prisma/client";
import { SumsubService } from "./sumsub.service";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

/**
 * Compliance Service with Sumsub KYC/AML Integration
 */
export class ComplianceService {
  private sumsubService: SumsubService;

  constructor() {
    this.sumsubService = new SumsubService();
  }

  /**
   * Initiate KYC verification for an investor
   */
  async initiateKYC(investorId: string, email: string) {
    try {
      // Get investor record by userId
      const investor = await prisma.investor.findUnique({
        where: { userId: investorId },
        include: { User: true },
      });

      if (!investor) {
        throw new AppError("Investor not found", 404);
      }

      // Check if Sumsub is configured
      if (!this.sumsubService.isConfigured()) {
        // If Sumsub not configured, return status indicating form submission is needed
        return {
          investorId,
          kycStatus: investor.kycStatus || "pending",
          amlStatus: investor.amlStatus || "pending",
          requiresFormSubmission: true,
          message: "Please submit KYC form for admin review",
        };
      }

      // Create applicant in Sumsub
      const { applicantId } = await this.sumsubService.createApplicant(
        investorId,
        email || investor.User.email,
        investorId
      );

      // Generate SDK token for frontend
      const sdkToken = await this.sumsubService.generateSDKToken(investorId);

      // Update investor record with Sumsub applicant ID
      await prisma.investor.update({
        where: { userId: investorId },
        data: {
          kycStatus: "pending",
          sumsubApplicantId: applicantId,
        },
      });

      logger.info(`KYC initiated for investor ${investorId}`, { applicantId });

      return {
        investorId,
        applicantId,
        sdkToken,
        kycStatus: "pending",
        verificationUrl: `https://sumsub.com/idensic/l/#/access/${sdkToken}`,
      };
    } catch (error: any) {
      logger.error("KYC initiation failed:", error);
      throw error;
    }
  }

  /**
   * Check AML status for an investor
   */
  async checkAML(investorId: string) {
    try {
      const investor = await prisma.investor.findUnique({
        where: { userId: investorId },
      });

      if (!investor) {
        throw new AppError("Investor not found", 404);
      }

      // Get applicant ID from investor record
      const applicantId = investor.sumsubApplicantId || investor.id;

      // Perform AML check
      const amlResult = await this.sumsubService.performAMLCheck(applicantId);

      // Update investor AML status
      await prisma.investor.update({
        where: { userId: investorId },
        data: {
          amlStatus: amlResult.amlStatus === "cleared" ? "cleared" : "pending",
        },
      });

      return {
        investorId: investorId,
        amlStatus: amlResult.amlStatus,
        reviewResult: amlResult.reviewResult,
      };
    } catch (error: any) {
      logger.error("AML check failed:", error);
      // Don't throw - AML checks can be async
      return {
        investorId,
        amlStatus: "pending",
        reviewResult: null,
      };
    }
  }

  /**
   * Get KYC status for investor (works with both Sumsub and form submission)
   */
  async getKYCStatus(investorId: string) {
    try {
      const investor = await prisma.investor.findUnique({
        where: { userId: investorId },
      });

      if (!investor) {
        throw new AppError("Investor not found", 404);
      }

      // If Sumsub applicant exists, try to get status from Sumsub
      if (investor.sumsubApplicantId) {
        try {
          const status = await this.sumsubService.getApplicantStatus(
            investor.sumsubApplicantId
          );

          // Map Sumsub review status to our status
          let kycStatus: "pending" | "verified" | "rejected" = "pending";
          if (
            status.reviewStatus === "completed" &&
            status.reviewResult === "green"
          ) {
            kycStatus = "verified";
          } else if (
            status.reviewStatus === "rejected" ||
            status.reviewResult === "red"
          ) {
            kycStatus = "rejected";
          }

          // Update investor status if changed
          if (investor.kycStatus !== kycStatus) {
            await prisma.investor.update({
              where: { userId: investorId },
              data: {
                kycStatus,
                amlStatus:
                  status.reviewResult === "green"
                    ? "cleared"
                    : investor.amlStatus,
              },
            });
          }

          return {
            investorId,
            kycStatus,
            amlStatus:
              status.reviewResult === "green" ? "cleared" : investor.amlStatus,
            reviewStatus: status.reviewStatus,
            reviewResult: status.reviewResult,
            verifiedAt: status.reviewDate ? new Date(status.reviewDate) : null,
            adminKycStatus: investor.adminKycStatus,
          };
        } catch (sumsubError: any) {
          // If Sumsub call fails, fall back to database status
          logger.warn("Sumsub status check failed, using database status", {
            error: sumsubError.message,
          });
        }
      }

      // Return status from database (works for form submissions)
      return {
        investorId,
        kycStatus: investor.kycStatus as "pending" | "verified" | "rejected",
        amlStatus: investor.amlStatus as "pending" | "cleared" | "flagged",
        adminKycStatus: investor.adminKycStatus,
        kycReviewedAt: investor.kycReviewedAt,
        jurisdiction: investor.jurisdiction,
      };
    } catch (error: any) {
      logger.error("KYC status check failed:", error);
      throw error;
    }
  }

  /**
   * Verify KYC status from Sumsub (legacy method - kept for backward compatibility)
   */
  async verifyKYCStatus(investorId: string) {
    return this.getKYCStatus(investorId);
  }

  /**
   * Handle webhook from Sumsub
   */
  async handleWebhook(payload: any, signature: string, rawBody?: string) {
    try {
      // Verify webhook signature using raw body if provided
      const payloadString = rawBody || JSON.stringify(payload);
      const isValid = this.sumsubService.verifyWebhookSignature(
        payloadString,
        signature
      );

      if (!isValid) {
        throw new AppError("Invalid webhook signature", 401);
      }

      const { type, applicantId, reviewStatus, reviewResult } = payload;

      // Find investor by Sumsub applicantId
      let investor = await prisma.investor.findFirst({
        where: {
          sumsubApplicantId: applicantId,
        },
      });

      // If not found as investor, try manager
      let manager = null;
      if (!investor) {
        manager = await prisma.manager.findFirst({
          where: {
            sumsubApplicantId: applicantId,
          },
        });
      }

      if (!investor && !manager) {
        logger.warn(
          `Investor or Manager not found for applicantId: ${applicantId}`
        );
        return { processed: false };
      }

      // Update KYC status based on webhook
      let kycStatus: "pending" | "verified" | "rejected" = "pending";
      if (reviewStatus === "completed" && reviewResult === "green") {
        kycStatus = "verified";
      } else if (reviewStatus === "rejected" || reviewResult === "red") {
        kycStatus = "rejected";
      }

      if (investor) {
        await prisma.investor.update({
          where: { id: investor.id },
          data: {
            kycStatus,
            amlStatus: reviewResult === "green" ? "cleared" : "pending",
          },
        });

        logger.info(`Webhook processed for investor ${investor.id}`, {
          type,
          reviewStatus,
          reviewResult,
          kycStatus,
        });

        return {
          processed: true,
          investorId: investor.id,
          kycStatus,
          type: "investor",
        };
      } else if (manager) {
        await prisma.manager.update({
          where: { userId: manager.userId },
          data: {
            kycStatus,
            amlStatus: reviewResult === "green" ? "cleared" : "pending",
          },
        });

        logger.info(`Webhook processed for manager ${manager.id}`, {
          type,
          reviewStatus,
          reviewResult,
          kycStatus,
        });

        return {
          processed: true,
          managerId: manager.userId,
          kycStatus,
          type: "manager",
        };
      }
    } catch (error: any) {
      logger.error("Webhook processing failed:", error);
      throw error;
    }
  }

  /**
   * Check if investor is compliant (both KYC and AML cleared)
   */
  async isCompliant(investorId: string): Promise<boolean> {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
    });

    if (!investor) {
      return false;
    }

    return (
      investor.kycStatus === "verified" && investor.amlStatus === "cleared"
    );
  }

  /**
   * Initiate KYC verification for a manager
   */
  async initiateManagerKYC(managerId: string, email: string) {
    try {
      // Get manager record
      const manager = await prisma.manager.findUnique({
        where: { userId: managerId },
        include: { User: true },
      });

      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      // Create applicant in Sumsub
      const { applicantId } = await this.sumsubService.createApplicant(
        managerId,
        email || manager.User.email,
        managerId
      );

      // Generate SDK token for frontend
      const sdkToken = await this.sumsubService.generateSDKToken(managerId);

      // Update manager record with Sumsub applicant ID
      await prisma.manager.update({
        where: { userId: managerId },
        data: {
          kycStatus: "pending",
          sumsubApplicantId: applicantId,
        },
      });

      logger.info(`KYC initiated for manager ${managerId}`, { applicantId });

      return {
        managerId,
        applicantId,
        sdkToken,
        kycStatus: "pending",
        verificationUrl: `https://sumsub.com/idensic/l/#/access/${sdkToken}`,
      };
    } catch (error: any) {
      logger.error("Manager KYC initiation failed:", error);
      throw error;
    }
  }

  /**
   * Get KYC status for manager (works with both Sumsub and form submission)
   */
  async getManagerKYCStatus(managerId: string) {
    try {
      const manager = await prisma.manager.findUnique({
        where: { userId: managerId },
      });

      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      // If Sumsub applicant exists, try to get status from Sumsub
      if (manager.sumsubApplicantId) {
        try {
          const status = await this.sumsubService.getApplicantStatus(
            manager.sumsubApplicantId
          );

          // Map Sumsub review status to our status
          let kycStatus: "pending" | "verified" | "rejected" = "pending";
          if (
            status.reviewStatus === "completed" &&
            status.reviewResult === "green"
          ) {
            kycStatus = "verified";
          } else if (
            status.reviewStatus === "rejected" ||
            status.reviewResult === "red"
          ) {
            kycStatus = "rejected";
          }

          // Update manager status if changed
          if (manager.kycStatus !== kycStatus) {
            await prisma.manager.update({
              where: { userId: managerId },
              data: {
                kycStatus,
                amlStatus:
                  status.reviewResult === "green"
                    ? "cleared"
                    : manager.amlStatus,
              },
            });
          }

          return {
            managerId,
            kycStatus,
            amlStatus:
              status.reviewResult === "green" ? "cleared" : manager.amlStatus,
            reviewStatus: status.reviewStatus,
            reviewResult: status.reviewResult,
            verifiedAt: status.reviewDate ? new Date(status.reviewDate) : null,
            adminKycStatus: manager.adminKycStatus,
          };
        } catch (sumsubError: any) {
          // If Sumsub call fails, fall back to database status
          logger.warn("Sumsub status check failed, using database status", {
            error: sumsubError.message,
          });
        }
      }

      // Return status from database (works for form submissions)
      return {
        managerId,
        kycStatus: manager.kycStatus as "pending" | "verified" | "rejected",
        amlStatus: manager.amlStatus as "pending" | "cleared" | "flagged",
        adminKycStatus: manager.adminKycStatus,
        kycReviewedAt: manager.kycReviewedAt,
        jurisdiction: manager.jurisdiction,
        companyName: manager.companyName,
        companyAddress: manager.companyAddress,
      };
    } catch (error: any) {
      logger.error("Manager KYC status check failed:", error);
      throw error;
    }
  }

  /**
   * Verify KYC status for a manager from Sumsub (legacy method - kept for backward compatibility)
   */
  async verifyManagerKYCStatus(managerId: string) {
    return this.getManagerKYCStatus(managerId);
  }

  /**
   * Check if manager is compliant (both KYC and AML cleared)
   */
  async isManagerCompliant(managerId: string): Promise<boolean> {
    const manager = await prisma.manager.findUnique({
      where: { userId: managerId },
    });

    if (!manager) {
      return false;
    }

    return manager.kycStatus === "verified" && manager.amlStatus === "cleared";
  }

  /**
   * Submit KYC form for investor (mock - stores data for admin review)
   */
  async submitKYCForm(investorId: string, formData: any, files?: any) {
    try {
      const investor = await prisma.investor.findUnique({
        where: { userId: investorId },
        include: { User: true },
      });

      if (!investor) {
        throw new AppError("Investor not found", 404);
      }

      // Store KYC form data (in a real system, this would be stored separately)
      // For now, we'll update the investor status to pending and store basic info
      await prisma.investor.update({
        where: { userId: investorId },
        data: {
          kycStatus: "pending",
          amlStatus: "pending",
          jurisdiction: formData.country || formData.nationality,
          // Note: In production, you'd store the form data and file references separately
        },
      });

      logger.info(`KYC form submitted for investor ${investorId}`, {
        email: investor.User.email,
        hasFiles: !!files,
      });

      return {
        investorId,
        kycStatus: "pending",
        amlStatus: "pending",
        message:
          "KYC form submitted successfully. Your application is pending admin review.",
      };
    } catch (error: any) {
      logger.error("KYC form submission failed:", error);
      throw error;
    }
  }

  /**
   * Submit KYC form for manager (mock - stores data for admin review)
   */
  async submitManagerKYCForm(managerId: string, formData: any, files?: any) {
    try {
      const manager = await prisma.manager.findUnique({
        where: { userId: managerId },
        include: { User: true },
      });

      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      // Update manager with form data
      await prisma.manager.update({
        where: { userId: managerId },
        data: {
          kycStatus: "pending",
          amlStatus: "pending",
          jurisdiction: formData.country || formData.nationality,
          companyName: formData.companyName || manager.companyName,
          companyAddress: formData.address || manager.companyAddress,
          taxId: formData.taxId || manager.taxId,
        },
      });

      logger.info(`KYC form submitted for manager ${managerId}`, {
        email: manager.User.email,
        hasFiles: !!files,
      });

      return {
        managerId,
        kycStatus: "pending",
        amlStatus: "pending",
        message:
          "KYC form submitted successfully. Your application is pending admin review.",
      };
    } catch (error: any) {
      logger.error("Manager KYC form submission failed:", error);
      throw error;
    }
  }
}
