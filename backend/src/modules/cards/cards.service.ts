import { prisma } from '../../lib/prisma.js';
import { boardAccess } from '../../lib/access/board-access.js';
import { SocketEmitter } from '../../socket/socket-emitter.js';
import { BadRequestError, NotFoundError } from '../../errors/http-errors.js';

class CardsService {
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
    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { id: data.cardId },
        include: {
          column: {
            select: { boardId: true },
          },
        },
      });

      if (!card) {
        throw new NotFoundError('Card not found');
      }

      // Valida o acesso ao board de origem.
      await boardAccess.ensureAccess(userId, card.column.boardId, tx);

      const targetColumn = await tx.column.findUnique({
        where: { id: data.toColumnId },
        select: {
          id: true,
          boardId: true,
        },
      });

      if (!targetColumn) {
        throw new NotFoundError('Target column not found');
      }

      // Valida também o acesso ao board de destino.
      await boardAccess.ensureAccess(userId, targetColumn.boardId, tx);

      // Neste projeto, um card não pode mudar de board.
      if (card.column.boardId !== targetColumn.boardId) {
        throw new BadRequestError('Cards cannot be moved between boards');
      }

      const sourceColumnId = card.columnId;
      const isSameColumn = sourceColumnId === targetColumn.id;

      const sourceCards = await tx.card.findMany({
        where: { columnId: sourceColumnId },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      });

      const sourceWithoutMovedCard = sourceCards.filter(
        (sourceCard) => sourceCard.id !== card.id,
      );

      const targetCards = isSameColumn
        ? sourceWithoutMovedCard
        : await tx.card.findMany({
            where: { columnId: targetColumn.id },
            orderBy: [{ order: 'asc' }, { id: 'asc' }],
          });

      // A posição máxima permitida é o final da coluna.
      if (data.order > targetCards.length) {
        throw new BadRequestError('Invalid target position');
      }

      const reorderedTargetCards = [...targetCards];

      reorderedTargetCards.splice(data.order, 0, card);

      // Ao trocar de coluna, fecha as lacunas da coluna de origem.
      if (!isSameColumn) {
        await Promise.all(
          sourceWithoutMovedCard.map((sourceCard, order) =>
            tx.card.update({
              where: { id: sourceCard.id },
              data: { order },
            }),
          ),
        );
      }

      // Reindexa a coluna de destino e move o card.
      await Promise.all(
        reorderedTargetCards.map((targetCard, order) =>
          tx.card.update({
            where: { id: targetCard.id },
            data: {
              columnId: targetColumn.id,
              order,
            },
          }),
        ),
      );

      const updatedCard = await tx.card.findUnique({
        where: { id: card.id },
      });

      if (!updatedCard) {
        throw new NotFoundError('Card not found after move');
      }

      return {
        boardId: targetColumn.boardId,
        fromColumnId: sourceColumnId,
        card: updatedCard,
      };
    });

    // O evento só é emitido depois que a transação termina com sucesso.
    SocketEmitter.cardMoved(result.boardId, {
      card: result.card,
      fromColumnId: result.fromColumnId,
      toColumnId: data.toColumnId,
    });

    return result.card;
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

export const cardsService = new CardsService();
