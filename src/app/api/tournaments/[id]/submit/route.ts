import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { TournamentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
        status: true,
        endsAt: true,
        challengeId: true,
        easterEggId: true,
        mapId: true,
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
      });
      if (!log) {
        return NextResponse.json({ error: 'Log not found or does not match tournament category' }, { status: 404 });
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
      });
      if (!log) {
        return NextResponse.json({ error: 'Log not found or does not match tournament category' }, { status: 404 });
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
