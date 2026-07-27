import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket-contracts.js';

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let socketServer: SocketServer | null = null;

export function setSocketServer(server: SocketServer) {
  socketServer = server;
}

export function getSocketServer(): SocketServer {
  if (!socketServer) {
    throw new Error('Socket.IO server has not been initialized');
  }

  return socketServer;
}
