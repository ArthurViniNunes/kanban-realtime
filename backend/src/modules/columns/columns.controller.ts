import { Request, Response } from 'express';
import { createColumnSchema } from './columns.schemas.js';
import { ColumnsService } from './columns.service.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';

const service = new ColumnsService();

export class ColumnsController {
  /**
   * @openapi
   * /columns:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Columns
   *     summary: Create a column
   *     description: Creates a column inside a board owned or accessible by the user.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - boardId
   *               - title
   *               - order
   *             properties:
   *               boardId:
   *                 type: string
   *                 example: board_123
   *               title:
   *                 type: string
   *                 example: To Do
   *               order:
   *                 type: number
   *                 example: 1
   *     responses:
   *       201:
   *         description: Column created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 boardId:
   *                   type: string
   *                 title:
   *                   type: string
   *                 order:
   *                   type: number
   *       400:
   *         description: Validation or business rule error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (no access to board)
   */
  async create(req: Request, res: Response) {
    const parsed = createColumnSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const userId = req.user!.sub;

    const column = await service.createColumn(userId, parsed.data);

    return res.status(201).json(column);
  }

  /**
   * @openapi
   * /columns:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Columns
   *     summary: List columns by board
   *     description: Returns all columns of a specific board.
   *     parameters:
   *       - in: query
   *         name: boardId
   *         required: true
   *         schema:
   *           type: string
   *         description: Board ID
   *     responses:
   *       200:
   *         description: List of columns
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   boardId:
   *                     type: string
   *                   title:
   *                     type: string
   *                   order:
   *                     type: number
   *       400:
   *         description: Missing or invalid boardId
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (no board access)
   */
  async listByBoard(req: Request, res: Response) {
    const boardId = assertStringParam(req.query.boardId, 'boardId');

    const userId = req.user!.sub;

    const columns = await service.getByBoard(userId, boardId);

    return res.json(columns);
  }

  /**
   * @openapi
   * /columns/{id}:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Columns
   *     summary: Delete column
   *     description: Deletes a column if the user has access to its board.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Column ID
   *     responses:
   *       204:
   *         description: Column deleted successfully
   *       400:
   *         description: Invalid column id
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Column not found
   */
  async delete(req: Request, res: Response) {
    const id = assertStringParam(req.params.id, 'id');

    const userId = req.user!.sub;

    await service.deleteColumn(userId, id);
    return res.sendStatus(204);
  }
}
