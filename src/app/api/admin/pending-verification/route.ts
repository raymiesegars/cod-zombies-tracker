import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';
const DEFAULT_LIMIT = 250;
const MAX_LIMIT = 500;
const SPEEDRUN_GAUNTLET_RELICS = [
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

function isSpeedrunGauntletChallengeLog(log: {
  map: { slug: string; game: { shortName: string } };
  challenge: { type: string };
  playerCount: string;
  bo7GobbleGumMode?: string | null;
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: string[] | null;
}): boolean {
  if (log.map.game.shortName !== 'BO7') return false;
  if (!log.map.slug.toLowerCase().includes('toten')) return false;
  if (log.challenge.type !== 'EASTER_EGG_SPEEDRUN') return false;
  if (log.playerCount !== 'SOLO') return false;
  if (log.bo7GobbleGumMode !== 'WITH_GOBBLEGUMS') return false;
  if (log.bo7SupportMode !== 'WITH_SUPPORT') return false;
  if (log.bo7IsCursedRun !== true) return false;
  const relics = Array.isArray(log.bo7RelicsUsed) ? log.bo7RelicsUsed.map(String) : [];
  return relics.length === SPEEDRUN_GAUNTLET_RELICS.length && SPEEDRUN_GAUNTLET_RELICS.every((r) => relics.includes(r));
}

/** List all runs pending verification (challenge + easter egg). Admin only. Query: game (shortName), runType (all | speedrun). */
export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game')?.trim() || null;
    const runType = searchParams.get('runType') === 'speedrun' ? 'speedrun' : 'all';
    const requestedLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(MAX_LIMIT, Math.max(1, requestedLimit))
      : DEFAULT_LIMIT;

    const challengeWhere = {
      verificationRequestedAt: { not: null },
      isVerified: false,
      ...(game && { map: { game: { shortName: game } } }),
    };
    const eeWhere = {
      verificationRequestedAt: { not: null },
      isVerified: false,
      ...(game && { map: { game: { shortName: game } } }),
    };

    const eeLogsQuery = prisma.easterEggLog.findMany({
      where: eeWhere,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
        easterEgg: { select: { name: true, type: true } },
        map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
      },
      orderBy: { verificationRequestedAt: 'desc' },
      take: limit,
    });
    type EELogWithInclude = Awaited<typeof eeLogsQuery>[number];

    const [rawChallengeLogs, easterEggLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        where: challengeWhere,
        select: {
          id: true,
          verificationRequestedAt: true,
          roundReached: true,
          playerCount: true,
          bo7RelicsUsed: true,
          bo7GobbleGumMode: true,
          bo7SupportMode: true,
          bo7IsCursedRun: true,
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
          challenge: { select: { name: true, type: true } },
          map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
        },
        orderBy: { verificationRequestedAt: 'desc' },
        take: limit,
      }),
      runType === 'speedrun' ? Promise.resolve([] as EELogWithInclude[]) : eeLogsQuery,
    ]);

    const challengeLogs =
      runType === 'speedrun'
        ? rawChallengeLogs.filter((log) => String(log.challenge.type).includes('SPEEDRUN'))
        : rawChallengeLogs;

    const challengeLogIds = challengeLogs.map((l) => l.id);
    const eeLogIds = easterEggLogs.map((l) => l.id);
    const [tournamentChallengeLogs, tournamentEeLogs] = await Promise.all([
      challengeLogIds.length > 0
        ? prisma.tournamentLog.findMany({
            where: { challengeLogId: { in: challengeLogIds } },
            select: {
              challengeLogId: true,
              tournament: { select: { title: true } },
            },
          })
        : Promise.resolve([]),
      eeLogIds.length > 0
        ? prisma.tournamentLog.findMany({
            where: { easterEggLogId: { in: eeLogIds } },
            select: {
              easterEggLogId: true,
              tournament: { select: { title: true } },
            },
          })
        : Promise.resolve([]),
    ]);
    const tournamentChallengeLabelByLogId = new Map<string, string>();
    for (const row of tournamentChallengeLogs) {
      if (!row.challengeLogId) continue;
      const title = row.tournament?.title?.trim() ?? '';
      const label = title.toLowerCase().includes('speedrun gauntlet')
        ? 'Speedrun Gauntlet'
        : 'Sponsored Tournament';
      tournamentChallengeLabelByLogId.set(row.challengeLogId, label);
    }
    const tournamentEeLabelByLogId = new Map<string, string>();
    for (const row of tournamentEeLogs) {
      if (!row.easterEggLogId) continue;
      const title = row.tournament?.title?.trim() ?? '';
      const label = title.toLowerCase().includes('speedrun gauntlet')
        ? 'Speedrun Gauntlet'
        : 'Sponsored Tournament';
      tournamentEeLabelByLogId.set(row.easterEggLogId, label);
    }

    const challengeItems = challengeLogs.map((log) => ({
      logType: 'challenge' as const,
      logId: log.id,
      mapSlug: log.map.slug,
      mapName: log.map.name,
      mapImageUrl: log.map.imageUrl,
      gameShortName: log.map.game.shortName,
      runLabel: `${log.challenge.name} – Round ${log.roundReached}`,
      roundReached: log.roundReached,
      playerCount: log.playerCount,
      isTournamentRun: tournamentChallengeLabelByLogId.has(log.id) || isSpeedrunGauntletChallengeLog(log),
      tournamentLabel:
        tournamentChallengeLabelByLogId.get(log.id) ??
        (isSpeedrunGauntletChallengeLog(log) ? 'Speedrun Gauntlet' : null),
      user: {
        id: log.user.id,
        username: log.user.username,
        displayName: log.user.displayName,
        avatarUrl: getDisplayAvatarUrl(log.user),
      },
      createdAt: log.verificationRequestedAt!.toISOString(),
    }));

    const eeItems = easterEggLogs.map((log) => ({
      logType: 'easter_egg' as const,
      logId: log.id,
      mapSlug: log.map.slug,
      mapName: log.map.name,
      mapImageUrl: log.map.imageUrl,
      gameShortName: log.map.game.shortName,
      runLabel: log.easterEgg.name,
      roundCompleted: log.roundCompleted,
      playerCount: log.playerCount,
      isTournamentRun: tournamentEeLabelByLogId.has(log.id),
      tournamentLabel: tournamentEeLabelByLogId.get(log.id) ?? null,
      user: {
        id: log.user.id,
        username: log.user.username,
        displayName: log.user.displayName,
        avatarUrl: getDisplayAvatarUrl(log.user),
      },
      createdAt: log.verificationRequestedAt!.toISOString(),
    }));

    const runs = [...challengeItems, ...eeItems]
      .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({ runs, isTruncated: challengeItems.length + eeItems.length > limit });
  } catch (error) {
    console.error('Error fetching pending verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
