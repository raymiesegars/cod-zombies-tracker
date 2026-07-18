import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { assignCompetitionRanks } from '@/lib/leaderboard-ranks';
import {
  getCurrentGauntlet,
  getGauntlet,
  hasExactRelics,
  type SpeedrunGauntletConfig,
} from '@/lib/speedrun-gauntlet';

export const dynamic = 'force-dynamic';

function gauntletPublicMeta(gauntlet: SpeedrunGauntletConfig) {
  return {
    slug: gauntlet.slug,
    name: gauntlet.name,
    shortLabel: gauntlet.shortLabel,
    mapSlug: gauntlet.mapSlug,
    mapDisplayName: gauntlet.mapDisplayName,
    startsAt: gauntlet.startsAt,
    endsAt: gauntlet.endsAt,
    summary: gauntlet.summary,
    officialRulesUrl: gauntlet.officialRulesUrl,
  };
}

export async function GET(request: NextRequest) {
  try {
    const slugParam = request.nextUrl.searchParams.get('slug');
    const gauntlet = getGauntlet(slugParam) ?? getCurrentGauntlet();

    const logs = await prisma.challengeLog.findMany({
      where: {
        challenge: { type: 'EASTER_EGG_SPEEDRUN' },
        map: {
          slug: gauntlet.mapSlug,
          game: { shortName: 'BO7' },
        },
        playerCount: 'SOLO',
        bo7GobbleGumMode: 'WITH_GOBBLEGUMS',
        bo7SupportMode: 'WITH_SUPPORT',
        bo7IsCursedRun: true,
        createdAt: {
          gte: new Date(gauntlet.startsAt),
          lte: new Date(gauntlet.endsAt),
        },
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
        map: { select: { slug: true } },
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

    const valid = logs.filter((log) => hasExactRelics(log.bo7RelicsUsed, gauntlet.requiredRelics));
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
      mapSlug: entry.map.slug,
      trophyPlace: null,
    }));

    return NextResponse.json({
      gauntlet: gauntletPublicMeta(gauntlet),
      entries: payload,
      total: payload.length,
    });
  } catch (error) {
    console.error('Error fetching Speedrun Gauntlet leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch Speedrun Gauntlet leaderboard' }, { status: 500 });
  }
}
