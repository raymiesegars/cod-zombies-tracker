import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_URL for runtime. Must use your provider's connection pooler URL to avoid "Max client connections reached".
// Supabase: use Connection pooling URI (port 6543). Neon: use the pooler endpoint. Each serverless instance uses 1 connection.
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  let out = url;
  if (!url.includes('pgbouncer=true')) out = `${out}${sep}pgbouncer=true`;
  if (!out.includes('connection_limit=')) out = `${out}${out.includes('?') ? '&' : '?'}connection_limit=1`;
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
