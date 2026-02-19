import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isBo4Game } from '@/lib/bo4';
import type { UserMapStats } from '@/types';

export const dynamic = 'force-dynamic';

// Your per-map stats: highest round + main EE done. Used on the maps page.
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ mapStats: [] as UserMapStats[] });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: {
        challengeLogs: {
          include: { challenge: true, map: { include: { game: true } } },
        },
        easterEggLogs: {
          include: { easterEgg: true, map: { include: { game: true } } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ mapStats: [] as UserMapStats[] });
    }

    const highestByMap = new Map<string, number>();
    const highestDifficultyByMap = new Map<string, string>();
    const mainEEByMap = new Set<string>();

    for (const log of user.challengeLogs) {
      const round = log.roundReached;
      const current = highestByMap.get(log.mapId) ?? 0;
      if (round > current && isBo4Game(log.map?.game?.shortName)) {
        highestDifficultyByMap.set(log.mapId, (log as { difficulty?: string | null }).difficulty ?? 'NORMAL');
      }
      highestByMap.set(log.mapId, Math.max(current, round));
    }
    for (const log of user.easterEggLogs) {
      if (log.easterEgg.type === 'MAIN_QUEST') mainEEByMap.add(log.mapId);
      if (log.roundCompleted != null) {
        const current = highestByMap.get(log.mapId) ?? 0;
        if (log.roundCompleted > current && isBo4Game(log.map?.game?.shortName)) {
          highestDifficultyByMap.set(log.mapId, (log as { difficulty?: string | null }).difficulty ?? 'NORMAL');
        }
        highestByMap.set(log.mapId, Math.max(current, log.roundCompleted));
      }
    }

    const mapIds = new Set([
      ...Array.from(highestByMap.keys()),
      ...Array.from(mainEEByMap),
    ]);
    if (mapIds.size === 0) {
      return NextResponse.json({ mapStats: [] as UserMapStats[] });
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
      ...(isBo4Game(map.game.shortName) && highestDifficultyByMap.has(map.id) && { highestRoundDifficulty: highestDifficultyByMap.get(map.id) }),
      hasCompletedMainEE: mainEEByMap.has(map.id),
      challengesCompleted: 0,
    }));

    return NextResponse.json({ mapStats });
  } catch (error) {
    console.error('GET /api/me/map-stats', error);
    return NextResponse.json({ mapStats: [] as UserMapStats[] });
  }
}
