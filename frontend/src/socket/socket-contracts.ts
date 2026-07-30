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
      members: RealtimeBoardMember[];
    }
  | {
      error: string;
    };

export interface RealtimeBoardMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface RealtimeBoardMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user: RealtimeBoardMemberUser;
}

export interface BoardMemberAddedPayload {
  boardId: string;
  member: RealtimeBoardMember;
}

export interface BoardMemberRoleUpdatedPayload {
  boardId: string;
  member: RealtimeBoardMember;
}

export interface BoardMemberRemovedPayload {
  boardId: string;
  memberId: string;
  userId: string;
}

export interface BoardAccessRevokedPayload {
  boardId: string;
}

export interface ServerToClientEvents {
  'card:moved': (payload: CardMovedPayload) => void;
  'card:created': (payload: Card) => void;
  'card:deleted': (payload: CardDeletedPayload) => void;
  'column:created': (payload: Column) => void;
  'column:deleted': (payload: { columnId: string }) => void;
  'presence:update': (payload: PresenceUpdatedPayload) => void;
  'member:added': (payload: BoardMemberAddedPayload) => void;

  'member:role-updated': (payload: BoardMemberRoleUpdatedPayload) => void;

  'member:removed': (payload: BoardMemberRemovedPayload) => void;

  'board:access-revoked': (payload: BoardAccessRevokedPayload) => void;
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
