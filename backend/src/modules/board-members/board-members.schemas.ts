import { z } from 'zod';

const manageableRoleSchema = z.enum(['admin', 'member']);

export const addBoardMemberSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .transform((email) => email.toLowerCase()),

    role: manageableRoleSchema.default('member'),
  })
  .strict();

export const updateBoardMemberRoleSchema = z
  .object({
    role: manageableRoleSchema,
  })
  .strict();

export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>;

export type UpdateBoardMemberRoleInput = z.infer<
  typeof updateBoardMemberRoleSchema
>;
