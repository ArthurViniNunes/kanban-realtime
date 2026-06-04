import { Request, Response } from 'express';
import { CardsService } from './cards.service.js';
import { createCardSchema, moveCardSchema } from './cards.schemas.js';

const service = new CardsService();

export class CardsController {
  async create(req: Request, res: Response) {
    const parsed = createCardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const card = await service.createCard(parsed.data);
    return res.status(201).json(card);
  }

  async listByColumn(req: Request, res: Response) {
    const { columnId } = req.params;

    const cards = await service.getByColumn(columnId.toString());
    return res.json(cards);
  }

  async move(req: Request, res: Response) {
    const parsed = moveCardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const card = await service.moveCard(parsed.data);
    return res.json(card);
  }
}
