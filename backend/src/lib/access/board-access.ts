import { ForbiddenError } from '../../errors/http-errors.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../prisma.js';

type BoardAccessClient = Pick<Prisma.TransactionClient, 'boardMember'>;

class BoardAccess {
  private async findMembership(
    userId: string,
    boardId: string,
    client: BoardAccessClient,
  ) {
    return client.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });
  }

  async ensureAccess(
    userId: string,
    boardId: string,
    client: BoardAccessClient = prisma,
  ) {
    const membership = await this.findMembership(userId, boardId, client);

    if (!membership) {
      throw new ForbiddenError('No access to this board');
    }
  }

  async ensureOwner(
    userId: string,
    boardId: string,
    client: BoardAccessClient = prisma,
  ) {
    const membership = await this.findMembership(userId, boardId, client);

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenError('Only owner allowed');
    }
  }

  async ensureCanManageMembers(
    userId: string,
    boardId: string,
    client: BoardAccessClient = prisma,
  ) {
    const membership = await this.findMembership(userId, boardId, client);

    if (
      !membership ||
      (membership.role !== 'owner' && membership.role !== 'admin')
    ) {
      throw new ForbiddenError('Only owner or admin can manage members');
    }

    return membership;
  }
}

export const boardAccess = new BoardAccess();
