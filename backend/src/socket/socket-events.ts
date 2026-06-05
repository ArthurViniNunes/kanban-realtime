import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';

export function registerSocketEvents(io: Server) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.sub;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log('User connected:', userId);

    /**
     * JOIN BOARD ROOM
     */
    socket.on('board:join', async (boardId: string) => {
      const member = await prisma.boardMember.findFirst({
        where: {
          userId,
          boardId,
        },
      });

      if (!member) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      socket.join(boardId);
    });

    /**
     * LEAVE BOARD ROOM
     */
    socket.on('board:leave', (boardId: string) => {
      socket.leave(boardId);
    });

    /**
     * BOARD SNAPSHOT (INITIAL LOAD)
     */
    socket.on('board:sync', async (boardId: string, callback) => {
      try {
        const member = await prisma.boardMember.findFirst({
          where: {
            userId,
            boardId,
          },
        });

        if (!member) {
          return callback({ error: 'Unauthorized' });
        }

        const board = await prisma.board.findUnique({
          where: { id: boardId },
          include: {
            columns: {
              orderBy: { order: 'asc' },
              include: {
                cards: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        });

        if (!board) {
          return callback({ error: 'Board not found' });
        }

        return callback({
          boardId: board.id,
          title: board.title,
          columns: board.columns,
        });
      } catch {
        return callback({ error: 'Failed to sync board' });
      }
    });

    /**
     * OPTIONAL: DEBUG EVENT
     */
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
}
