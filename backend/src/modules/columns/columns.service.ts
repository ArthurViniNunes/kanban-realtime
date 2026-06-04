import { prisma } from '../../lib/prisma.js';

export class ColumnsService {
  async createColumn(data: { boardId: string; title: string; order: number }) {
    return prisma.column.create({
      data,
    });
  }

  async getByBoard(boardId: string) {
    return prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        cards: true,
      },
    });
  }
}
