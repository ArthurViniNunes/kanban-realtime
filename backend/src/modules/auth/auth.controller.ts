import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import { prisma } from '../../lib/prisma.js';

const authService = new AuthService();

export class AuthController {
  /**
   * @openapi
   * /auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Register a new user
   *     description: Creates a new user account with email, name and password.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@email.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: strongPassword123
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Validation error or business rule violation
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   */
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const user = await authService.register(parsed.data);

    return res.status(201).json(user);
  }

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Authenticate user and return JWT token
   *     description: Validates credentials and returns access token.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@email.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: strongPassword123
   *     responses:
   *       200:
   *         description: Authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   description: JWT access token
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const result = await authService.login(parsed.data);
    return res.status(200).json(result);
  }

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Auth
   *     summary: Get authenticated user profile
   *     description: Returns the currently authenticated user based on JWT token.
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: Unauthorized (missing or invalid token)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  async me(req: Request, res: Response) {
    const userId = req.user!.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  }

  /**
   * @openapi
   * /users/me:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Users
   *     summary: Delete authenticated user
   *     description: Soft deletes the currently authenticated user. A user can only delete their own account.
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Unauthorized
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: User not found
   */
  async deleteUser(req: Request, res: Response) {
    const userId = req.user!.sub;

    await authService.deleteUser(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  }
}
