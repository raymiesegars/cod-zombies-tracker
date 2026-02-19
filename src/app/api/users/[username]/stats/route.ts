import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import type { UserMapStats } from '@/types';

// Per-map stats (highest round, main EE done) + totals for the profile dashboard.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        challengeLogs: {
          include: {
            challenge: true,
            map: { include: { game: true } },
          },
        },
        easterEggLogs: {
          include: {
            easterEgg: true,
            map: { include: { game: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPublic) {
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const currentUser = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
      });
      if (!currentUser || currentUser.id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const mapIds = new Set<string>();
    const highestByMap = new Map<string, number>();
    const challengesCompletedByMap = new Map<string, number>();
    const mainEEByMap = new Set<string>();

    for (const log of user.challengeLogs) {
      mapIds.add(log.mapId);
      // Highest round on this map from any challenge type (matches achievement logic)
      const current = highestByMap.get(log.mapId) ?? 0;
      highestByMap.set(log.mapId, Math.max(current, log.roundReached));
      const count = challengesCompletedByMap.get(log.mapId) ?? 0;
      challengesCompletedByMap.set(log.mapId, count + 1);
    }

    for (const log of user.easterEggLogs) {
      mapIds.add(log.mapId);
      if (log.easterEgg.type === 'MAIN_QUEST') {
        mainEEByMap.add(log.mapId);
      }
      if (log.roundCompleted != null) {
        const current = highestByMap.get(log.mapId) ?? 0;
        highestByMap.set(log.mapId, Math.max(current, log.roundCompleted));
      }
    }

    const maps = await prisma.map.findMany({
      where: { id: { in: Array.from(mapIds) } },
      include: { game: true },
    });

    const mapStats: UserMapStats[] = maps.map((map) => ({
      mapId: map.id,
      mapSlug: map.slug,
      mapName: map.name,
      mapImageUrl: map.imageUrl,
      gameShortName: map.game.shortName,
      highestRound: highestByMap.get(map.id) ?? 0,
      hasCompletedMainEE: mainEEByMap.has(map.id),
      challengesCompleted: challengesCompletedByMap.get(map.id) ?? 0,
    }));

    const [totalMaps, totalMainEasterEggs, totalChallenges, totalAchievements] = await Promise.all([
      prisma.map.count(),
      prisma.easterEgg.count({ where: { type: 'MAIN_QUEST', isActive: true } }),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.achievement.count({ where: { isActive: true, mapId: { not: null } } }),
    ]);

    return NextResponse.json({
      mapStats,
      totalMaps,
      totalMainEasterEggs,
      totalChallenges,
      totalAchievements,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
