import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class InvitationService {
  /**
   * Generate a secure random token for invitations
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create invitations for multiple emails for an SPV
   */
  async createInvitations(
    spvId: string,
    emails: string[],
    managerId: string,
    expiresInDays: number = 30
  ) {
    // Verify SPV exists and manager has access
    const spv = await prisma.sPV.findFirst({
      where: {
        id: spvId,
        managerId
      }
    });

    if (!spv) {
      throw new AppError('SPV not found or access denied', 404);
    }

    if (spv.status !== 'fundraising' && spv.status !== 'configuring') {
      throw new AppError('SPV is not accepting invitations', 400);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitations = [];

    for (const email of emails) {
      // Check if invitation already exists for this email and SPV
      const existing = await prisma.invitation.findFirst({
        where: {
          spvId,
          email,
          status: 'pending'
        }
      });

      if (existing) {
        // Update expiration if invitation exists
        await prisma.invitation.update({
          where: { id: existing.id },
          data: { expiresAt }
        });
        invitations.push(existing);
        continue;
      }

      // Create new invitation
      const token = this.generateToken();
      const invitation = await prisma.invitation.create({
        data: {
          token,
          spvId,
          email,
          invitedBy: managerId,
          expiresAt,
          status: 'pending'
        }
      });

      invitations.push(invitation);
    }

    // Get manager email
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { email: true }
    });

    return {
      invitations: invitations.map(inv => ({
        id: inv.id,
        token: inv.token,
        email: inv.email,
        expiresAt: inv.expiresAt,
        invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inv.token}`
      })),
      spv: {
        id: spv.id,
        name: spv.name,
        managerEmail: manager?.email || ''
      }
    };
  }

  /**
   * Get invitation details by token (for public access)
   */
  async getInvitationByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        SPV: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            targetAmount: true,
            fundraisingStart: true,
            fundraisingEnd: true,
            managerId: true
          }
        }
      }
    });

    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    // Get manager email
    const manager = await prisma.user.findUnique({
      where: { id: invitation.SPV.managerId },
      select: { email: true }
    });

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      throw new AppError('Invitation has expired', 400);
    }

    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      throw new AppError('Invitation has already been accepted', 400);
    }

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      spv: {
        id: invitation.SPV.id,
        name: invitation.SPV.name,
        type: invitation.SPV.type,
        status: invitation.SPV.status,
        targetAmount: invitation.SPV.targetAmount,
        fundraisingStart: invitation.SPV.fundraisingStart,
        fundraisingEnd: invitation.SPV.fundraisingEnd,
        managerEmail: manager?.email || ''
      },
      expiresAt: invitation.expiresAt,
      status: invitation.status
    };
  }

  /**
   * Validate invitation token and email match
   */
  async validateInvitation(token: string, email: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      throw new AppError('Invalid invitation token', 400);
    }

    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new AppError('Email does not match invitation', 400);
    }

    if (invitation.status !== 'pending') {
      throw new AppError('Invitation is no longer valid', 400);
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      throw new AppError('Invitation has expired', 400);
    }

    return invitation;
  }

  /**
   * Mark invitation as accepted after user registration
   */
  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    if (invitation.status === 'accepted') {
      return invitation; // Already accepted
    }

    if (invitation.status !== 'pending') {
      throw new AppError('Invitation is no longer valid', 400);
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      throw new AppError('Invitation has expired', 400);
    }

    // Mark invitation as accepted
    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date()
      }
    });

    return updated;
  }

  /**
   * Get all invitations for an SPV (for manager)
   */
  async getSPVInvitations(spvId: string, managerId: string) {
    const spv = await prisma.sPV.findFirst({
      where: {
        id: spvId,
        managerId
      }
    });

    if (!spv) {
      throw new AppError('SPV not found or access denied', 404);
    }

    const invitations = await prisma.invitation.findMany({
      where: { spvId },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            email: true,
            id: true
          }
        }
      }
    });

    return invitations.map(inv => ({
      id: inv.id,
      token: inv.token,
      email: inv.email,
      status: inv.status,
      expiresAt: inv.expiresAt,
      acceptedAt: inv.acceptedAt,
      createdAt: inv.createdAt,
      invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inv.token}`
    }));
  }
}

