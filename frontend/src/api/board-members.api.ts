import { api } from './api';

export type BoardRole = 'owner' | 'admin' | 'member';
export type ManageableBoardRole = Exclude<BoardRole, 'owner'>;

export interface BoardMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface BoardMember {
  id: string;
  role: BoardRole;
  user: BoardMemberUser;
}

export interface AddBoardMemberInput {
  email: string;
  role: ManageableBoardRole;
}

export interface UpdateBoardMemberRoleInput {
  role: ManageableBoardRole;
}

export const boardMemberApi = {
  async list(boardId: string): Promise<BoardMember[]> {
    const response = await api.get<BoardMember[]>(`/boards/${boardId}/members`);

    return response.data;
  },

  async add(boardId: string, input: AddBoardMemberInput): Promise<BoardMember> {
    const response = await api.post<BoardMember>(
      `/boards/${boardId}/members`,
      input,
    );

    return response.data;
  },

  async updateRole(
    boardId: string,
    memberId: string,
    input: UpdateBoardMemberRoleInput,
  ): Promise<BoardMember> {
    const response = await api.patch<BoardMember>(
      `/boards/${boardId}/members/${memberId}`,
      input,
    );

    return response.data;
  },

  async remove(boardId: string, memberId: string): Promise<void> {
    await api.delete(`/boards/${boardId}/members/${memberId}`);
  },
};
