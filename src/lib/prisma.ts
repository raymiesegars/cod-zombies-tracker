import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase pooler can mess with prepared statements – use direct URL or pgbouncer mode
function getDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL;
  if (direct) return direct;
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  if (url.includes('pgbouncer=true')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true`;
}

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: { url: databaseUrl },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
