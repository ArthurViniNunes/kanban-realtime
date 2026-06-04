import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { AuthService } from './auth.service.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    try {
      const user = await authService.register(parsed.data);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    try {
      const result = await authService.login(parsed.data);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(401).json({
        error: err.message,
      });
    }
  }
}
