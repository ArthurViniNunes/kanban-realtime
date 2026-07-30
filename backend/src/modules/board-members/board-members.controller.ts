import { Request, Response } from 'express';
import { BadRequestError } from '../../errors/http-errors.js';
import { assertStringParam } from '../../lib/http/assertStringParam.js';
import {
  addBoardMemberSchema,
  updateBoardMemberRoleSchema,
} from './board-members.schemas.js';
import { boardMembersService } from './board-members.service.js';

export class BoardMembersController {
  /**
   * @openapi
   * /boards/{board}/members:
   *  get:
   *    tags:
   *      - Board Members
   *    summary: List board members
   *    description: Return all board members. Any board member can access this endpoint.
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: boardId
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Board members
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/BoardMember'
   *      400:
   *        description: Invalid board ID
   *      401:
   *        description: Missing or invalid authentication
   *      403:
   *        description: User is not a board member
   */
  async list(req: Request, res: Response) {
    const userId = req.user!.sub;
    const boardId = assertStringParam(req.params.boardId, 'boardId');

    const members = await boardMembersService.listMembers(userId, boardId);

    return res.json(members);
  }

  /**
   * @openapi
   * /boards/{boardId}/members:
   *  post:
   *    tags:
   *      - Board Members
   *    summary: Add a board member
   *    description: Owners can add members or admins. Admins can only add ordinary members
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: boardId
   *        required: true
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - email
   *            properties:
   *              email:
   *                type: string
   *                format: email
   *                example: member@example.com
   *              role:
   *                type: string
   *                enum: [admin, member]
   *                default: member
   *            example:
   *              email: member@example.com
   *              role: member
   *    responses:
   *      201:
   *        description: Member added
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/BoardMember'
   *      400:
   *        description: Invalid request body or board ID
   *      401:
   *        description: Missing or invalid authentication
   *      403:
   *        description: Insufficient permission
   *      404:
   *        description: Active user not found
   *      409:
   *        description: User is already a board member
   */
  async add(req: Request, res: Response) {
    const parsed = addBoardMemberSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;
    const boardId = assertStringParam(req.params.boardId, 'boardId');

    const member = await boardMembersService.addMember(
      userId,
      boardId,
      parsed.data,
    );

    return res.status(201).json(member);
  }

  /**
   * @openapi
   * /boards/{boardId}/members:
   *  patch:
   *    tags:
   *      - Board Members
   *    summary: Update a member role
   *    description: Only the board owner can change roles. The owner role cannot be changed.
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: boardId
   *        required: true
   *        schema:
   *          type: string
   *      - in: path
   *        name: memberId
   *        required: true
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - role
   *            properties:
   *              role:
   *                type: string
   *                enum: [admin, member]
   *            example:
   *              role: admin
   *    responses:
   *      200:
   *        description: Member role updated
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/BoardMember'
   *      400:
   *        description: Invalid request body or path parameter
   *      401:
   *        description: Missing or invalid authentication
   *      403:
   *        description: Only the owner can change roles
   *      404:
   *        description: Membership not found
   */
  async updateRole(req: Request, res: Response) {
    const parsed = updateBoardMemberRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError('Invalid request body');
    }

    const userId = req.user!.sub;
    const boardId = assertStringParam(req.params.boardId, 'boardId');
    const memberId = assertStringParam(req.params.memberId, 'memberId');

    const member = await boardMembersService.updateMemberRole(
      userId,
      boardId,
      memberId,
      parsed.data,
    );

    return res.json(member);
  }

  /**
   * @openapi
   * /boards/{boardId}/members:
   *  delete:
   *    tags:
   *      - Board Members
   *    summary: Remove a board member
   *    description: Owners can remove admins or members. Admins can only remove ordinary members. The owners cannot be removed.
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: boardId
   *        required: true
   *        schema:
   *          type: string
   *      - in: path
   *        name: memberId
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      204:
   *        description: Member removed
   *      400:
   *        description: Invalid path parameter
   *      401:
   *        description: Missing or invalid authentication
   *      403:
   *        description: Insufficient permission or protected owner
   *      404:
   *        description: Membership not found
   */
  async remove(req: Request, res: Response) {
    const userId = req.user!.sub;
    const boardId = assertStringParam(req.params.boardId, 'boardId');
    const memberId = assertStringParam(req.params.memberId, 'memberId');

    await boardMembersService.removeMember(userId, boardId, memberId);

    return res.sendStatus(204);
  }
}
