import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';

const mocks = vi.hoisted(() => ({
  ensureAccess: vi.fn(),
  ensureOwner: vi.fn(),
  ensureCanManageMembers: vi.fn(),

  findUser: vi.fn(),
  findManyMembers: vi.fn(),
  findMember: vi.fn(),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),

  memberAdded: vi.fn(),
  memberRoleUpdated: vi.fn(),
  memberRemoved: vi.fn(),
}));

vi.mock('../../lib/access/board-access.js', () => ({
  boardAccess: {
    ensureAccess: mocks.ensureAccess,
    ensureOwner: mocks.ensureOwner,
    ensureCanManageMembers: mocks.ensureCanManageMembers,
  },
}));

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    user: {
      findFirst: mocks.findUser,
    },
    boardMember: {
      findMany: mocks.findManyMembers,
      findUnique: mocks.findMember,
      create: mocks.createMember,
      update: mocks.updateMember,
      delete: mocks.deleteMember,
    },
  },
}));

vi.mock('../../socket/socket-emitter.js', () => ({
  SocketEmitter: {
    memberAdded: mocks.memberAdded,
    memberRoleUpdated: mocks.memberRoleUpdated,
    memberRemoved: mocks.memberRemoved,
  },
}));

import { boardMembersService } from './board-members.service.js';

const ownerActor = {
  id: 'owner-membership',
  userId: 'owner-user',
  boardId: 'board-1',
  role: 'owner' as const,
};

const adminActor = {
  id: 'admin-membership',
  userId: 'admin-user',
  boardId: 'board-1',
  role: 'admin' as const,
};

const createdMember = {
  id: 'membership-1',
  role: 'member' as const,
  user: {
    id: 'member-user',
    name: 'Member User',
    email: 'member@example.com',
  },
};

describe('BoardMembersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMembers', () => {
    it('lists members ordered by role and name', async () => {
      mocks.ensureAccess.mockResolvedValue(undefined);

      mocks.findManyMembers.mockResolvedValue([
        {
          id: 'member-2',
          role: 'member',
          user: {
            id: 'user-2',
            name: 'Zoe',
            email: 'zoe@example.com',
          },
        },
        {
          id: 'admin-1',
          role: 'admin',
          user: {
            id: 'user-3',
            name: 'Bruno',
            email: 'bruno@example.com',
          },
        },
        {
          id: 'owner-1',
          role: 'owner',
          user: {
            id: 'user-1',
            name: 'Arthur',
            email: 'arthur@example.com',
          },
        },
        {
          id: 'member-1',
          role: 'member',
          user: {
            id: 'user-4',
            name: 'Ana',
            email: 'ana@example.com',
          },
        },
      ]);

      const result = await boardMembersService.listMembers('user-1', 'board-1');

      expect(mocks.ensureAccess).toHaveBeenCalledWith('user-1', 'board-1');

      expect(result.map((member) => member.id)).toEqual([
        'owner-1',
        'admin-1',
        'member-1',
        'member-2',
      ]);
    });
  });

  describe('addMember', () => {
    it('allows an owner to add an admin and emits the event', async () => {
      const adminMember = {
        ...createdMember,
        role: 'admin' as const,
      };

      mocks.ensureCanManageMembers.mockResolvedValue(ownerActor);
      mocks.findUser.mockResolvedValue({ id: 'member-user' });
      mocks.createMember.mockResolvedValue(adminMember);

      const result = await boardMembersService.addMember(
        'owner-user',
        'board-1',
        {
          email: 'member@example.com',
          role: 'admin',
        },
      );

      expect(result).toEqual(adminMember);

      expect(mocks.createMember).toHaveBeenCalledWith({
        data: {
          boardId: 'board-1',
          userId: 'member-user',
          role: 'admin',
        },
        select: expect.any(Object),
      });

      expect(mocks.memberAdded).toHaveBeenCalledWith('board-1', {
        boardId: 'board-1',
        member: adminMember,
      });
    });

    it('allows an admin to add an ordinary member', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(adminActor);
      mocks.findUser.mockResolvedValue({ id: 'member-user' });
      mocks.createMember.mockResolvedValue(createdMember);

      await expect(
        boardMembersService.addMember('admin-user', 'board-1', {
          email: 'member@example.com',
          role: 'member',
        }),
      ).resolves.toEqual(createdMember);

      expect(mocks.memberAdded).toHaveBeenCalledOnce();
    });

    it('rejects an admin trying to add another admin', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(adminActor);

      await expect(
        boardMembersService.addMember('admin-user', 'board-1', {
          email: 'member@example.com',
          role: 'admin',
        }),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Admins can only add members',
      });

      expect(mocks.findUser).not.toHaveBeenCalled();
      expect(mocks.memberAdded).not.toHaveBeenCalled();
    });

    it('rejects an email that does not belong to an active user', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(ownerActor);
      mocks.findUser.mockResolvedValue(null);

      await expect(
        boardMembersService.addMember('owner-user', 'board-1', {
          email: 'missing@example.com',
          role: 'member',
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });

      expect(mocks.createMember).not.toHaveBeenCalled();
      expect(mocks.memberAdded).not.toHaveBeenCalled();
    });

    it('maps a duplicate membership to conflict', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(ownerActor);
      mocks.findUser.mockResolvedValue({ id: 'member-user' });

      mocks.createMember.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.8.0',
          meta: {
            target: ['userId', 'boardId'],
          },
        }),
      );

      await expect(
        boardMembersService.addMember('owner-user', 'board-1', {
          email: 'member@example.com',
          role: 'member',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'User is already a board member',
      });

      expect(mocks.memberAdded).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('allows the owner to update a role and emits the event', async () => {
      const targetMembership = {
        id: 'membership-1',
        userId: 'member-user',
        boardId: 'board-1',
        role: 'member',
      };

      const updatedMember = {
        ...createdMember,
        role: 'admin' as const,
      };

      mocks.ensureOwner.mockResolvedValue(undefined);
      mocks.findMember.mockResolvedValue(targetMembership);
      mocks.updateMember.mockResolvedValue(updatedMember);

      const result = await boardMembersService.updateMemberRole(
        'owner-user',
        'board-1',
        'membership-1',
        {
          role: 'admin',
        },
      );

      expect(result).toEqual(updatedMember);

      expect(mocks.memberRoleUpdated).toHaveBeenCalledWith('board-1', {
        boardId: 'board-1',
        member: updatedMember,
      });
    });

    it('does not allow changing the owner role', async () => {
      mocks.ensureOwner.mockResolvedValue(undefined);

      mocks.findMember.mockResolvedValue({
        id: 'owner-membership',
        userId: 'owner-user',
        boardId: 'board-1',
        role: 'owner',
      });

      await expect(
        boardMembersService.updateMemberRole(
          'owner-user',
          'board-1',
          'owner-membership',
          {
            role: 'member',
          },
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Board owner role cannot be changed',
      });

      expect(mocks.updateMember).not.toHaveBeenCalled();
      expect(mocks.memberRoleUpdated).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('allows the owner to remove an admin and revokes access', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(ownerActor);

      mocks.findMember.mockResolvedValue({
        id: 'membership-1',
        userId: 'admin-user',
        boardId: 'board-1',
        role: 'admin',
      });

      mocks.deleteMember.mockResolvedValue({
        id: 'membership-1',
      });

      const result = await boardMembersService.removeMember(
        'owner-user',
        'board-1',
        'membership-1',
      );

      expect(result).toEqual({ success: true });

      expect(mocks.memberRemoved).toHaveBeenCalledWith('board-1', {
        boardId: 'board-1',
        memberId: 'membership-1',
        userId: 'admin-user',
      });
    });

    it('allows an admin to remove an ordinary member', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(adminActor);

      mocks.findMember.mockResolvedValue({
        id: 'membership-1',
        userId: 'member-user',
        boardId: 'board-1',
        role: 'member',
      });

      mocks.deleteMember.mockResolvedValue({
        id: 'membership-1',
      });

      await expect(
        boardMembersService.removeMember(
          'admin-user',
          'board-1',
          'membership-1',
        ),
      ).resolves.toEqual({ success: true });

      expect(mocks.memberRemoved).toHaveBeenCalledOnce();
    });

    it('does not allow an admin to remove another admin', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(adminActor);

      mocks.findMember.mockResolvedValue({
        id: 'membership-1',
        userId: 'other-admin',
        boardId: 'board-1',
        role: 'admin',
      });

      await expect(
        boardMembersService.removeMember(
          'admin-user',
          'board-1',
          'membership-1',
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Admins can only remove members',
      });

      expect(mocks.deleteMember).not.toHaveBeenCalled();
      expect(mocks.memberRemoved).not.toHaveBeenCalled();
    });

    it('does not allow removing the board owner', async () => {
      mocks.ensureCanManageMembers.mockResolvedValue(ownerActor);

      mocks.findMember.mockResolvedValue({
        id: 'owner-membership',
        userId: 'owner-user',
        boardId: 'board-1',
        role: 'owner',
      });

      await expect(
        boardMembersService.removeMember(
          'owner-user',
          'board-1',
          'owner-membership',
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Board owner cannot be removed',
      });

      expect(mocks.deleteMember).not.toHaveBeenCalled();
      expect(mocks.memberRemoved).not.toHaveBeenCalled();
    });
  });
});
