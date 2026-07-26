import { prisma } from '../../lib/prisma.js';
import { boardAccess } from '../../lib/access/board-access.js';
import { NotFoundError } from '../../errors/http-errors.js';
import { toBoardDTO } from './mappers/boards.mapper.js';

class BoardsService {
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

      return {
        board,
        role: 'owner',
      };
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

  async getById(userId: string, id: string) {
    await boardAccess.ensureAccess(userId, id);

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            cards: {
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
            },
          },
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!board) return null;

    return toBoardDTO(board);
  }

  async deleteBoard(userId: string, boardId: string) {
    await boardAccess.ensureOwner(userId, boardId);

    return prisma.$transaction(async (tx) => {
      await tx.card.deleteMany({
        where: { column: { boardId } },
      });

      await tx.column.deleteMany({
        where: { boardId },
      });

      await tx.boardMember.deleteMany({
        where: { boardId },
      });

      const board = await tx.board.delete({
        where: { id: boardId },
      });

      if (!board) {
        throw new NotFoundError('Board not found');
      }

      return board;
    });
  }
}

export const boardsService = new BoardsService();
