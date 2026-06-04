import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { prisma } from '../lib/prisma.js';
import { UnauthorizedError } from '../errors/http-errors.js';

type JwtPayload = {
  sub: string;
  email: string;
};

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Missing token'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Invalid token format'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return next(new UnauthorizedError('User not authorized'));
    }

    req.user = decoded;

    return next();
  } catch {
    return next(new UnauthorizedError('Invalid token'));
  }
}
