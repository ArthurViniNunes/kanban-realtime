import { prisma } from '../../lib/prisma.js';

export class BoardsService {
  async createBoard(userId: string, title: string) {
    const board = await prisma.board.create({
      data: {
        title,
        userId,
      },
    });

    return board;
  }

  async listBoards(userId: string) {
    return prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
