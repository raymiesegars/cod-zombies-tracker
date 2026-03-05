import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: 'connected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log briefly; full error is noisy during Vercel build when DB is unavailable
    console.error('[api/health] DB check failed:', message);
    return NextResponse.json(
      { ok: false, database: 'error', error: message },
      { status: 500 }
    );
  }
}
