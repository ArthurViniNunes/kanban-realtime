import { Router } from 'express';
import { CardsController } from './cards.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new CardsController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.create(req, res));
router.get('/:columnId', (req, res) => controller.listByColumn(req, res));
router.patch('/move', (req, res) => controller.move(req, res));

export { router as cardsRoutes };
