import { Prisma } from '../generated/prisma/client';

// Prisma error codes used by the services
export const UNIQUE_VIOLATION = 'P2002';
export const FOREIGN_KEY_VIOLATION = 'P2003';

export function isPrismaError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}
