import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Production-safe health check. Verifies the app can reach the database.
 * Use this to confirm DATABASE_URL is set and working on Vercel (e.g. https://yoursite.com/api/health).
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: 'connected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/health]', error);
    return NextResponse.json(
      { ok: false, database: 'error', error: message },
      { status: 500 }
    );
  }
}
