import { Router } from 'express';
import { ColumnsController } from './columns.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new ColumnsController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.create(req, res));

router.get('/:boardId', (req, res) => controller.listByBoard(req, res));

router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as columnsRoutes };
