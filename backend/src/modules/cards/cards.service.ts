import { boardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';

export class CardsService {
  async createCard(
    userId: string,
    data: { columnId: string; title: string; order: number },
  ) {
    const column = await prisma.column.findUnique({
      where: { id: data.columnId },
      select: { boardId: true },
    });

    if (!column) throw new Error('Column not found');

    await boardAccess.ensureAccess(userId, column.boardId);

    return prisma.card.create({
      data: {
        columnId: data.columnId,
        title: data.title,
        order: data.order,
      },
    });
  }

  async getByColumn(userId: string, columnId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });

    if (!column) throw new Error('Not found');

    await boardAccess.ensureAccess(userId, column.boardId);

    return prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
  }

  async moveCard(
    userId: string,
    data: { cardId: string; toColumnId: string; order: number },
  ) {
    const card = await prisma.card.findUnique({
      where: { id: data.cardId },
      include: { column: true },
    });

    if (!card) throw new Error('Not found');

    const targetColumn = await prisma.column.findUnique({
      where: { id: data.toColumnId },
    });

    if (!targetColumn) throw new Error('Target column not found');

    await boardAccess.ensureAccess(userId, targetColumn.boardId);

    return prisma.card.update({
      where: { id: data.cardId },
      data: {
        columnId: data.toColumnId,
        order: data.order,
      },
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });

    if (!card) throw new Error('Not found');

    await boardAccess.ensureAccess(userId, card.column.boardId);

    return prisma.card.delete({
      where: { id: cardId },
    });
  }
}
