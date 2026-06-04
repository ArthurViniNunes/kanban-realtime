import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import {
  authMiddleware,
  AuthRequest,
} from '../../middlewares/auth.middleware.js';
import { prisma } from '../../lib/prisma.js';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user?.sub;

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
});

export { router as authRoutes };
