import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL for runtime. Must use pooler URL (Supabase port 6543, Neon pooler) so multiple connections per instance don't exhaust DB.
// Default 3 connections per instance so concurrent requests don't queue and timeout (P2024). We override any connection_limit in the URL.
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  const limit = process.env.DATABASE_CONNECTION_LIMIT ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10) : 3;
  const connectionLimit = Number.isNaN(limit) || limit < 1 ? 3 : Math.min(limit, 10);
  let out = url
    .replace(/&connection_limit=\d+/g, '')
    .replace(/\?connection_limit=\d+&?/, '?')
    .replace(/\?connection_limit=\d+$/, '');
  if (out.endsWith('?')) out = out.slice(0, -1);
  const sep = out.includes('?') ? '&' : '?';
  if (!out.includes('pgbouncer=true')) out = `${out}${sep}pgbouncer=true`;
  out = `${out}${out.includes('?') ? '&' : '?'}connection_limit=${connectionLimit}`;
  if (!out.includes('connect_timeout=')) out = `${out}&connect_timeout=15`;
  if (!out.includes('pool_timeout=')) out = `${out}&pool_timeout=20`;
  return out;
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
