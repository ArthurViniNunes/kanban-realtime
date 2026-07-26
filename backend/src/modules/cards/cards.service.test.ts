import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, ForbiddenError } from '../../errors/http-errors.js';

const mocks = vi.hoisted(() => {
  const transactionClient = {
    card: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    column: {
      findUnique: vi.fn(),
    },
  };

  return {
    transactionClient,
    transaction: vi.fn(),
    ensureAccess: vi.fn(),
    cardMoved: vi.fn(),
  };
});

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock('../../lib/access/board-access.js', () => ({
  boardAccess: {
    ensureAccess: mocks.ensureAccess,
  },
}));

vi.mock('../../socket/socket-emitter.js', () => ({
  SocketEmitter: {
    cardMoved: mocks.cardMoved,
  },
}));

import { cardsService } from './cards.service.js';

const movedCard = {
  id: 'card-moving',
  title: 'Moving card',
  description: null,
  order: 1,
  columnId: 'column-source',
  createdAt: new Date('2026-07-26T10:00:00.000Z'),
  updatedAt: new Date('2026-07-26T10:00:00.000Z'),
  column: {
    boardId: 'board-1',
  },
};

function card(id: string, columnId: string, order: number) {
  return {
    id,
    title: id,
    description: null,
    order,
    columnId,
    createdAt: new Date('2026-07-26T10:00:00.000Z'),
    updatedAt: new Date('2026-07-26T10:00:00.000Z'),
  };
}

describe('CardsService.moveCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.transaction.mockImplementation(async (callback) =>
      callback(mocks.transactionClient),
    );

    mocks.ensureAccess.mockResolvedValue(undefined);
  });

  it('checks access to the source board before reading the target column', async () => {
    mocks.transactionClient.card.findUnique.mockResolvedValueOnce(movedCard);

    mocks.ensureAccess.mockRejectedValueOnce(
      new ForbiddenError('No access to this board'),
    );

    await expect(
      cardsService.moveCard('user-1', {
        cardId: movedCard.id,
        toColumnId: 'column-target',
        order: 0,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(mocks.ensureAccess).toHaveBeenCalledWith(
      'user-1',
      'board-1',
      mocks.transactionClient,
    );

    expect(mocks.transactionClient.column.findUnique).not.toHaveBeenCalled();
    expect(mocks.transactionClient.card.update).not.toHaveBeenCalled();
    expect(mocks.cardMoved).not.toHaveBeenCalled();
  });

  it('does not allow moving cards between different boards', async () => {
    mocks.transactionClient.card.findUnique.mockResolvedValueOnce(movedCard);

    mocks.transactionClient.column.findUnique.mockResolvedValue({
      id: 'column-target',
      boardId: 'board-2',
    });

    await expect(
      cardsService.moveCard('user-1', {
        cardId: movedCard.id,
        toColumnId: 'column-target',
        order: 0,
      }),
    ).rejects.toEqual(
      new BadRequestError('Cards cannot be moved between boards'),
    );

    expect(mocks.ensureAccess).toHaveBeenNthCalledWith(
      1,
      'user-1',
      'board-1',
      mocks.transactionClient,
    );

    expect(mocks.ensureAccess).toHaveBeenNthCalledWith(
      2,
      'user-1',
      'board-2',
      mocks.transactionClient,
    );

    expect(mocks.transactionClient.card.update).not.toHaveBeenCalled();
    expect(mocks.cardMoved).not.toHaveBeenCalled();
  });

  it('reindexes source and target columns in one transaction', async () => {
    const sourceFirst = card('source-first', 'column-source', 0);
    const sourceLast = card('source-last', 'column-source', 2);
    const targetFirst = card('target-first', 'column-target', 0);
    const targetLast = card('target-last', 'column-target', 1);
    const updatedCard = card(movedCard.id, 'column-target', 1);

    mocks.transactionClient.card.findUnique
      .mockResolvedValueOnce(movedCard)
      .mockResolvedValueOnce(updatedCard);

    mocks.transactionClient.column.findUnique.mockResolvedValue({
      id: 'column-target',
      boardId: 'board-1',
    });

    mocks.transactionClient.card.findMany
      .mockResolvedValueOnce([sourceFirst, movedCard, sourceLast])
      .mockResolvedValueOnce([targetFirst, targetLast]);

    const result = await cardsService.moveCard('user-1', {
      cardId: movedCard.id,
      toColumnId: 'column-target',
      order: 1,
    });

    expect(result).toEqual(updatedCard);
    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.transactionClient.card.update.mock.calls).toEqual([
      [{ where: { id: sourceFirst.id }, data: { order: 0 } }],
      [{ where: { id: sourceLast.id }, data: { order: 1 } }],
      [
        {
          where: { id: targetFirst.id },
          data: {
            columnId: 'column-target',
            order: 0,
          },
        },
      ],
      [
        {
          where: { id: movedCard.id },
          data: {
            columnId: 'column-target',
            order: 1,
          },
        },
      ],
      [
        {
          where: { id: targetLast.id },
          data: {
            columnId: 'column-target',
            order: 2,
          },
        },
      ],
    ]);

    expect(mocks.cardMoved).toHaveBeenCalledWith('board-1', {
      card: updatedCard,
      fromColumnId: 'column-source',
      toColumnId: 'column-target',
    });
  });

  it('reorders cards inside the same column', async () => {
    const firstCard = card('first-card', 'column-source', 0);
    const lastCard = card('last-card', 'column-source', 2);
    const updatedCard = card(movedCard.id, 'column-source', 2);

    mocks.transactionClient.card.findUnique
      .mockResolvedValueOnce(movedCard)
      .mockResolvedValueOnce(updatedCard);

    mocks.transactionClient.column.findUnique.mockResolvedValue({
      id: 'column-source',
      boardId: 'board-1',
    });

    mocks.transactionClient.card.findMany.mockResolvedValueOnce([
      firstCard,
      movedCard,
      lastCard,
    ]);

    const result = await cardsService.moveCard('user-1', {
      cardId: movedCard.id,
      toColumnId: 'column-source',
      order: 2,
    });

    expect(result).toEqual(updatedCard);
    expect(mocks.transactionClient.card.findMany).toHaveBeenCalledTimes(1);

    expect(mocks.transactionClient.card.update.mock.calls).toEqual([
      [
        {
          where: { id: firstCard.id },
          data: {
            columnId: 'column-source',
            order: 0,
          },
        },
      ],
      [
        {
          where: { id: lastCard.id },
          data: {
            columnId: 'column-source',
            order: 1,
          },
        },
      ],
      [
        {
          where: { id: movedCard.id },
          data: {
            columnId: 'column-source',
            order: 2,
          },
        },
      ],
    ]);
  });

  it('rejects a target position outside the destination column', async () => {
    mocks.transactionClient.card.findUnique.mockResolvedValueOnce(movedCard);

    mocks.transactionClient.column.findUnique.mockResolvedValue({
      id: 'column-target',
      boardId: 'board-1',
    });

    mocks.transactionClient.card.findMany
      .mockResolvedValueOnce([movedCard])
      .mockResolvedValueOnce([card('target-card', 'column-target', 0)]);

    await expect(
      cardsService.moveCard('user-1', {
        cardId: movedCard.id,
        toColumnId: 'column-target',
        order: 2,
      }),
    ).rejects.toEqual(new BadRequestError('Invalid target position'));

    expect(mocks.transactionClient.card.update).not.toHaveBeenCalled();
    expect(mocks.cardMoved).not.toHaveBeenCalled();
  });
});
