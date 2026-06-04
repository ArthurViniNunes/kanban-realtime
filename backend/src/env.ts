import { z } from 'zod';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url().optional(),
  POOLER_URL: z.url().optional(),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d') as z.ZodType<
    jwt.SignOptions['expiresIn']
  >,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten());
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
