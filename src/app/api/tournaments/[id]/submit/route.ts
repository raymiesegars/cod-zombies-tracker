import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { TournamentStatus } from '@prisma/client';
import {
  hasExactRelics,
  isGauntletOpen,
  resolveGauntletFromTournament,
} from '@/lib/speedrun-gauntlet';

export const dynamic = 'force-dynamic';

function valuesEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const aSorted = [...a].map(String).sort();
    const bSorted = [...b].map(String).sort();
    return aSorted.every((v, idx) => v === bSorted[idx]);
  }
  return a === b;
}

function validateTournamentConfig(
  rawConfig: unknown,
  log: Record<string, unknown>
): string | null {
  if (!rawConfig || typeof rawConfig !== 'object') return null;
  const config = rawConfig as Record<string, unknown>;
  const enforcedKeys = Object.keys(config);
  for (const key of enforcedKeys) {
    const expected = config[key];
    if (expected === undefined || expected === null) continue;
    if (!(key in log)) continue;
    const actual = log[key];
    if (!valuesEqual(expected, actual)) {
      return `Run does not match tournament requirement for ${key}`;
    }
  }
  return null;
}

/** POST: Link an existing log to this tournament. Body: { challengeLogId } or { easterEggLogId }. Tournament must be OPEN and not past endsAt. Log must match tournament category and belong to current user. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: tournamentId } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        status: true,
        endsAt: true,
        challengeId: true,
        easterEggId: true,
        mapId: true,
        config: true,
        game: { select: { shortName: true } },
        map: { select: { slug: true } },
        challenge: { select: { name: true } },
        easterEgg: { select: { name: true } },
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    if (tournament.status !== TournamentStatus.OPEN) {
      return NextResponse.json({ error: 'Tournament is not open for submissions' }, { status: 400 });
    }
    if (new Date() >= tournament.endsAt) {
      return NextResponse.json({ error: 'Tournament has ended' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const challengeLogId = typeof body.challengeLogId === 'string' ? body.challengeLogId : null;
    const easterEggLogId = typeof body.easterEggLogId === 'string' ? body.easterEggLogId : null;

    if ((challengeLogId && easterEggLogId) || (!challengeLogId && !easterEggLogId)) {
      return NextResponse.json({ error: 'Provide exactly one of challengeLogId or easterEggLogId' }, { status: 400 });
    }

    if (challengeLogId) {
      if (!tournament.challengeId) {
        return NextResponse.json({ error: 'This tournament is not for a challenge' }, { status: 400 });
      }
      const log = await prisma.challengeLog.findFirst({
        where: {
          id: challengeLogId,
          userId: me.id,
          challengeId: tournament.challengeId,
          mapId: tournament.mapId,
        },
        select: {
          id: true,
          isVerified: true,
          verificationRequestedAt: true,
          playerCount: true,
          difficulty: true,
          bo3GobbleGumMode: true,
          bo3AatUsed: true,
          bo4ElixirMode: true,
          bocwSupportMode: true,
          bo6GobbleGumMode: true,
          bo6SupportMode: true,
          bo7GobbleGumMode: true,
          bo7SupportMode: true,
          bo7IsCursedRun: true,
          bo7RelicsUsed: true,
          rampageInducerUsed: true,
          useFortuneCards: true,
          useDirectorsCut: true,
          ww2ConsumablesUsed: true,
          vanguardVoidUsed: true,
          firstRoomVariant: true,
          bo2BankUsed: true,
          wawNoJug: true,
          wawFixedWunderwaffe: true,
        },
      });
      if (!log) {
        return NextResponse.json({ error: 'Log not found or does not match tournament category' }, { status: 404 });
      }
      if (!log.isVerified && !log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run must be verification pending or verified before tournament submission' }, { status: 400 });
      }
      const challengeConfigError = validateTournamentConfig(tournament.config, log as unknown as Record<string, unknown>);
      if (challengeConfigError) {
        return NextResponse.json({ error: challengeConfigError }, { status: 400 });
      }
      const gauntlet = resolveGauntletFromTournament(tournament);
      if (gauntlet && tournament.game?.shortName === 'BO7') {
        if (!isGauntletOpen(gauntlet)) {
          return NextResponse.json({ error: 'This Speedrun Gauntlet is not open for submissions' }, { status: 400 });
        }
        if (log.playerCount !== 'SOLO') {
          return NextResponse.json({ error: 'Speedrun Gauntlet submissions must be Solo runs' }, { status: 400 });
        }
        if (log.bo7GobbleGumMode !== 'WITH_GOBBLEGUMS') {
          return NextResponse.json(
            { error: 'Speedrun Gauntlet submissions must use With GobbleGums mode' },
            { status: 400 }
          );
        }
        if (log.bo7SupportMode !== 'WITH_SUPPORT') {
          return NextResponse.json(
            { error: 'Speedrun Gauntlet submissions must use With Support mode' },
            { status: 400 }
          );
        }
        if (log.bo7IsCursedRun !== true) {
          return NextResponse.json({ error: 'Speedrun Gauntlet submissions must be marked as Cursed runs' }, { status: 400 });
        }
        if (!hasExactRelics(log.bo7RelicsUsed, gauntlet.requiredRelics)) {
          return NextResponse.json(
            { error: 'Speedrun Gauntlet submissions must include the exact 10 required relics' },
            { status: 400 }
          );
        }
      }
      const existing = await prisma.tournamentLog.findUnique({
        where: { tournamentId_challengeLogId: { tournamentId, challengeLogId } },
      });
      if (existing) {
        return NextResponse.json({ error: 'This run is already submitted to the tournament' }, { status: 400 });
      }
      await prisma.tournamentLog.create({
        data: { tournamentId, userId: me.id, challengeLogId },
      });
    } else {
      if (!tournament.easterEggId) {
        return NextResponse.json({ error: 'This tournament is not for an Easter egg' }, { status: 400 });
      }
      const log = await prisma.easterEggLog.findFirst({
        where: {
          id: easterEggLogId!,
          userId: me.id,
          easterEggId: tournament.easterEggId,
          mapId: tournament.mapId,
        },
        select: {
          id: true,
          isVerified: true,
          verificationRequestedAt: true,
          playerCount: true,
          difficulty: true,
          rampageInducerUsed: true,
          ww2ConsumablesUsed: true,
          vanguardVoidUsed: true,
        },
      });
      if (!log) {
        return NextResponse.json({ error: 'Log not found or does not match tournament category' }, { status: 404 });
      }
      if (!log.isVerified && !log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run must be verification pending or verified before tournament submission' }, { status: 400 });
      }
      const eeConfigError = validateTournamentConfig(tournament.config, log as unknown as Record<string, unknown>);
      if (eeConfigError) {
        return NextResponse.json({ error: eeConfigError }, { status: 400 });
      }
      const existing = await prisma.tournamentLog.findUnique({
        where: { tournamentId_easterEggLogId: { tournamentId, easterEggLogId: easterEggLogId! } },
      });
      if (existing) {
        return NextResponse.json({ error: 'This run is already submitted to the tournament' }, { status: 400 });
      }
      await prisma.tournamentLog.create({
        data: { tournamentId, userId: me.id, easterEggLogId: easterEggLogId! },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error submitting to tournament:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
