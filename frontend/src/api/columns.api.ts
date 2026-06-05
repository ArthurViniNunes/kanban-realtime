import { api } from './api';

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
}

export const columnsApi = {
  async list(boardId: string): Promise<Column[]> {
    const response = await api.get(`/columns/${boardId}`);

    return response.data;
  },

  async create(boardId: string, title: string, order: number) {
    const response = await api.post('/columns', {
      boardId,
      title,
      order,
    });

    return response.data;
  },

  async delete(columnId: string) {
    await api.delete(`/columns/${columnId}`);
  },
};
