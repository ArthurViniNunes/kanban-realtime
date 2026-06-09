import { Router } from 'express';
import { BoardsController } from './boards.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new BoardsController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.create(req, res));

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getBoardById(req, res));

router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as boardsRoutes };
