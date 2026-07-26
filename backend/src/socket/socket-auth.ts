import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http-errors.js';
import { env } from '../env.js';

type JwtPayload = {
  sub: string;
  email: string;
};

export function socketAuthMiddleware() {
  return (socket: any, next: any) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      socket.data.user = decoded;

      return next();
    } catch {
      return next(new UnauthorizedError('Unauthorized'));
    }
  };
}
