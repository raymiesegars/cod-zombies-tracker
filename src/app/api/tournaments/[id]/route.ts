import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, TournamentStatus } from '@prisma/client';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { BO4_DIFFICULTIES } from '@/lib/bo4';

export const dynamic = 'force-dynamic';

function configToChallengeLogUpdate(config: Record<string, unknown>, gameShortName: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (config.playerCount && ['SOLO', 'DUO', 'TRIO', 'SQUAD'].includes(config.playerCount as string)) {
    out.playerCount = config.playerCount;
  }
  if (gameShortName === 'BO3') {
    if (config.bo3GobbleGumMode && ['CLASSIC_ONLY', 'MEGA', 'NONE', 'ANY_PERCENT'].includes(config.bo3GobbleGumMode as string)) {
      out.bo3GobbleGumMode = config.bo3GobbleGumMode;
    }
    if (config.bo3AatUsed !== undefined) out.bo3AatUsed = Boolean(config.bo3AatUsed);
  }
  if (gameShortName === 'BO4') {
    if (config.difficulty && (BO4_DIFFICULTIES as readonly string[]).includes(config.difficulty as string)) out.difficulty = config.difficulty;
    const elixir = config.bo4ElixirMode as string | undefined;
    if (elixir === 'CLASSIC' || elixir === 'CLASSIC_ONLY') out.bo4ElixirMode = 'CLASSIC_ONLY';
    else if (elixir === 'ALL' || elixir === 'ALL_ELIXIRS_TALISMANS') out.bo4ElixirMode = 'ALL_ELIXIRS_TALISMANS';
    else if (elixir === 'ANY_PERCENT') out.bo4ElixirMode = 'ANY_PERCENT';
  }
  if (gameShortName === 'BOCW') {
    if (config.bocwSupportMode) out.bocwSupportMode = config.bocwSupportMode;
  }
  if (gameShortName === 'BO6') {
    if (config.bo6GobbleGumMode) out.bo6GobbleGumMode = config.bo6GobbleGumMode;
    if (config.bo6SupportMode) out.bo6SupportMode = config.bo6SupportMode;
  }
  if (gameShortName === 'BO7') {
    if (config.bo7SupportMode) out.bo7SupportMode = config.bo7SupportMode;
  }
  if (['BOCW', 'BO6', 'BO7', 'VANGUARD'].includes(gameShortName) && config.rampageInducerUsed !== undefined) {
    out.rampageInducerUsed = Boolean(config.rampageInducerUsed);
  }
  if (gameShortName === 'IW') {
    if (config.useFortuneCards !== undefined) out.useFortuneCards = Boolean(config.useFortuneCards);
    if (config.useDirectorsCut !== undefined) out.useDirectorsCut = Boolean(config.useDirectorsCut);
  }
  if ((gameShortName === 'WW2' || gameShortName === 'WWII') && config.ww2ConsumablesUsed !== undefined) {
    out.ww2ConsumablesUsed = config.ww2ConsumablesUsed !== false;
  }
  if (gameShortName === 'VANGUARD' && config.vanguardVoidUsed !== undefined) {
    out.vanguardVoidUsed = config.vanguardVoidUsed !== false;
  }
  return out;
}

function configToEasterEggLogUpdate(config: Record<string, unknown>, gameShortName: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (gameShortName === 'BO4' && config.difficulty && (BO4_DIFFICULTIES as readonly string[]).includes(config.difficulty as string)) {
    out.difficulty = config.difficulty;
  }
  if (['BOCW', 'BO6', 'BO7', 'VANGUARD'].includes(gameShortName) && config.rampageInducerUsed !== undefined) {
    out.rampageInducerUsed = Boolean(config.rampageInducerUsed);
  }
  if ((gameShortName === 'WW2' || gameShortName === 'WWII') && config.ww2ConsumablesUsed !== undefined) {
    out.ww2ConsumablesUsed = config.ww2ConsumablesUsed !== false;
  }
  if (gameShortName === 'VANGUARD' && config.vanguardVoidUsed !== undefined) {
    out.vanguardVoidUsed = config.vanguardVoidUsed !== false;
  }
  return out;
}

/** GET: One tournament with full config (for log form and display). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        game: { select: { id: true, shortName: true, name: true } },
        map: { select: { id: true, name: true, slug: true } },
        challenge: { select: { id: true, name: true, type: true, slug: true } },
        easterEgg: { select: { id: true, name: true, type: true, slug: true } },
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    const isOpen = tournament.status === TournamentStatus.OPEN && new Date() < tournament.endsAt;
    return NextResponse.json({
      ...tournament,
      isOpen,
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: 'Failed to fetch tournament' }, { status: 500 });
  }
}

/** PATCH: Update tournament (super admin only). Body: { endNow: true } to lock tournament immediately. */
export async function PATCH(
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
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.endNow === true) {
      const now = new Date();
      await prisma.tournament.update({
        where: { id },
        data: { status: TournamentStatus.LOCKED, endsAt: now },
      });
      const updated = await prisma.tournament.findUnique({
        where: { id },
        include: {
          game: { select: { id: true, shortName: true, name: true } },
          map: { select: { id: true, name: true, slug: true } },
          challenge: { select: { id: true, name: true, type: true, slug: true } },
          easterEgg: { select: { id: true, name: true, type: true, slug: true } },
        },
      });
      return NextResponse.json({ ...updated, isOpen: false });
    }

    const config = body.config && typeof body.config === 'object' ? body.config as Record<string, unknown> : undefined;
    const title = typeof body.title === 'string' ? body.title.trim() : undefined;
    if (config !== undefined || title !== undefined) {
      const fullTournament = await prisma.tournament.findUnique({
        where: { id },
        include: { game: { select: { shortName: true } } },
      });
      if (!fullTournament) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
      const updateData: { config?: Record<string, unknown>; title?: string } = {};
      if (config !== undefined) updateData.config = config;
      if (title !== undefined) updateData.title = title;
      await prisma.tournament.update({
        where: { id },
        data: updateData as Prisma.TournamentUpdateInput,
      });
      const gameShortName = fullTournament.game?.shortName ?? '';
      if (config !== undefined && Object.keys(config).length > 0) {
        const tLogs = await prisma.tournamentLog.findMany({
          where: { tournamentId: id },
          select: { challengeLogId: true, easterEggLogId: true },
        });
        const challengeUpdate = configToChallengeLogUpdate(config, gameShortName);
        const eeUpdate = configToEasterEggLogUpdate(config, gameShortName);
        if (Object.keys(challengeUpdate).length > 0) {
          const challengeIds = tLogs.map((t) => t.challengeLogId).filter((x): x is string => !!x);
          if (challengeIds.length > 0) {
            await prisma.challengeLog.updateMany({
              where: { id: { in: challengeIds } },
              data: challengeUpdate as Record<string, string | boolean>,
            });
          }
        }
        if (Object.keys(eeUpdate).length > 0) {
          const eeIds = tLogs.map((t) => t.easterEggLogId).filter((x): x is string => !!x);
          if (eeIds.length > 0) {
            await prisma.easterEggLog.updateMany({
              where: { id: { in: eeIds } },
              data: eeUpdate as Record<string, string | boolean>,
            });
          }
        }
      }
      const updated = await prisma.tournament.findUnique({
        where: { id },
        include: {
          game: { select: { id: true, shortName: true, name: true } },
          map: { select: { id: true, name: true, slug: true } },
          challenge: { select: { id: true, name: true, type: true, slug: true } },
          easterEgg: { select: { id: true, name: true, type: true, slug: true } },
        },
      });
      const isOpen = updated?.status === TournamentStatus.OPEN && updated && new Date() < updated.endsAt;
      return NextResponse.json({ ...updated, isOpen });
    }

    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}

/** DELETE: Remove tournament (super admin only, ended tournaments only). Cascades to logs and trophies. */
export async function DELETE(
  _request: NextRequest,
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
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { id: true, status: true, endsAt: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const now = new Date();
    const isEnded = tournament.status === TournamentStatus.LOCKED || new Date(tournament.endsAt) < now;
    if (!isEnded) {
      return NextResponse.json({ error: 'Can only delete ended tournaments' }, { status: 400 });
    }

    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}
