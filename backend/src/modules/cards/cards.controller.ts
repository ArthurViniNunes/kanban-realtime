import { Request, Response } from 'express';
import { cardsService } from './cards.service.js';
import { createCardSchema, moveCardSchema } from './cards.schemas.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';
import { BadRequestError } from '../../errors/http-errors.js';

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
   *     description: Creates a card inside a column of a board the user can access.
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
   *           examples:
   *             newCard:
   *               summary: Create a card in a column
   *               value:
   *                 columnId: column_123
   *                 title: Implement Swagger
   *                 order: 1
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
   *             examples:
   *               createdCard:
   *                 summary: Newly created card
   *                 value:
   *                   id: card_01HZG2TAAA11BBB22CCC33DDD
   *                   columnId: column_123
   *                   title: Implement Swagger
   *                   order: 1
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
   *                 summary: Missing required fields
   *                 value:
   *                   error: Invalid request body
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
   *         description: Forbidden (no access to the board)
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
    const parsed = createCardSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;

    const card = await cardsService.createCard(userId, parsed.data);
    return res.status(201).json(card);
  }

  /**
   * @openapi
   * /cards/{columnId}:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Cards
   *     summary: List cards by column
   *     description: Returns all cards inside a column.
   *     parameters:
   *       - in: path
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
   *             examples:
   *               columnCards:
   *                 summary: Cards inside a column
   *                 value:
   *                   - id: card_01HZG2TAAA11BBB22CCC33DDD
   *                     columnId: column_123
   *                     title: Implement Swagger
   *                     order: 1
   *                   - id: card_01HZG2TBBB22CCC33DDD44EEE
   *                     columnId: column_123
   *                     title: Review board docs
   *                     order: 2
   *       400:
   *         description: Missing or invalid columnId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               invalidParam:
   *                 summary: Column ID missing from route
   *                 value:
   *                   error: "Missing required parameter: columnId"
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
   *         description: Forbidden (no access to the board)
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
  async listByColumn(req: Request, res: Response) {
    const columnId = assertStringParam(req.params.columnId, 'columnId');
    const userId = req.user!.sub;

    const cards = await cardsService.getByColumn(userId, columnId.toString());
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
   *           examples:
   *             moveCard:
   *               summary: Move a card to another column
   *               value:
   *                 cardId: card_123
   *                 toColumnId: column_456
   *                 order: 0
   *     responses:
   *       200:
   *         description: Card moved successfully
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
   *             examples:
   *               movedCard:
   *                 summary: Card after moving and reindexing
   *                 value:
   *                   id: card_123
   *                   columnId: column_456
   *                   title: Implement Swagger
   *                   order: 0
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
   *                 summary: Missing required fields
   *                 value:
   *                   error: Invalid request body
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
   *         description: Forbidden (no access to the target board)
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
  async move(req: Request, res: Response) {
    const parsed = moveCardSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;

    const card = await cardsService.moveCard(userId, parsed.data);
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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               invalidParam:
   *                 summary: Invalid card id parameter
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
   *         description: Forbidden (no access to the board)
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
   *         description: Card not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *             examples:
   *               notFound:
   *                 summary: Card ID does not exist
   *                 value:
   *                   error: Card not found
   */
  async delete(req: Request, res: Response) {
    const id = assertStringParam(req.params.id, 'id');
    const userId = req.user!.sub;

    await cardsService.deleteCard(userId, id);

    return res.sendStatus(204);
  }
}
