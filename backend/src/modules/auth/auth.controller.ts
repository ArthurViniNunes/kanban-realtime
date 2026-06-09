import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { authService } from './auth.service.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, NotFoundError } from '../../errors/http-errors.js';

export class AuthController {
  /**
   * @openapi
   * /auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Register a new user
   *     description: Creates a new account. Use the returned user data to continue to login.
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
   *           examples:
   *             onboardingUser:
   *               summary: First step of the auth flow
   *               value:
   *                 name: John Doe
   *                 email: john@email.com
   *                 password: strongPassword123
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
   *             examples:
   *               createdUser:
   *                 summary: User created in the onboarding flow
   *                 value:
   *                   id: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
   *                   name: John Doe
   *                   email: john@email.com
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
    *             examples:
    *               invalidPayload:
    *                 summary: Missing required fields
    *                 value:
    *                   error: Invalid request data
    *                   errors:
    *                     - path:
    *                         - password
    *                       message: Required
   *       409:
   *         description: User already exists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
    *             examples:
    *               userExists:
    *                 summary: Email already registered
    *                 value:
    *                   error: Email is already in use
   */
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request data');
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
    *     description: Validates credentials and returns the user profile plus access token.
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
  *           examples:
  *             returningUser:
  *               summary: Login after registration
  *               value:
  *                 email: john@email.com
  *                 password: strongPassword123
   *     responses:
   *       200:
   *         description: Authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
  *                 auth:
  *                   type: object
  *                   properties:
  *                     accessToken:
  *                       type: string
  *                     expiresIn:
  *                       type: string
  *             examples:
  *               authenticatedUser:
  *                 summary: Login with the same account created in register
  *                 value:
  *                   user:
  *                     id: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                     name: John Doe
  *                     email: john@email.com
  *                   auth:
  *                     accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token
  *                     expiresIn: 7d
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
    *             examples:
    *               invalidCredentials:
    *                 summary: Wrong password or email
    *                 value:
    *                   error: Invalid credentials
    *       409:
    *         description: Account already deleted
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 error:
    *                   type: string
    *             examples:
    *               deletedAccount:
    *                 summary: Account was soft deleted earlier
    *                 value:
    *                   error: Account has been deleted
   */
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request data');
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
  *             examples:
  *               currentUser:
  *                 summary: Profile of the authenticated user
  *                 value:
  *                   id: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                   name: John Doe
  *                   email: john@email.com
  *                   createdAt: "2026-06-09T10:15:30.000Z"
   *       401:
   *         description: Unauthorized (missing or invalid token)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
    *             examples:
    *               unauthorized:
    *                 summary: Missing or invalid token
    *                 value:
    *                   error: Unauthorized
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
    *             examples:
    *               userMissing:
    *                 summary: User account was deleted or does not exist
    *                 value:
    *                   error: User not found
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
      throw new NotFoundError('User not found');
    }

    return res.json(user);
  }

  /**
   * @openapi
   * /auth/me:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Auth
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
    *             examples:
    *               unauthorized:
    *                 summary: Token missing or expired
    *                 value:
    *                   error: Unauthorized
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
   *             examples:
   *               userMissing:
   *                 summary: User already removed
   *                 value:
   *                   error: User not found
   *       409:
   *         description: User already deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               alreadyDeleted:
   *                 summary: Account was deleted before this request
   *                 value:
   *                   error: User already deleted
   */
  async deleteUser(req: Request, res: Response) {
    const userId = req.user!.sub;

    await authService.deleteUser(userId);

    return res.sendStatus(204);
  }
}
