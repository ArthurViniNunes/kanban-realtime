import { Request, Response } from 'express';
import { CardsService } from './cards.service.js';
import { createCardSchema, moveCardSchema } from './cards.schemas.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';

const service = new CardsService();

export class CardsController {
  /**
   * @openapi
   * /cards:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Cards
   *     summary: Create a card
   *     description: Creates a card inside a column.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - columnId
   *               - title
   *               - order
   *             properties:
   *               columnId:
   *                 type: string
   *                 example: column_123
   *               title:
   *                 type: string
   *                 example: Implement Swagger
   *               order:
   *                 type: number
   *                 example: 1
   *     responses:
   *       201:
   *         description: Card created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 columnId:
   *                   type: string
   *                 title:
   *                   type: string
   *                 order:
   *                   type: number
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async create(req: Request, res: Response) {
    const parsed = createCardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const userId = req.user!.sub;

    const card = await service.createCard(userId, parsed.data);
    return res.status(201).json(card);
  }

  /**
   * @openapi
   * /cards:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Cards
   *     summary: List cards by column
   *     description: Returns all cards inside a column.
   *     parameters:
   *       - in: query
   *         name: columnId
   *         required: true
   *         schema:
   *           type: string
   *         description: Column ID
   *     responses:
   *       200:
   *         description: List of cards
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   columnId:
   *                     type: string
   *                   title:
   *                     type: string
   *                   order:
   *                     type: number
   *       400:
   *         description: Missing columnId
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async listByColumn(req: Request, res: Response) {
    const columnId = assertStringParam(req.query.columnId, 'columnId');
    const userId = req.user!.sub;

    const cards = await service.getByColumn(userId, columnId.toString());
    return res.json(cards);
  }

  /**
   * @openapi
   * /cards/move:
   *   patch:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Cards
   *     summary: Move card between columns
   *     description: Updates card column and position.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cardId
   *               - toColumnId
   *               - order
   *             properties:
   *               cardId:
   *                 type: string
   *               toColumnId:
   *                 type: string
   *               order:
   *                 type: number
   *     responses:
   *       200:
   *         description: Card moved successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async move(req: Request, res: Response) {
    const parsed = moveCardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues,
      });
    }

    const userId = req.user!.sub;

    const card = await service.moveCard(userId, parsed.data);
    return res.json(card);
  }

  /**
   * @openapi
   * /cards/{id}:
   *   delete:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Cards
   *     summary: Delete card
   *     description: Deletes a card if user has access to its board.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Card ID
   *     responses:
   *       204:
   *         description: Card deleted successfully
   *       400:
   *         description: Invalid id
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Card not found
   */
  async delete(req: Request, res: Response) {
    const id = assertStringParam(req.params.id, 'id');
    const userId = req.user!.sub;

    await service.deleteCard(userId, id);

    return res.sendStatus(204);
  }
}
