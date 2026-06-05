import { io } from '../server.js';

export class SocketEmitter {
  static cardMoved(boardId: string, payload: any) {
    io.to(boardId).emit('card:moved', payload);
  }

  static cardCreated(boardId: string, payload: any) {
    io.to(boardId).emit('card:created', payload);
  }

  static cardDeleted(boardId: string, payload: any) {
    io.to(boardId).emit('card:deleted', payload);
  }

  static columnCreated(boardId: string, payload: any) {
    io.to(boardId).emit('column:created', payload);
  }

  static columnDeleted(boardId: string, payload: any) {
    io.to(boardId).emit('column:deleted', payload);
  }
}
