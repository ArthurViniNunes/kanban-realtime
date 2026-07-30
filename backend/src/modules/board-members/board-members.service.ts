import { Prisma } from '../../generated/prisma/client.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/http-errors.js';
import { boardAccess } from '../../lib/access/board-access.js';
import { prisma } from '../../lib/prisma.js';
import type {
  AddBoardMemberInput,
  UpdateBoardMemberRoleInput,
} from './board-members.schemas.js';
import { SocketEmitter } from '../../socket/socket-emitter.js';

const memberSelect = {
  id: true,
  role: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

class BoardMembersService {
  async listMembers(userId: string, boardId: string) {
    await boardAccess.ensureAccess(userId, boardId);

    const members = await prisma.boardMember.findMany({
      where: {
        boardId,
      },
      select: memberSelect,
    });

    const roleOrder = {
      owner: 0,
      admin: 1,
      member: 2,
    } as const;

    return members.sort(
      (left, right) =>
        roleOrder[left.role] - roleOrder[right.role] ||
        left.user.name.localeCompare(right.user.name),
    );
  }

  async addMember(userId: string, boardId: string, data: AddBoardMemberInput) {
    const actor = await boardAccess.ensureCanManageMembers(userId, boardId);

    if (actor.role === 'admin' && data.role !== 'member') {
      throw new ForbiddenError('Admins can only add members');
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: data.email,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    try {
      const member = await prisma.boardMember.create({
        data: {
          boardId,
          userId: targetUser.id,
          role: data.role,
        },
        select: memberSelect,
      });

      SocketEmitter.memberAdded(boardId, {
        boardId,
        member,
      });

      return member;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictError('User is already a board member');
      }

      throw error;
    }
  }

  async updateMemberRole(
    userId: string,
    boardId: string,
    memberId: string,
    data: UpdateBoardMemberRoleInput,
  ) {
    await boardAccess.ensureOwner(userId, boardId);

    const targetMembership = await prisma.boardMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!targetMembership || targetMembership.boardId !== boardId) {
      throw new NotFoundError('Board member not found');
    }

    if (targetMembership.role === 'owner') {
      throw new ForbiddenError('Board owner role cannot be changed');
    }

    const member = await prisma.boardMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: data.role,
      },
      select: memberSelect,
    });

    SocketEmitter.memberRoleUpdated(boardId, {
      boardId,
      member,
    });

    return member;
  }

  async removeMember(userId: string, boardId: string, memberId: string) {
    const actor = await boardAccess.ensureCanManageMembers(userId, boardId);

    const targetMembership = await prisma.boardMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!targetMembership || targetMembership.boardId !== boardId) {
      throw new NotFoundError('Board member not found');
    }

    if (targetMembership.role === 'owner') {
      throw new ForbiddenError('Board owner cannot be removed');
    }

    if (actor.role === 'admin' && targetMembership.role !== 'member') {
      throw new ForbiddenError('Admins can only remove members');
    }

    await prisma.boardMember.delete({
      where: {
        id: memberId,
      },
    });

    await SocketEmitter.memberRemoved(boardId, {
      boardId,
      memberId,
      userId: targetMembership.userId,
    });

    return {
      success: true,
    };
  }
}

export const boardMembersService = new BoardMembersService();
