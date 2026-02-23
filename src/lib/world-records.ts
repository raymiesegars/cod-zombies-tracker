import prisma from '@/lib/prisma';
import { isSpeedrunCategory } from '@/lib/achievements/categories';

export type WorldRecordsResult = { worldRecords: number; verifiedWorldRecords: number };

/**
 * Compute how many leaderboard views (map × challenge-type × verified, or map × easter-egg × verified)
 * the user is ranked #1 on. Uses SOLO only, no game-specific filters.
 */
export async function computeWorldRecords(userId: string): Promise<WorldRecordsResult> {
  const challengeLogs = await prisma.challengeLog.findMany({
    where: { playerCount: 'SOLO' },
    select: {
      id: true,
      userId: true,
      mapId: true,
      challengeId: true,
      roundReached: true,
      completionTimeSeconds: true,
      isVerified: true,
      challenge: { select: { type: true } },
    },
  });

  const eeLogs = await prisma.easterEggLog.findMany({
    where: {
      playerCount: 'SOLO',
      completionTimeSeconds: { not: null },
    },
    select: {
      id: true,
      userId: true,
      mapId: true,
      easterEggId: true,
      completionTimeSeconds: true,
      isVerified: true,
    },
  });

  type Key = string;
  const challengeByKey = new Map<
    Key,
    { userId: string; roundReached: number | null; completionTimeSeconds: number | null; isVerified: boolean; challengeType: string }[]
  >();
  for (const log of challengeLogs) {
    if (!log.challengeId || !log.challenge?.type) continue;
    const key: Key = `${log.mapId}:${log.challengeId}:${log.isVerified ?? false}`;
    if (!challengeByKey.has(key)) challengeByKey.set(key, []);
    challengeByKey.get(key)!.push({
      userId: log.userId,
      roundReached: log.roundReached,
      completionTimeSeconds: log.completionTimeSeconds,
      isVerified: log.isVerified ?? false,
      challengeType: log.challenge.type,
    });
  }

  let worldRecords = 0;
  let verifiedWorldRecords = 0;

  for (const [key, entries] of Array.from(challengeByKey.entries())) {
    const isVerifiedView = key.endsWith(':true');
    const isSpeedrun = isSpeedrunCategory(entries[0]!.challengeType);
    const best = isSpeedrun
      ? entries.reduce((a, b) =>
          (a.completionTimeSeconds ?? Infinity) <= (b.completionTimeSeconds ?? Infinity) ? a : b
        )
      : entries.reduce((a, b) => ((a.roundReached ?? 0) >= (b.roundReached ?? 0) ? a : b));
    if (best.userId === userId) {
      worldRecords++;
      if (isVerifiedView) verifiedWorldRecords++;
    }
  }

  // EE leaderboards: (mapId, easterEggId, isVerified) -> best by completionTimeSeconds asc
  const eeByKey = new Map<
    Key,
    { userId: string; completionTimeSeconds: number; isVerified: boolean }[]
  >();
  for (const log of eeLogs) {
    const key: Key = `${log.mapId}:${log.easterEggId}:${log.isVerified ?? false}`;
    if (!eeByKey.has(key)) eeByKey.set(key, []);
    eeByKey.get(key)!.push({
      userId: log.userId,
      completionTimeSeconds: log.completionTimeSeconds!,
      isVerified: log.isVerified ?? false,
    });
  }

  for (const [key, entries] of Array.from(eeByKey.entries())) {
    const isVerifiedView = key.endsWith(':true');
    const best = entries.reduce((a, b) =>
      a.completionTimeSeconds <= b.completionTimeSeconds ? a : b
    );
    if (best.userId === userId) {
      worldRecords++;
      if (isVerifiedView) verifiedWorldRecords++;
    }
  }

  return { worldRecords, verifiedWorldRecords };
}
