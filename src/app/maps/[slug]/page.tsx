import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { sortAchievementsForDisplay } from '@/lib/achievements/categories';
import MapDetailClient from './MapDetailClient';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

async function getMapStats(mapId: string) {
    const [easterEggStats, challengeUsers, eeUsers, highestFromChallenges, highestFromEE] =
      await Promise.all([
        prisma.easterEggLog.groupBy({
          by: ['easterEggId'],
          where: { mapId },
          _count: { userId: true },
        }),
        prisma.challengeLog.findMany({
          where: { mapId },
          distinct: ['userId'],
          select: { userId: true },
        }),
        prisma.easterEggLog.findMany({
          where: { mapId, roundCompleted: { not: null } },
          distinct: ['userId'],
          select: { userId: true },
        }),
      prisma.challengeLog.findFirst({
        where: { mapId },
        orderBy: { roundReached: 'desc' },
        select: { roundReached: true },
      }),
      prisma.easterEggLog.findFirst({
        where: { mapId, roundCompleted: { not: null } },
        orderBy: { roundCompleted: 'desc' },
        select: { roundCompleted: true },
      }),
    ]);

  const easterEggCompletions: Record<string, number> = {};
  for (const stat of easterEggStats) {
    const uniqueUsers = await prisma.easterEggLog.findMany({
      where: { mapId, easterEggId: stat.easterEggId },
      distinct: ['userId'],
      select: { userId: true },
    });
    easterEggCompletions[stat.easterEggId] = uniqueUsers.length;
  }

  const highestRound = Math.max(
    highestFromChallenges?.roundReached ?? 0,
    highestFromEE?.roundCompleted ?? 0
  );

  const uniquePlayerIds = new Set([
    ...challengeUsers.map((u) => u.userId),
    ...eeUsers.map((u) => u.userId),
  ]);

  return {
    easterEggCompletions,
    totalPlayers: uniquePlayerIds.size,
    highestRound,
  };
}

export default async function MapSlugPage({ params }: Props) {
  const { slug } = await params;

  const map = await prisma.map.findUnique({
    where: { slug },
    include: {
      game: true,
      challenges: {
        where: { isActive: true },
        orderBy: { type: 'asc' },
      },
      easterEggs: {
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { id: 'asc' }],
        include: {
          steps: { orderBy: { order: 'asc' } },
        },
      },
      achievements: {
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { slug: 'asc' }],
        include: {
          easterEgg: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!map) notFound();

  // Sort achievements by round (numeric) so Round 5, 10, 15
  const sortedAchievements = sortAchievementsForDisplay(map.achievements ?? []);

  const [stats, supabaseUser] = await Promise.all([
    getMapStats(map.id),
    getUser(),
  ]);

  let unlockedAchievementIds: string[] = [];
  if (supabaseUser) {
    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (user) {
      const unlocked = await prisma.userAchievement.findMany({
        where: { userId: user.id, achievement: { mapId: map.id } },
        select: { achievementId: true },
      });
      unlockedAchievementIds = unlocked.map((u) => u.achievementId);
    }
  }

  const initialMap = {
    ...map,
    achievements: sortedAchievements,
    unlockedAchievementIds,
  };

  return (
    <MapDetailClient
      initialMap={initialMap}
      initialMapStats={stats}
    />
  );
}
