import { Router } from 'express';

export const router = Router();

router.get('/', (_, res) => {
  res.json({
    message: 'Kanban API running',
  });
});
