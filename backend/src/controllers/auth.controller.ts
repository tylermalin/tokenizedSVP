import { Response } from "express";
import { Request } from "express";
import { AuthService } from "../services/auth.service";
import { AppError } from "../middleware/errorHandler";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, role, invitationToken } = req.body;
      const result = await this.authService.register(
        email,
        password,
        role,
        invitationToken
      );
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }
}
