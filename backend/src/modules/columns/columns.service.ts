import { boardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../errors/http-errors.js';
import { SocketEmitter } from '../../socket/socket-emitter.js';

class ColumnsService {
  async createColumn(
    userId: string,
    data: { boardId: string; title: string; order: number },
  ) {
    await boardAccess.ensureAccess(userId, data.boardId);

    const column = await prisma.column.create({
      data,
    });

    SocketEmitter.columnCreated(data.boardId, {
      ...column,
      cards: [],
    });

    return column;
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

    const deletedColumn = await prisma.column.delete({
      where: { id: columnId },
    });

    SocketEmitter.columnDeleted(column.boardId, {
      columnId,
    });

    return deletedColumn;
  }
}

export const columnService = new ColumnsService();
