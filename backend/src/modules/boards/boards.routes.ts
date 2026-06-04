import { Router } from 'express';
import { BoardsController } from './boards.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new BoardsController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.list(req, res));

export { router as boardsRoutes };
