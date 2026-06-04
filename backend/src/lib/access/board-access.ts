import { prisma } from '../prisma.js';

export async function getBoardMembership(userId: string, boardId: string) {
  return prisma.boardMember.findFirst({
    where: {
      userId,
      boardId,
    },
  });
}

export async function canAccessBoard(userId: string, boardId: string) {
  const member = await getBoardMembership(userId, boardId);
  return !!member;
}

export async function requireBoardAccess(userId: string, boardId: string) {
  const member = await getBoardMembership(userId, boardId);

  if (!member) {
    throw new Error('Unauthorized');
  }

  return member;
}

export async function requireBoardOwner(userId: string, boardId: string) {
  const member = await getBoardMembership(userId, boardId);

  if (!member || member.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  return member;
}
