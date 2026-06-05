import { api } from './api';

export interface Board {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export const boardsApi = {
  async list(): Promise<Board[]> {
    const response = await api.get('/boards');

    return response.data;
  },

  async create(title: string): Promise<Board> {
    const response = await api.post('/boards', {
      title,
    });

    return response.data;
  },

  async delete(boardId: string) {
    await api.delete(`/boards/${boardId}`);
  },
};
