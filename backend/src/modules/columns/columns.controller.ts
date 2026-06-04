import { Request, Response } from 'express';
import { createColumnSchema } from './columns.schemas.js';
import { ColumnsService } from './columns.service.js';

const service = new ColumnsService();

export class ColumnsController {
  async create(req: Request, res: Response) {
    const parsed = createColumnSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    try {
      const column = await service.createColumn(parsed.data);
      return res.status(201).json(column);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async listByBoard(req: Request, res: Response) {
    const { boardId } = req.params;

    const columns = await service.getByBoard(boardId.toString());

    return res.json(columns);
  }
}
