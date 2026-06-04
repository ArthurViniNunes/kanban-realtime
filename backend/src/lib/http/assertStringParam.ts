import { BadRequestError } from '../../errors/http-errors.js';

export function assertStringParam(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(`Invalid param: ${fieldName}`);
  }

  return value.trim();
}
