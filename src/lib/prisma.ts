import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL (pooled) for runtime. DIRECT_URL is for migrations only.
// connection_limit: with limit=1, concurrent requests in the same serverless instance queue for one connection and timeout (P2024).
// Use a small pool per instance (e.g. 5) so profile/me/notifications/messages/poll/mystery-box can run in parallel.
// The database pooler (Supabase Supavisor, Neon, etc.) multiplexes these; set DATABASE_URL to your pooler URL.
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  let out = url;
  if (!url.includes('pgbouncer=true')) out = `${out}${sep}pgbouncer=true`;
  if (!out.includes('connection_limit=')) out = `${out}${out.includes('?') ? '&' : '?'}connection_limit=5`;
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
