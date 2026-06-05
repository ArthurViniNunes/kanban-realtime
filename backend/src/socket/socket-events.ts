import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';

export function registerSocketEvents(io: Server) {
  const boardUsers = new Map<string, Set<string>>();
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
        where: { userId, boardId },
      });

      if (!member) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      socket.join(boardId);

      // 👇 PRESENCE LOGIC
      if (!boardUsers.has(boardId)) {
        boardUsers.set(boardId, new Set());
      }

      boardUsers.get(boardId)!.add(userId);

      // broadcast update
      io.to(boardId).emit('presence:update', {
        boardId,
        users: Array.from(boardUsers.get(boardId)!),
      });
    });

    /**
     * LEAVE BOARD ROOM
     */
    socket.on('board:leave', (boardId: string) => {
      socket.leave(boardId);

      const users = boardUsers.get(boardId);

      if (!users) return;

      users.delete(userId);

      if (users.size === 0) {
        boardUsers.delete(boardId);
        return;
      }

      io.to(boardId).emit('presence:update', {
        boardId,
        users: Array.from(users),
      });
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
     * DISCONNECT LOGIC
     */
    socket.on('disconnect', () => {
      for (const [boardId, users] of boardUsers.entries()) {
        if (users.has(userId)) {
          users.delete(userId);

          io.to(boardId).emit('presence:update', {
            boardId,
            users: Array.from(users),
          });

          if (users.size === 0) {
            boardUsers.delete(boardId);
          }
        }
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
