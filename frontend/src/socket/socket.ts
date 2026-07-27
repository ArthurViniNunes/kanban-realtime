import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { authService } from '@/services/auth.service';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket-contracts';

const socketUrl = new URL(env.apiBaseUrl).origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  socketUrl,
  {
    autoConnect: false,
  },
);

export function connectSocket(): boolean {
  const token = authService.getToken();

  if (!token) {
    return false;
  }

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return true;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
