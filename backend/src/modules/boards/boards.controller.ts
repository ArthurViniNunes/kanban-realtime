import { Request, Response } from 'express';
import { createBoardSchema } from './boards.schemas.js';
import { boardsService } from './boards.service.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';
import { BadRequestError } from '../../errors/http-errors.js';

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
  *     description: Creates a board and automatically adds the authenticated user as owner.
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
  *           examples:
  *             simpleBoard:
  *               summary: Basic board creation
  *               value:
  *                 title: Product Roadmap
   *     responses:
   *       201:
   *         description: Board created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
  *                 board:
  *                   type: object
  *                   properties:
  *                     id:
  *                       type: string
  *                     title:
  *                       type: string
  *                     userId:
  *                       type: string
  *                     createdAt:
  *                       type: string
  *                       format: date-time
  *                 role:
  *                   type: string
  *                   example: owner
  *             examples:
  *               createdBoard:
  *                 summary: Board created with owner membership
  *                 value:
  *                   board:
  *                     id: board_01HZG2ABCD3EF4GH5IJ6KL7MN8
  *                     title: Product Roadmap
  *                     userId: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                     createdAt: "2026-06-09T11:00:00.000Z"
  *                   role: owner
   *       400:
  *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
  *             examples:
  *               invalidPayload:
  *                 summary: Missing board title
  *                 value:
  *                   errors:
  *                     - path:
  *                         - title
  *                       message: Required
  *       401:
  *         description: Unauthorized (missing or invalid token)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               unauthorized:
  *                 summary: Token missing or invalid
  *                 value:
  *                   error: Unauthorized
   */
  async create(req: Request, res: Response) {
    const parsed = createBoardSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;

    const board = await boardsService.createBoard(userId, parsed.data.title);

    return res.status(201).json(board);
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
  *                   userId:
  *                     type: string
   *                   createdAt:
   *                     type: string
   *                     format: date-time
  *             examples:
  *               userBoards:
  *                 summary: Boards where the user participates
  *                 value:
  *                   - id: board_01HZG2ABCD3EF4GH5IJ6KL7MN8
  *                     title: Product Roadmap
  *                     userId: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                     createdAt: "2026-06-09T11:00:00.000Z"
  *                   - id: board_01HZG2AUVW9XY8ZT7RQ6PO5NM4
  *                     title: Sprint Planning
  *                     userId: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                     createdAt: "2026-06-08T16:30:00.000Z"
   *       401:
  *         description: Unauthorized (missing or invalid token)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               unauthorized:
  *                 summary: Token missing or invalid
  *                 value:
  *                   error: Unauthorized
   */
  async list(req: Request, res: Response) {
    const userId = req.user!.sub;

    const boards = await boardsService.listBoards(userId);

    return res.json(boards);
  }

  /**
   * @openapi
   * /boards/{id}:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Boards
  *     summary: Get a board by ID
  *     description: Returns board details including ordered columns and cards. User must be a member.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Board ID
   *     responses:
   *       200:
   *         description: Board with columns and cards
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
   *                 columns:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       title:
   *                         type: string
   *                       order:
   *                         type: number
   *                       cards:
   *                         type: array
   *                         items:
   *                           type: object
  *             examples:
  *               boardWithColumns:
  *                 summary: Full board payload with nested columns and cards
  *                 value:
  *                   id: board_01HZG2ABCD3EF4GH5IJ6KL7MN8
  *                   title: Product Roadmap
  *                   userId: user_01HZX8Q8Y3V7A1B2C3D4E5F6G7
  *                   createdAt: "2026-06-09T11:00:00.000Z"
  *                   columns:
  *                     - id: col_01HZG2M111AA22BB33CC44DD55
  *                       title: Todo
  *                       order: 1
  *                       cards:
  *                         - id: card_01HZG2TAAA11BBB22CCC33DDD
  *                           title: Define MVP scope
  *                           description: Gather requirements for first release
  *                           order: 1
  *                           columnId: col_01HZG2M111AA22BB33CC44DD55
  *                     - id: col_01HZG2M666EE77FF88GG99HH00
  *                       title: In Progress
  *                       order: 2
  *                       cards: []
   *       401:
  *         description: Unauthorized (missing or invalid token)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               unauthorized:
  *                 summary: Token missing or invalid
  *                 value:
  *                   error: Unauthorized
   *       403:
  *         description: Forbidden (not a member)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               forbidden:
  *                 summary: User is not a board member
  *                 value:
  *                   error: You are not a member of this board
   *       404:
   *         description: Board not found
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               notFound:
  *                 summary: Board ID does not exist
  *                 value:
  *                   error: Board not found
   */
  async getBoardById(req: Request, res: Response) {
    const userId = req.user!.sub;

    const id = assertStringParam(req.params.id, 'id');

    const board = await boardsService.getById(userId, id);

    return res.json(board);
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
  *         description: Unauthorized (missing or invalid token)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               unauthorized:
  *                 summary: Token missing or invalid
  *                 value:
  *                   error: Unauthorized
   *       403:
   *         description: Forbidden (not owner)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               forbidden:
  *                 summary: Only owner can delete board
  *                 value:
  *                   error: You are not the owner of this board
   *       404:
   *         description: Board not found
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *             examples:
  *               notFound:
  *                 summary: Board ID does not exist
  *                 value:
  *                   error: Board not found
   */
  async delete(req: Request, res: Response) {
    const userId = req.user!.sub;

    const id = assertStringParam(req.params.id, 'id');

    await boardsService.deleteBoard(userId, id);

    return res.sendStatus(204);
  }
}
