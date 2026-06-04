import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().min(3).max(50),
});
