import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DocumentGenerationService } from "../services/document-generation.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const documentService = new DocumentGenerationService();

export class DocumentController {
  /**
   * Get all documents for an SPV
   */
  async getSPVDocuments(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const userId = req.user!.id;

      // Verify user has access to this SPV
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // For investors, need to get Investor record first to check subscriptions
      let investorId: string | undefined;
      if (user?.role === "investor") {
        const investor = await prisma.investor.findUnique({
          where: { userId },
          select: { id: true },
        });
        investorId = investor?.id;
      }

      const spv = await prisma.sPV.findFirst({
        where: {
          id: spvId,
          ...(user?.role === "admin"
            ? {}
            : user?.role === "manager"
            ? { managerId: userId }
            : {
                OR: [
                  { status: { in: ["fundraising", "active"] } },
                  ...(investorId
                    ? [
                        {
                          Subscription: {
                            some: { investorId },
                          },
                        },
                      ]
                    : []),
                ],
              }),
        },
      });

      if (!spv) {
        return res
          .status(404)
          .json({ error: "SPV not found or access denied" });
      }

      const documents = await documentService.getSPVDocuments(spvId);
      res.json(documents);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific document
   */
  async getDocument(req: AuthRequest, res: Response) {
    try {
      const { spvId, documentType } = req.params;
      const userId = req.user!.id;

      // Verify user has access to this SPV
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // For investors, need to get Investor record first to check subscriptions
      let investorId: string | undefined;
      if (user?.role === "investor") {
        const investor = await prisma.investor.findUnique({
          where: { userId },
          select: { id: true },
        });
        investorId = investor?.id;
      }

      const spv = await prisma.sPV.findFirst({
        where: {
          id: spvId,
          ...(user?.role === "admin"
            ? {}
            : user?.role === "manager"
            ? { managerId: userId }
            : {
                OR: [
                  { status: { in: ["fundraising", "active"] } },
                  ...(investorId
                    ? [
                        {
                          Subscription: {
                            some: { investorId },
                          },
                        },
                      ]
                    : []),
                ],
              }),
        },
      });

      if (!spv) {
        return res
          .status(404)
          .json({ error: "SPV not found or access denied" });
      }

      const document = await documentService.getDocument(spvId, documentType);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.setHeader("Content-Type", "text/html");
      res.send(document.content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Regenerate documents for an SPV (admin/manager only)
   */
  async regenerateDocuments(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const userId = req.user!.id;

      // Verify user is manager or admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      const spv = await prisma.sPV.findFirst({
        where: {
          id: spvId,
          ...(user?.role === "admin" ? {} : { managerId: userId }),
        },
      });

      if (!spv) {
        return res
          .status(404)
          .json({ error: "SPV not found or access denied" });
      }

      // Regenerate all documents
      await documentService.generateOperatingAgreement(spvId);
      await documentService.generateSubscriptionAgreement(spvId);
      await documentService.generatePPM(spvId);

      const documents = await documentService.getSPVDocuments(spvId);
      res.json({ message: "Documents regenerated successfully", documents });
    } catch (error) {
      throw error;
    }
  }
}
