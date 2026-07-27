import { getSocketServer } from './socket-instance.js';
import type {
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
}
