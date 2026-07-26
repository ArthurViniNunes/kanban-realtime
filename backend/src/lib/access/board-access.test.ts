import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenError } from '../../errors/http-errors.js';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock('../prisma.js', () => ({
  prisma: {
    boardMember: {
      findUnique: mocks.findUnique,
    },
  },
}));

import { boardAccess } from './board-access.js';

function membership(role: 'owner' | 'admin' | 'member') {
  return {
    id: 'membership-1',
    userId: 'user-1',
    boardId: 'board-1',
    role,
  };
}

describe('BoardAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureAccess', () => {
    it('allows a user with board membership', async () => {
      mocks.findUnique.mockResolvedValueOnce(membership('member'));

      await expect(
        boardAccess.ensureAccess('user-1', 'board-1'),
      ).resolves.toBeUndefined();

      expect(mocks.findUnique).toHaveBeenCalledWith({
        where: {
          userId_boardId: {
            userId: 'user-1',
            boardId: 'board-1',
          },
        },
      });
    });

    it('rejects a user without board membership', async () => {
      mocks.findUnique.mockResolvedValueOnce(null);

      await expect(
        boardAccess.ensureAccess('user-1', 'board-1'),
      ).rejects.toEqual(new ForbiddenError('No access to this board'));
    });
  });

  describe('ensureOwner', () => {
    it('allows the board owner', async () => {
      mocks.findUnique.mockResolvedValueOnce(membership('owner'));

      await expect(
        boardAccess.ensureOwner('user-1', 'board-1'),
      ).resolves.toBeUndefined();
    });

    it.each(['admin', 'member'] as const)(
      'rejects a user with the %s role',
      async (role) => {
        mocks.findUnique.mockResolvedValueOnce(membership(role));

        await expect(
          boardAccess.ensureOwner('user-1', 'board-1'),
        ).rejects.toEqual(new ForbiddenError('Only owner allowed'));
      },
    );

    it('rejects a user without membership', async () => {
      mocks.findUnique.mockResolvedValueOnce(null);

      await expect(
        boardAccess.ensureOwner('user-1', 'board-1'),
      ).rejects.toEqual(new ForbiddenError('Only owner allowed'));
    });
  });
});
