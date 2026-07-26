import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socket/socket-auth.js';
import { registerSocketEvents } from './socket/socket-events.js';
import { env } from './env.js';

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS,
  },
});

io.use(socketAuthMiddleware());

registerSocketEvents(io);

httpServer.listen(env.PORT, () => {
  console.log(`HTTP + WS running on port ${env.PORT}`);
});
