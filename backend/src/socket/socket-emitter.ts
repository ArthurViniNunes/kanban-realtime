import { getSocketServer } from './socket-instance.js';
import type {
  BoardMemberAddedPayload,
  BoardMemberRemovedPayload,
  BoardMemberRoleUpdatedPayload,
  CardDeletedPayload,
  CardMovedPayload,
  ColumnDeletedPayload,
  RealtimeCard,
  RealtimeColumn,
} from './socket-contracts.js';

export class SocketEmitter {
  static cardMoved(boardId: string, payload: CardMovedPayload) {
    getSocketServer().to(boardId).emit('card:moved', payload);
  }

  static cardCreated(boardId: string, payload: RealtimeCard) {
    getSocketServer().to(boardId).emit('card:created', payload);
  }

  static cardDeleted(boardId: string, payload: CardDeletedPayload) {
    getSocketServer().to(boardId).emit('card:deleted', payload);
  }

  static columnCreated(boardId: string, payload: RealtimeColumn) {
    getSocketServer().to(boardId).emit('column:created', payload);
  }

  static columnDeleted(boardId: string, payload: ColumnDeletedPayload) {
    getSocketServer().to(boardId).emit('column:deleted', payload);
  }

  static memberAdded(boardId: string, payload: BoardMemberAddedPayload) {
    getSocketServer().to(boardId).emit('member:added', payload);
  }

  static memberRoleUpdated(
    boardId: string,
    payload: BoardMemberRoleUpdatedPayload,
  ) {
    getSocketServer().to(boardId).emit('member:role-updated', payload);
  }

  static async memberRemoved(
    boardId: string,
    payload: BoardMemberRemovedPayload,
  ) {
    const io = getSocketServer();

    /*
     * Primeiro notificamos todos, inclusive o usuário removido,
     * enquanto ele ainda está na sala.
     */
    io.to(boardId).emit('member:removed', payload);

    const connectedSockets = await io.in(boardId).fetchSockets();

    const revokedSockets = connectedSockets.filter(
      (connectedSocket) => connectedSocket.data.user?.sub === payload.userId,
    );

    await Promise.all(
      revokedSockets.map(async (revokedSocket) => {
        revokedSocket.emit('board:access-revoked', { boardId });
        await revokedSocket.leave(boardId);
      }),
    );

    /*
     * Recalcula a presença somente depois de retirar todas as
     * conexões pertencentes ao usuário removido.
     */
    const remainingSockets = await io.in(boardId).fetchSockets();

    const users = Array.from(
      new Set(
        remainingSockets
          .map((connectedSocket) => connectedSocket.data.user?.sub)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );

    io.to(boardId).emit('presence:update', {
      boardId,
      users,
    });
  }
}
