import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

function pickExtraChallenge(log: {
  difficulty?: string | null;
  completionTimeSeconds?: number | null;
  bo3GobbleGumMode?: string | null;
  bo3AatUsed?: boolean | null;
  bo4ElixirMode?: string | null;
  bocwSupportMode?: string | null;
  rampageInducerUsed?: boolean | null;
  bo6GobbleGumMode?: string | null;
  bo6SupportMode?: string | null;
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: string[];
  wawNoJug?: boolean | null;
  ww2ConsumablesUsed?: boolean | null;
  vanguardVoidUsed?: boolean | null;
  bo2BankUsed?: boolean | null;
  firstRoomVariant?: string | null;
  killsReached?: number | null;
  scoreReached?: number | null;
  useFortuneCards?: boolean | null;
  useDirectorsCut?: boolean | null;
  wawFixedWunderwaffe?: boolean | null;
}) {
  const extra: Record<string, unknown> = {};
  if (log.difficulty != null) extra['Difficulty'] = log.difficulty;
  if (log.completionTimeSeconds != null && log.completionTimeSeconds > 0) extra['Completion time'] = log.completionTimeSeconds;
  if (log.bo3GobbleGumMode != null) extra['GobbleGum'] = log.bo3GobbleGumMode;
  if (log.bo3AatUsed != null) extra['AATs used'] = log.bo3AatUsed ? 'Yes' : 'No';
  if (log.bo4ElixirMode != null) extra['Elixir/Talisman'] = log.bo4ElixirMode;
  if (log.bocwSupportMode != null) extra['Support'] = log.bocwSupportMode;
  if (log.rampageInducerUsed != null) extra['Rampage Inducer'] = log.rampageInducerUsed ? 'Yes' : 'No';
  if (log.bo6GobbleGumMode != null) extra['GobbleGums'] = log.bo6GobbleGumMode;
  if (log.bo6SupportMode != null) extra['Support'] = log.bo6SupportMode;
  if (log.bo7SupportMode != null) extra['Support'] = log.bo7SupportMode;
  if (log.bo7IsCursedRun != null) extra['Cursed run'] = log.bo7IsCursedRun ? 'Yes' : 'No';
  if (log.bo7RelicsUsed != null && log.bo7RelicsUsed.length > 0) extra['Relics'] = log.bo7RelicsUsed.join(', ');
  if (log.wawNoJug != null) extra['No Jug'] = log.wawNoJug ? 'Yes' : 'No';
  if (log.ww2ConsumablesUsed != null) extra['Consumables'] = log.ww2ConsumablesUsed ? 'Yes' : 'No';
  if (log.vanguardVoidUsed != null) extra['Void'] = log.vanguardVoidUsed ? 'Yes' : 'No';
  if (log.bo2BankUsed != null) extra['Bank/Storage'] = log.bo2BankUsed ? 'Yes' : 'No';
  if (log.firstRoomVariant != null) extra['First room'] = log.firstRoomVariant;
  if (log.killsReached != null) extra['Kills'] = log.killsReached;
  if (log.scoreReached != null) extra['Score'] = log.scoreReached;
  if (log.useFortuneCards != null) extra['Fortune cards'] = log.useFortuneCards ? 'Yes' : 'No';
  if (log.useDirectorsCut != null) extra['Director\'s cut'] = log.useDirectorsCut ? 'Yes' : 'No';
  if (log.wawFixedWunderwaffe != null) extra['Fixed Wunderwaffe'] = log.wawFixedWunderwaffe ? 'Yes' : 'No';
  return extra;
}

function pickExtraEe(log: {
  difficulty?: string | null;
  completionTimeSeconds?: number | null;
  isSolo?: boolean;
  isNoGuide?: boolean;
  rampageInducerUsed?: boolean | null;
  ww2ConsumablesUsed?: boolean | null;
  vanguardVoidUsed?: boolean | null;
}) {
  const extra: Record<string, unknown> = {};
  if (log.difficulty != null) extra['Difficulty'] = log.difficulty;
  if (log.completionTimeSeconds != null && log.completionTimeSeconds > 0) extra['Completion time'] = log.completionTimeSeconds;
  if (log.isSolo != null) extra['Solo'] = log.isSolo ? 'Yes' : 'No';
  if (log.isNoGuide != null) extra['No guide'] = log.isNoGuide ? 'Yes' : 'No';
  if (log.rampageInducerUsed != null) extra['Rampage Inducer'] = log.rampageInducerUsed ? 'Yes' : 'No';
  if (log.ww2ConsumablesUsed != null) extra['Consumables'] = log.ww2ConsumablesUsed ? 'Yes' : 'No';
  if (log.vanguardVoidUsed != null) extra['Void'] = log.vanguardVoidUsed ? 'Yes' : 'No';
  return extra;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const logType = searchParams.get('logType');
    const logId = searchParams.get('logId')?.trim();
    if (!logId || (logType !== 'challenge' && logType !== 'easter_egg')) {
      return NextResponse.json({ error: 'logType and logId required' }, { status: 400 });
    }

    if (logType === 'challenge') {
      const log = await prisma.challengeLog.findUnique({
        where: { id: logId, verificationRequestedAt: { not: null }, isVerified: false },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
          challenge: { select: { name: true, type: true } },
          map: { select: { name: true, slug: true, game: { select: { shortName: true } } } },
        },
      });
      if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const tournamentLog = await prisma.tournamentLog.findFirst({
        where: { challengeLogId: log.id },
        include: { tournament: { select: { title: true } } },
      });
      const proofUrls = [...(log.proofUrls || []), ...(log.screenshotUrl ? [log.screenshotUrl] : [])].filter(Boolean);
      return NextResponse.json({
        run: {
          logType: 'challenge' as const,
          mapName: log.map.name,
          gameShortName: log.map.game.shortName,
          runLabel: `${log.challenge.name} – Round ${log.roundReached}`,
          roundReached: log.roundReached,
          playerCount: log.playerCount,
          user: {
            id: log.user.id,
            username: log.user.username,
            displayName: log.user.displayName,
            avatarUrl: getDisplayAvatarUrl(log.user),
          },
          createdAt: log.createdAt.toISOString(),
          proofUrls,
          notes: log.notes ?? null,
          completionTimeSeconds: log.completionTimeSeconds ?? null,
          teammateUserIds: log.teammateUserIds ?? [],
          teammateNonUserNames: log.teammateNonUserNames ?? [],
          extra: pickExtraChallenge(log),
          isTournamentRun: !!tournamentLog,
          tournamentTitle: tournamentLog?.tournament?.title ?? undefined,
        },
      });
    }

    const log = await prisma.easterEggLog.findUnique({
      where: { id: logId, verificationRequestedAt: { not: null }, isVerified: false },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
        easterEgg: { select: { name: true } },
        map: { select: { name: true, slug: true, game: { select: { shortName: true } } } },
      },
    });
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const tournamentLog = await prisma.tournamentLog.findFirst({
      where: { easterEggLogId: log.id },
      include: { tournament: { select: { title: true } } },
    });
    const proofUrls = [...(log.proofUrls || []), ...(log.screenshotUrl ? [log.screenshotUrl] : [])].filter(Boolean);
    return NextResponse.json({
      run: {
        logType: 'easter_egg' as const,
        mapName: log.map.name,
        gameShortName: log.map.game.shortName,
        runLabel: log.easterEgg.name,
        roundCompleted: log.roundCompleted ?? null,
        playerCount: log.playerCount,
        user: {
          id: log.user.id,
          username: log.user.username,
          displayName: log.user.displayName,
          avatarUrl: getDisplayAvatarUrl(log.user),
        },
        createdAt: log.createdAt.toISOString(),
        proofUrls,
        notes: log.notes ?? null,
        completionTimeSeconds: log.completionTimeSeconds ?? null,
        teammateUserIds: log.teammateUserIds ?? [],
        teammateNonUserNames: log.teammateNonUserNames ?? [],
        extra: pickExtraEe(log),
        isTournamentRun: !!tournamentLog,
        tournamentTitle: tournamentLog?.tournament?.title ?? undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching run details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
