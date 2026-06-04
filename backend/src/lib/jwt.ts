import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../env.js';

type JwtPayload = {
  sub: string;
  email: string;
};

export function signToken(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}
