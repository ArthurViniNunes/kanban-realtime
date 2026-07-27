import type { Card } from '@/api/cards.api';
import type { Column } from '@/api/columns.api';

export interface CardMovedPayload {
  card: Card;
  fromColumnId: string;
  toColumnId: string;
}

export interface CardDeletedPayload {
  cardId: string;
  columnId: string;
}

export interface PresenceUpdatedPayload {
  boardId: string;
  users: string[];
}

export type BoardSyncResponse =
  | {
      boardId: string;
      title: string;
      columns: Column[];
    }
  | {
      error: string;
    };

export interface ServerToClientEvents {
  'card:moved': (payload: CardMovedPayload) => void;
  'card:created': (payload: Card) => void;
  'card:deleted': (payload: CardDeletedPayload) => void;
  'column:created': (payload: Column) => void;
  'column:deleted': (payload: { columnId: string }) => void;
  'presence:update': (payload: PresenceUpdatedPayload) => void;
  error: (payload: { message: string }) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  'board:join': (boardId: string) => void;
  'board:leave': (boardId: string) => void;
  'board:sync': (
    boardId: string,
    callback: (response: BoardSyncResponse) => void,
  ) => void;
  ping: () => void;
}
