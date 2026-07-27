export interface RealtimeCard {
  id: string;
  columnId: string;
  title: string;
  order: number;
}

export interface RealtimeColumn {
  id: string;
  boardId: string;
  title: string;
  order: number;
  cards: RealtimeCard[];
}

export interface CardMovedPayload {
  card: RealtimeCard;
  fromColumnId: string;
  toColumnId: string;
}

export interface CardDeletedPayload {
  cardId: string;
  columnId: string;
}

export interface ColumnDeletedPayload {
  columnId: string;
}

export interface PresenceUpdatedPayload {
  boardId: string;
  users: string[];
}

export interface BoardSyncPayload {
  boardId: string;
  title: string;
  columns: RealtimeColumn[];
}

export type BoardSyncResponse =
  | BoardSyncPayload
  | {
      error: string;
    };

export interface ServerToClientEvents {
  'card:moved': (payload: CardMovedPayload) => void;
  'card:created': (payload: RealtimeCard) => void;
  'card:deleted': (payload: CardDeletedPayload) => void;
  'column:created': (payload: RealtimeColumn) => void;
  'column:deleted': (payload: ColumnDeletedPayload) => void;
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

export interface InterServerEvents {}

export interface SocketUser {
  sub: string;
  email: string;
}

export interface SocketData {
  user?: SocketUser;
}
