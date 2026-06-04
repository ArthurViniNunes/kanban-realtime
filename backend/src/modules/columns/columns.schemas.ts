import { z } from 'zod';

export const createColumnSchema = z.object({
  boardId: z.string(),
  title: z.string().min(1).max(40),
  order: z.number().int().nonnegative(),
});
