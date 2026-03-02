import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET: List of tournament trophies for this user (for profile block). Returns { gold, silver, bronze, tournaments: [{ tournamentId, title, place, xpAwarded }] }. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const trophies = await prisma.tournamentTrophy.findMany({
      where: { userId: user.id },
      include: {
        tournament: { select: { id: true, title: true } },
      },
      orderBy: { awardedAt: 'desc' },
    });

    const gold = trophies.filter((t) => t.place === 1).length;
    const silver = trophies.filter((t) => t.place === 2).length;
    const bronze = trophies.filter((t) => t.place === 3).length;

    const tournaments = trophies.map((t) => ({
      tournamentId: t.tournamentId,
      title: t.tournament.title,
      place: t.place,
      xpAwarded: t.xpAwarded,
    }));

    return NextResponse.json({
      gold,
      silver,
      bronze,
      tournaments,
    });
  } catch (error) {
    console.error('Error fetching user tournament trophies:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
