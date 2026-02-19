import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Map page stats: EE completion counts, unique players, top round.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const easterEggStats = await prisma.easterEggLog.groupBy({
      by: ['easterEggId'],
      where: { mapId: map.id },
      _count: { userId: true },
    });

    const easterEggCompletions: Record<string, number> = {};
    for (const stat of easterEggStats) {
      const uniqueUsers = await prisma.easterEggLog.findMany({
        where: {
          mapId: map.id,
          easterEggId: stat.easterEggId,
        },
        distinct: ['userId'],
        select: { userId: true },
      });
      easterEggCompletions[stat.easterEggId] = uniqueUsers.length;
    }

    const [challengeUsers, eeUsers] = await Promise.all([
      prisma.challengeLog.findMany({
        where: { mapId: map.id },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.easterEggLog.findMany({
        where: { mapId: map.id, roundCompleted: { not: null } },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);
    const uniquePlayerIds = new Set([
      ...challengeUsers.map((u) => u.userId),
      ...eeUsers.map((u) => u.userId),
    ]);

    const [highestFromChallenges, highestFromEE] = await Promise.all([
      prisma.challengeLog.findFirst({
        where: { mapId: map.id },
        orderBy: { roundReached: 'desc' },
        select: { roundReached: true },
      }),
      prisma.easterEggLog.findFirst({
        where: { mapId: map.id, roundCompleted: { not: null } },
        orderBy: { roundCompleted: 'desc' },
        select: { roundCompleted: true },
      }),
    ]);

    const highestRound = Math.max(
      highestFromChallenges?.roundReached ?? 0,
      highestFromEE?.roundCompleted ?? 0
    );

    return NextResponse.json({
      easterEggCompletions,
      totalPlayers: uniquePlayerIds.size,
      highestRound,
    });
  } catch (error) {
    console.error('Error fetching map stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
