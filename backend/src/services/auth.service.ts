import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler";
import { InvitationService } from "./invitation.service";

const prisma = new PrismaClient();

export class AuthService {
  private invitationService: InvitationService;

  constructor() {
    this.invitationService = new InvitationService();
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(
    email: string,
    password: string,
    role: string,
    invitationToken?: string
  ) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError("User already exists", 400);
    }

    // If invitation token is provided, validate it
    let invitation = null;
    if (invitationToken) {
      invitation = await this.invitationService.validateInvitation(
        invitationToken,
        email
      );

      // Ensure role is investor for invitations
      if (role !== "investor") {
        throw new AppError("Invitations are only for investors", 400);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as "manager" | "investor" | "admin",
      },
    });

    // Create investor profile if role is investor
    if (role === "investor") {
      await prisma.investor.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Create manager profile if role is manager
    if (role === "manager") {
      await prisma.manager.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Mark invitation as accepted if provided
    if (invitation && invitationToken) {
      await this.invitationService.acceptInvitation(invitationToken, user.id);
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      invitationAccepted: !!invitation,
    };
  }

  private generateToken(id: string, email: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    return jwt.sign({ id, email, role }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }
}
