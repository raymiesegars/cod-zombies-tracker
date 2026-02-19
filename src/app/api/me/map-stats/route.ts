import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
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
    const mainEEByMap = new Set<string>();

    // Highest round from any challenge type
    for (const log of user.challengeLogs) {
      const current = highestByMap.get(log.mapId) ?? 0;
      highestByMap.set(log.mapId, Math.max(current, log.roundReached));
    }
    // Also include easter egg roundCompleted for highest round
    for (const log of user.easterEggLogs) {
      if (log.easterEgg.type === 'MAIN_QUEST') mainEEByMap.add(log.mapId);
      if (log.roundCompleted != null) {
        const current = highestByMap.get(log.mapId) ?? 0;
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
      hasCompletedMainEE: mainEEByMap.has(map.id),
      challengesCompleted: 0, // not needed for maps page overlay
    }));

    return NextResponse.json({ mapStats });
  } catch (error) {
    console.error('GET /api/me/map-stats', error);
    return NextResponse.json({ mapStats: [] as UserMapStats[] });
  }
}
