import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { assignCompetitionRanks } from '@/lib/leaderboard-ranks';

export const dynamic = 'force-dynamic';

const REQUIRED_RELICS = [
  'Teddy Bear',
  'Dragon Wings',
  'Gong',
  'Seed',
  'Rocket',
  'Focusing Stone',
  'Spider Fang',
  'Elephant',
  'Bus',
  'Spork',
] as const;

function hasRequiredRelics(value: unknown): boolean {
  const relics = Array.isArray(value) ? value.map(String) : [];
  return (
    relics.length === REQUIRED_RELICS.length &&
    REQUIRED_RELICS.every((relic) => relics.includes(relic))
  );
}

export async function GET() {
  try {
    const logs = await prisma.challengeLog.findMany({
      where: {
        challenge: { type: 'EASTER_EGG_SPEEDRUN' },
        map: {
          slug: { contains: 'toten', mode: 'insensitive' },
          game: { shortName: 'BO7' },
        },
        playerCount: 'SOLO',
        bo7GobbleGumMode: 'WITH_GOBBLEGUMS',
        bo7SupportMode: 'WITH_SUPPORT',
        bo7IsCursedRun: true,
        OR: [
          { isVerified: true },
          { verificationRequestedAt: { not: null } },
        ],
      },
      select: {
        id: true,
        completionTimeSeconds: true,
        roundReached: true,
        isVerified: true,
        playerCount: true,
        bo7RelicsUsed: true,
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

    const valid = logs.filter((log) => hasRequiredRelics(log.bo7RelicsUsed));
    const byUser = new Map<string, (typeof valid)[number]>();
    for (const log of valid) {
      const existing = byUser.get(log.user.id);
      const currentTime = log.completionTimeSeconds ?? Number.MAX_SAFE_INTEGER;
      const existingTime = existing?.completionTimeSeconds ?? Number.MAX_SAFE_INTEGER;
      if (!existing || currentTime < existingTime) {
        byUser.set(log.user.id, log);
      }
    }

    const entries = Array.from(byUser.values()).sort((a, b) => {
      const ta = a.completionTimeSeconds ?? Number.MAX_SAFE_INTEGER;
      const tb = b.completionTimeSeconds ?? Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });

    const ranked = assignCompetitionRanks(entries, (e) => e.completionTimeSeconds ?? Number.MAX_SAFE_INTEGER, true);
    const payload = ranked.map((entry) => ({
      rank: entry.rank,
      user: entry.user,
      roundReached: entry.roundReached,
      completionTimeSeconds: entry.completionTimeSeconds,
      isVerified: entry.isVerified,
      playerCount: entry.playerCount,
      logId: entry.id,
      logType: 'challenge' as const,
      mapSlug: 'totenreich',
      trophyPlace: null,
    }));

    return NextResponse.json({ entries: payload, total: payload.length });
  } catch (error) {
    console.error('Error fetching Speedrun Gauntlet leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch Speedrun Gauntlet leaderboard' }, { status: 500 });
  }
}

