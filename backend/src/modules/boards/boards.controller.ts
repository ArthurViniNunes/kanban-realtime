import { Request, Response } from 'express';
import { createBoardSchema } from './boards.schemas.js';
import { BoardsService } from './boards.service.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';

const boardsService = new BoardsService();

export class BoardsController {
  /**
   * @openapi
   * /boards:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Boards
   *     summary: Create a new board
   *     description: Creates a board owned by the authenticated user.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *                 example: My Kanban Board
   *     responses:
   *       201:
   *         description: Board created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 title:
   *                   type: string
   *                 userId:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Validation or business error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   */
  async create(req: Request, res: Response) {
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

  /**
   * @openapi
   * /boards:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Boards
   *     summary: List boards of authenticated user
   *     description: Returns all boards where the user is owner or member.
   *     responses:
   *       200:
   *         description: List of boards
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   title:
   *                     type: string
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *       401:
   *         description: Unauthorized
   */
  async list(req: Request, res: Response) {
    const userId = req.user!.sub;

    const boards = await boardsService.listBoards(userId);

    return res.json(boards);
  }

  /**
   * @openapi
   * /boards/{id}:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Boards
   *     summary: Delete a board
   *     description: Only the board owner can delete it.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Board ID
   *     responses:
   *       204:
   *         description: Board deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (not owner)
   *       404:
   *         description: Board not found
   */
  async delete(req: Request, res: Response) {
    const userId = req.user!.sub;

    const id = assertStringParam(req.params.id, 'id');

    await boardsService.deleteBoard(userId, id);

    return res.sendStatus(204);
  }
}
