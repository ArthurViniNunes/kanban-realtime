import { api } from './api';
import type { Column } from './columns.api';

export interface Board {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  columns: Column[];
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

  async getById(boardId: string): Promise<Board> {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },
};
