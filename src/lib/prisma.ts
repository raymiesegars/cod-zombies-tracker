import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL as-is from env (no URL modification). Ensure Vercel uses your pooler URL (e.g. Supabase port 6543).
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;
