import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET: Global trophy counts per user. Query: sort=gold|silver|bronze (default gold). Returns list of { user, gold, silver, bronze } sorted by chosen type desc. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'gold';
    const validSort = ['gold', 'silver', 'bronze'].includes(sort) ? sort : 'gold';

    const trophies = await prisma.tournamentTrophy.findMany({
      select: {
        userId: true,
        place: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
          },
        },
      },
    });

    const byUser = new Map<
      string,
      { user: (typeof trophies)[0]['user']; gold: number; silver: number; bronze: number }
    >();
    for (const t of trophies) {
      const u = byUser.get(t.userId) ?? {
        user: t.user,
        gold: 0,
        silver: 0,
        bronze: 0,
      };
      if (t.place === 1) u.gold++;
      else if (t.place === 2) u.silver++;
      else if (t.place === 3) u.bronze++;
      byUser.set(t.userId, u);
    }

    let list = Array.from(byUser.values());
    if (validSort === 'gold') list.sort((a, b) => b.gold - a.gold);
    else if (validSort === 'silver') list.sort((a, b) => b.silver - a.silver);
    else list.sort((a, b) => b.bronze - a.bronze);

    return NextResponse.json({ entries: list, sort: validSort });
  } catch (error) {
    console.error('Error fetching trophy leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
