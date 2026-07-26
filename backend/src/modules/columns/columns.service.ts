import { boardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../errors/http-errors.js';

class ColumnsService {
  async createColumn(
    userId: string,
    data: { boardId: string; title: string; order: number },
  ) {
    await boardAccess.ensureAccess(userId, data.boardId);

    return prisma.column.create({
      data,
    });
  }

  async getByBoard(userId: string, boardId: string) {
    await boardAccess.ensureAccess(userId, boardId);

    return prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        cards: true,
      },
    });
  }

  async deleteColumn(userId: string, columnId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    await boardAccess.ensureAccess(userId, column.boardId);

    // garante consistência antes de deletar coluna
    await prisma.card.deleteMany({
      where: { columnId },
    });

    return prisma.column.delete({
      where: { id: columnId },
    });
  }
}

export const columnService = new ColumnsService();
