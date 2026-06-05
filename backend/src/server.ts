import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socket/socket-auth.js';
import { registerSocketEvents } from './socket/socket-events.js';

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.use(socketAuthMiddleware());

registerSocketEvents(io);

httpServer.listen(3333, () => {
  console.log('HTTP + WS running on 3333');
});
