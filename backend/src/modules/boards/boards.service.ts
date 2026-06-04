import { prisma } from '../../lib/prisma.js';
import { requireBoardOwner } from '../../lib/access/board-access.js';

export class BoardsService {
  async createBoard(userId: string, title: string) {
    return prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          title,
          userId,
        },
      });

      await tx.boardMember.create({
        data: {
          userId,
          boardId: board.id,
          role: 'owner',
        },
      });

      return board;
    });
  }

  async listBoards(userId: string) {
    return prisma.board.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isBoardOwner(userId: string, boardId: string) {
    return prisma.boardMember.findFirst({
      where: {
        userId,
        boardId,
        role: 'owner',
      },
    });
  }

  async deleteBoard(userId: string, boardId: string) {
    await requireBoardOwner(userId, boardId);

    return prisma.$transaction(async (tx) => {
      await tx.boardMember.deleteMany({ where: { boardId } });

      await tx.column.deleteMany({ where: { boardId } });

      await tx.card.deleteMany({
        where: { column: { boardId } },
      });

      return tx.board.delete({ where: { id: boardId } });
    });
  }
}
