import { requireBoardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';

export class CardsService {
  async createCard(
    userId: string,
    data: { boardId: string; columnId: string; title: string; order: number },
  ) {
    await requireBoardAccess(userId, data.boardId);

    const column = await prisma.column.findUnique({
      where: { id: data.columnId },
      select: { boardId: true },
    });

    if (!column || column.boardId !== data.boardId) {
      throw new Error('Invalid column for board');
    }

    return prisma.card.create({
      data,
    });
  }

  async getByColumn(userId: string, columnId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });

    if (!column) throw new Error('Not found');

    await requireBoardAccess(userId, column.boardId);

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

    await requireBoardAccess(userId, targetColumn.boardId);

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

    await requireBoardAccess(userId, card.column.boardId);

    return prisma.card.delete({
      where: { id: cardId },
    });
  }
}
