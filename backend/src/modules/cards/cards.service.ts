import { prisma } from '../../lib/prisma.js';

export class CardsService {
  async createCard(data: {
    columnId: string;
    title: string;
    description?: string;
    order: number;
  }) {
    return prisma.card.create({
      data,
    });
  }

  async getByColumn(columnId: string) {
    return prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
  }

  async moveCard(data: { cardId: string; toColumnId: string; order: number }) {
    return prisma.card.update({
      where: { id: data.cardId },
      data: {
        columnId: data.toColumnId,
        order: data.order,
      },
    });
  }
}
