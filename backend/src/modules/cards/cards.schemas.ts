import { z } from 'zod';

export const createCardSchema = z.object({
  columnId: z.string(),
  title: z.string().min(1).max(80),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
});

export const moveCardSchema = z.object({
  cardId: z.string(),
  toColumnId: z.string(),
  order: z.number().int().nonnegative(),
});
