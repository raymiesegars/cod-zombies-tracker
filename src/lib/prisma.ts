import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL (pooled) for runtime so serverless/build can reach DB.
// DIRECT_URL is only for Prisma migrations in schema.prisma; do not use it for the client.
// connection_limit=1: critical for Vercel serverless — each instance uses 1 connection instead of 5, avoiding pool exhaustion when many logged-in users hit profile/friends/notifications/messages/heartbeat in parallel.
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  let out = url;
  if (!url.includes('pgbouncer=true')) out = `${out}${sep}pgbouncer=true`;
  if (!out.includes('connection_limit=')) out = `${out}${out.includes('?') ? '&' : '?'}connection_limit=1`;
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
