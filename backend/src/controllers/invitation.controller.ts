import { Response } from 'express';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InvitationService } from '../services/invitation.service';

export class InvitationController {
  private invitationService: InvitationService;

  constructor() {
    this.invitationService = new InvitationService();
  }

  /**
   * Get invitation details by token (public endpoint)
   */
  async getInvitationByToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const invitation = await this.invitationService.getInvitationByToken(token);
      res.json(invitation);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all invitations for an SPV (manager only)
   */
  async getSPVInvitations(req: AuthRequest, res: Response) {
    try {
      const { spvId } = req.params;
      const invitations = await this.invitationService.getSPVInvitations(
        spvId,
        req.user!.id
      );
      res.json(invitations);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate invitation token (used during registration)
   */
  async validateInvitation(req: Request, res: Response) {
    try {
      const { token, email } = req.body;
      const invitation = await this.invitationService.validateInvitation(token, email);
      res.json({
        valid: true,
        invitation: {
          id: invitation.id,
          spvId: invitation.spvId,
          email: invitation.email
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

