import { env } from '../../env.js';
import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcrypt';
import { signToken } from '../../lib/jwt.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../errors/http-errors.js';

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new UnauthorizedError('Account has been deleted');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      auth: {
        accessToken: token,
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestError('User already deleted');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
