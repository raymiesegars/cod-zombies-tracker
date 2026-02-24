import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isBo4Game } from '@/lib/bo4';
import { isSpeedrunCategory } from '@/lib/achievements/categories';
import { computeWorldRecords } from '@/lib/world-records';
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
    const highestDifficultyByMap = new Map<string, string>();
    const challengesCompletedByMap = new Map<string, number>();
    const mainEEByMap = new Set<string>();

    for (const log of user.challengeLogs) {
      mapIds.add(log.mapId);
      const current = highestByMap.get(log.mapId) ?? 0;
      const round = log.roundReached;
      if (round > current) {
        highestByMap.set(log.mapId, round);
        if (isBo4Game(log.map?.game?.shortName)) {
          highestDifficultyByMap.set(log.mapId, (log as { difficulty?: string | null }).difficulty ?? 'NORMAL');
        }
      } else {
        highestByMap.set(log.mapId, Math.max(current, round));
      }
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
        if (log.roundCompleted > current && isBo4Game(log.map?.game?.shortName)) {
          highestDifficultyByMap.set(log.mapId, (log as { difficulty?: string | null }).difficulty ?? 'NORMAL');
        }
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
      ...(isBo4Game(map.game.shortName) && highestDifficultyByMap.has(map.id) && { highestRoundDifficulty: highestDifficultyByMap.get(map.id) }),
      hasCompletedMainEE: mainEEByMap.has(map.id),
      challengesCompleted: challengesCompletedByMap.get(map.id) ?? 0,
    }));

    const totalRuns = user.challengeLogs.length + user.easterEggLogs.length;
    const verifiedRuns =
      user.challengeLogs.filter((l) => l.isVerified).length +
      user.easterEggLogs.filter((l) => l.isVerified).length;
    const highestRound = highestByMap.size > 0 ? Math.max(...Array.from(highestByMap.values())) : 0;
    const speedrunChallengeCount = user.challengeLogs.filter(
      (l) => isSpeedrunCategory(l.challenge?.type ?? '') && l.completionTimeSeconds != null
    ).length;
    const speedrunEeCount = user.easterEggLogs.filter((l) => l.completionTimeSeconds != null).length;
    const speedrunCompletions = speedrunChallengeCount + speedrunEeCount;

    const allRounds: number[] = [];
    for (const log of user.challengeLogs) allRounds.push(log.roundReached);
    for (const log of user.easterEggLogs) if (log.roundCompleted != null) allRounds.push(log.roundCompleted);
    const avgRoundLoggedRuns =
      allRounds.length > 0 ? allRounds.reduce((a, b) => a + b, 0) / allRounds.length : 0;

    const mysteryBoxCompletions = user.mysteryBoxCompletionsLifetime ?? 0;

    const [totalMaps, totalMainEasterEggs, totalChallenges, totalAchievements, easterEggAchievementsUnlocked, xpRank, verifiedXpRank, wr] =
      await Promise.all([
        prisma.map.count(),
        prisma.easterEgg.count({ where: { type: 'MAIN_QUEST', isActive: true } }),
        prisma.challenge.count({ where: { isActive: true } }),
        prisma.achievement.count({ where: { isActive: true, mapId: { not: null } } }),
        prisma.userAchievement.count({
          where: {
            userId: user.id,
            achievement: { type: 'EASTER_EGG_COMPLETE', isActive: true },
          },
        }),
        prisma.user.count({ where: { isPublic: true, totalXp: { gt: user.totalXp ?? 0 } } }),
        prisma.user.count({ where: { isPublic: true, verifiedTotalXp: { gt: user.verifiedTotalXp ?? 0 } } }),
        computeWorldRecords(user.id),
      ]);

    return NextResponse.json({
      mapStats,
      totalMaps,
      totalMainEasterEggs,
      totalChallenges,
      totalAchievements,
      easterEggAchievementsUnlocked,
      totalRuns,
      verifiedRuns,
      highestRound,
      avgRoundLoggedRuns,
      speedrunCompletions,
      mysteryBoxCompletions,
      xpRank: xpRank + 1,
      verifiedXpRank: verifiedXpRank + 1,
      worldRecords: wr.worldRecords,
      verifiedWorldRecords: wr.verifiedWorldRecords,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
