import { api } from './api';

export interface Card {
  id: string;
  columnId: string;
  title: string;
  order: number;
}

export const cardsApi = {
  async list(columnId: string): Promise<Card[]> {
    const response = await api.get(`/cards/${columnId}`);

    return response.data;
  },

  async create(columnId: string, title: string, order: number): Promise<Card> {
    const response = await api.post('/cards', {
      columnId,
      title,
      order,
    });

    return response.data;
  },

  async delete(cardId: string) {
    await api.delete(`/cards/${cardId}`);
  },

  async move(cardId: string, toColumnId: string, order: number): Promise<Card> {
    const response = await api.patch<Card>('/cards/move', {
      cardId,
      toColumnId,
      order,
    });

    return response.data;
  },
};
