import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 300;

// List games with map count for filters and nav.
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { maps: true },
        },
      },
    });

    return NextResponse.json(games, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
