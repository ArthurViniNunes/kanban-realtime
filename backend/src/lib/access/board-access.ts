import { prisma } from '../prisma.js';
import { ForbiddenError } from '../../errors/http-errors.js';

class BoardAccess {
  async ensureAccess(userId: string, boardId: string) {
    const member = await prisma.boardMember.findFirst({
      where: { userId, boardId },
    });

    if (!member) {
      throw new ForbiddenError('No access to this board');
    }
  }

  async ensureOwner(userId: string, boardId: string) {
    const owner = await prisma.boardMember.findFirst({
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
