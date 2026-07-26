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

  PORT: z.coerce.number().int().min(1).max(65535).default(3333),

  API_PUBLIC_URL: z.url().default('http://localhost:3333'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.url()).min(1)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
