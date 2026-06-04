import { Request, Response } from 'express';
import { createBoardSchema } from './boards.schemas.js';
import { BoardsService } from './boards.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

const boardsService = new BoardsService();

export class BoardsController {
  async create(req: AuthRequest, res: Response) {
    const parsed = createBoardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    try {
      const userId = req.user!.sub;

      const board = await boardsService.createBoard(userId, parsed.data.title);

      return res.status(201).json(board);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }

  async list(req: AuthRequest, res: Response) {
    const userId = req.user!.sub;

    const boards = await boardsService.listBoards(userId);

    return res.json(boards);
  }

  async delete(req: AuthRequest, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { boardId } = req.params;

    await boardsService.deleteBoard(userId, boardId.toString());

    return res.status(204).send();
  }
}
