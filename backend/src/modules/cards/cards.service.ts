import { prisma } from '../../lib/prisma.js';
import { boardAccess } from '../../lib/access/board-access.js';
import { SocketEmitter } from '../../socket/socket-emitter.js';
import { NotFoundError } from '../../errors/http-errors.js';

export class CardsService {
  async createCard(
    userId: string,
    data: { columnId: string; title: string; order: number },
  ) {
    const column = await prisma.column.findUnique({
      where: { id: data.columnId },
      select: { boardId: true },
    });

    if (!column) throw new NotFoundError('Column not found');

    await boardAccess.ensureAccess(userId, column.boardId);

    const card = await prisma.card.create({
      data: {
        columnId: data.columnId,
        title: data.title,
        order: data.order,
      },
    });

    SocketEmitter.cardCreated(column.boardId, card);

    return card;
  }

  async getByColumn(userId: string, columnId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });

    if (!column) throw new NotFoundError('Column not found');

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

    if (!card) throw new NotFoundError('Card not found');

    const targetColumn = await prisma.column.findUnique({
      where: { id: data.toColumnId },
      include: { cards: { orderBy: { order: 'asc' } } },
    });

    if (!targetColumn) throw new NotFoundError('Target column not found');

    await boardAccess.ensureAccess(userId, targetColumn.boardId);

    // remove card da coluna antiga
    await prisma.card.update({
      where: { id: card.id },
      data: {
        columnId: data.toColumnId,
      },
    });

    // pega cards da coluna destino sem o card movido
    const otherCards = targetColumn.cards.filter((c) => c.id !== card.id);

    // insere na posição desejada
    otherCards.splice(data.order, 0, {
      ...card,
      columnId: data.toColumnId,
    });

    // reindex total
    await Promise.all(
      otherCards.map((c, index) =>
        prisma.card.update({
          where: { id: c.id },
          data: { order: index },
        }),
      ),
    );

    const updatedCard = await prisma.card.findUnique({
      where: { id: card.id },
    });

    if (!updatedCard) throw new NotFoundError('Update failed');

    return updatedCard;
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });

    if (!card) throw new NotFoundError('Card not found');

    await boardAccess.ensureAccess(userId, card.column.boardId);

    await prisma.card.delete({
      where: { id: cardId },
    });

    SocketEmitter.cardDeleted(card.column.boardId, {
      cardId,
      columnId: card.columnId,
    });

    return { success: true };
  }
}
