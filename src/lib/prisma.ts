import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL for runtime. Use your provider's connection pooler (Supabase port 6543, Neon pooler) so you can
// raise connection_limit for speed without exhausting the DB. With pooler: 2–3 per instance is safe and faster.
// Optional: set DATABASE_CONNECTION_LIMIT=1 in env if you hit "Max client connections" (e.g. no pooler or high traffic).
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  const limit = process.env.DATABASE_CONNECTION_LIMIT ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10) : 3;
  const connectionLimit = Number.isNaN(limit) || limit < 1 ? 3 : Math.min(limit, 10);
  const sep = url.includes('?') ? '&' : '?';
  let out = url;
  if (!url.includes('pgbouncer=true')) out = `${out}${sep}pgbouncer=true`;
  if (!out.includes('connection_limit=')) out = `${out}${out.includes('?') ? '&' : '?'}connection_limit=${connectionLimit}`;
  if (!out.includes('connect_timeout=')) out = `${out}${out.includes('?') ? '&' : '?'}connect_timeout=15`;
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
