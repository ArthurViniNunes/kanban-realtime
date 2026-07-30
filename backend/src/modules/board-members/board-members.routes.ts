import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { BoardMembersController } from './board-members.controller.js';

const router = Router();
const controller = new BoardMembersController();

router.use(authMiddleware);

router.get('/:boardId/members', (req, res) => controller.list(req, res));

router.post('/:boardId/members', (req, res) => controller.add(req, res));

router.patch('/:boardId/members/:memberId', (req, res) =>
  controller.updateRole(req, res),
);

router.delete('/:boardId/members/:memberId', (req, res) =>
  controller.remove(req, res),
);

export { router as boardMembersRoutes };
