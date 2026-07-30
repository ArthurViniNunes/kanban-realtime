import { prisma } from '../lib/prisma.js';
import type { AppSocket, SocketServer } from './socket-instance.js';

export function registerSocketEvents(io: SocketServer) {
  async function emitPresence(boardId: string) {
    try {
      const connectedSockets = await io.in(boardId).fetchSockets();

      const users = Array.from(
        new Set(
          connectedSockets
            .map((connectedSocket) => connectedSocket.data.user?.sub)
            .filter((userId): userId is string => Boolean(userId)),
        ),
      );

      io.to(boardId).emit('presence:update', {
        boardId,
        users,
      });
    } catch (error) {
      console.error('Failed to update board presence:', error);
    }
  }

  io.on('connection', (socket: AppSocket) => {
    const userId = socket.data.user?.sub;
    const joinedBoards = new Set<string>();

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log('User connected:', userId);

    /**
     * JOIN BOARD ROOM
     */
    socket.on('board:join', async (boardId: string) => {
      const member = await prisma.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId,
            boardId,
          },
        },
      });

      if (!member) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      await socket.join(boardId);
      joinedBoards.add(boardId);
      await emitPresence(boardId);
    });

    /**
     * LEAVE BOARD ROOM
     */
    socket.on('board:leave', async (boardId: string) => {
      await socket.leave(boardId);
      joinedBoards.delete(boardId);
      await emitPresence(boardId);
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
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
              include: {
                cards: {
                  orderBy: [{ order: 'asc' }, { id: 'asc' }],
                },
              },
            },
            members: {
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        if (!board) {
          return callback({ error: 'Board not found' });
        }

        const roleOrder = {
          owner: 0,
          admin: 1,
          member: 2,
        } as const;

        const members = board.members.sort(
          (left, right) =>
            roleOrder[left.role] - roleOrder[right.role] ||
            left.user.name.localeCompare(right.user.name),
        );

        return callback({
          boardId: board.id,
          title: board.title,
          columns: board.columns,
          members,
        });
      } catch {
        return callback({ error: 'Failed to sync board' });
      }
    });

    /**
     * DISCONNECT LOGIC
     */
    socket.on('disconnect', () => {
      for (const boardId of joinedBoards) {
        void emitPresence(boardId);
      }

      joinedBoards.clear();
    });

    /**
     * OPTIONAL: DEBUG EVENT
     */
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
}
