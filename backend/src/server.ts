import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socket/socket-auth.js';
import { registerSocketEvents } from './socket/socket-events.js';
import { env } from './env.js';
import { setSocketServer } from './socket/socket-instance.js';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket/socket-contracts.js';

const httpServer = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS,
  },
});

setSocketServer(io);

io.use(socketAuthMiddleware());

registerSocketEvents(io);

httpServer.listen(env.PORT, () => {
  console.log(`HTTP + WS running on port ${env.PORT}`);
});
