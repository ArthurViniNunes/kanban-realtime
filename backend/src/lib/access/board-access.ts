import type { Prisma } from '../../generated/prisma/client.js';
import { ForbiddenError } from '../../errors/http-errors.js';
import { prisma } from '../prisma.js';

type BoardAccessClient = Pick<Prisma.TransactionClient, 'boardMember'>;

class BoardAccess {
  async ensureAccess(
    userId: string,
    boardId: string,
    client: BoardAccessClient = prisma,
  ) {
    const member = await client.boardMember.findFirst({
      where: { userId, boardId },
    });

    if (!member) {
      throw new ForbiddenError('No access to this board');
    }
  }

  async ensureOwner(
    userId: string,
    boardId: string,
    client: BoardAccessClient = prisma,
  ) {
    const owner = await client.boardMember.findFirst({
      where: {
        userId,
        boardId,
        role: 'owner',
      },
    });

    if (!owner) {
      throw new ForbiddenError('Only owner allowed');
    }
  }
}

export const boardAccess = new BoardAccess();
