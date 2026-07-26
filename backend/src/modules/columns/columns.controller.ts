import { Request, Response } from 'express';
import { createColumnSchema } from './columns.schemas.js';
import { columnService } from './columns.service.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';
import { BadRequestError } from '../../errors/http-errors.js';

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
   *     description: Creates a column inside a board the user can access.
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
   *           examples:
   *             newColumn:
   *               summary: Create a column in a board
   *               value:
   *                 boardId: board_123
   *                 title: To Do
   *                 order: 1
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
   *             examples:
   *               createdColumn:
   *                 summary: Newly created column
   *                 value:
   *                   id: column_01HZG2ABCDEF1234567890
   *                   boardId: board_123
   *                   title: To Do
   *                   order: 1
   *       400:
   *         description: Validation or business rule error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               invalidPayload:
   *                 summary: Invalid request body
   *                 value:
   *                   error: "Invalid request body"
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
   *         description: Forbidden (no access to board)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               forbidden:
   *                 summary: User cannot access board
   *                 value:
   *                   error: No access to this board
   */
  async create(req: Request, res: Response) {
    const parsed = createColumnSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;

    const column = await columnService.createColumn(userId, parsed.data);

    return res.status(201).json(column);
  }

  /**
   * @openapi
   * /columns/{boardId}:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Columns
   *     summary: List columns by board
   *     description: Returns all columns of a specific board.
   *     parameters:
   *       - in: path
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
   *             examples:
   *               boardColumns:
   *                 summary: Ordered columns for a board
   *                 value:
   *                   - id: column_01HZG2ABCDEF1234567890
   *                     boardId: board_123
   *                     title: To Do
   *                     order: 1
   *                   - id: column_01HZG2BCDEF12345678901
   *                     boardId: board_123
   *                     title: In Progress
   *                     order: 2
   *       400:
   *         description: Missing or invalid boardId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               invalidParam:
   *                 summary: Board ID missing from route
   *                 value:
   *                   error: "Missing required parameter: boardId"
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
   *         description: Forbidden (no board access)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               forbidden:
   *                 summary: User cannot access board
   *                 value:
   *                   error: No access to this board
   */
  async listByBoard(req: Request, res: Response) {
    const boardId = assertStringParam(req.params.boardId, 'boardId');

    const userId = req.user!.sub;

    const columns = await columnService.getByBoard(userId, boardId);

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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               invalidParam:
   *                 summary: Column ID missing or invalid
   *                 value:
   *                   error: "Missing required parameter: id"
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
   *         description: Forbidden (no access to board)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               forbidden:
   *                 summary: User cannot access board
   *                 value:
   *                   error: No access to this board
   *       404:
   *         description: Column not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               notFound:
   *                 summary: Column ID does not exist
   *                 value:
   *                   error: Column not found
   */
  async delete(req: Request, res: Response) {
    const id = assertStringParam(req.params.id, 'id');

    const userId = req.user!.sub;

    await columnService.deleteColumn(userId, id);
    return res.sendStatus(204);
  }
}
