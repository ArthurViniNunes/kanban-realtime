import { requireBoardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';

export class ColumnsService {
  async createColumn(
    userId: string,
    data: { boardId: string; title: string; order: number },
  ) {
    await requireBoardAccess(userId, data.boardId);
    return prisma.column.create({
      data,
    });
  }

  async getByBoard(userId: string, boardId: string) {
    await requireBoardAccess(userId, boardId);
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

    if (!column) throw new Error('Not found');

    await requireBoardAccess(userId, column.boardId);

    // Delete cards in the column first due to foreign key constraints
    await prisma.card.deleteMany({
      where: { columnId },
    });

    return prisma.column.delete({
      where: { id: columnId },
    });
  }
}
