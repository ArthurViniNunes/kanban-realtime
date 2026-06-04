import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));

router.get('/me', authMiddleware, (req, res) => controller.me(req, res));
router.delete('/me', authMiddleware, (req, res) =>
  controller.deleteUser(req, res),
);

export { router as authRoutes };
