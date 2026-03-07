import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { TournamentStatus } from '@prisma/client';

export const revalidate = 60;

/** GET: List tournaments for dropdown/filter. Order: latest first. */
export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
        endsAt: true,
        game: { select: { shortName: true } },
        map: { select: { name: true, slug: true } },
        challenge: { select: { name: true, type: true } },
        easterEgg: { select: { name: true } },
      },
    });
    return NextResponse.json(tournaments, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Error listing tournaments:', error);
    return NextResponse.json({ error: 'Failed to list tournaments' }, { status: 500 });
  }
}

/** POST: Create tournament (super admin only). Body: { title, pollId?, gameId, mapId, challengeId?, easterEggId?, config?, startsAt?, endsAt? }. */
export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const gameId = typeof body.gameId === 'string' ? body.gameId : '';
    const mapId = typeof body.mapId === 'string' ? body.mapId : '';
    const challengeId = typeof body.challengeId === 'string' ? body.challengeId : null;
    const easterEggId = typeof body.easterEggId === 'string' ? body.easterEggId : null;
    if (!gameId || !mapId) {
      return NextResponse.json({ error: 'gameId and mapId are required' }, { status: 400 });
    }
    if ((challengeId && easterEggId) || (!challengeId && !easterEggId)) {
      return NextResponse.json({ error: 'Exactly one of challengeId or easterEggId is required' }, { status: 400 });
    }

    const now = new Date();
    const startsAt = body.startsAt ? new Date(body.startsAt) : now;
    const endsAt = body.endsAt ? new Date(body.endsAt) : new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
    const config = body.config && typeof body.config === 'object' ? body.config : undefined;
    const pollId = typeof body.pollId === 'string' ? body.pollId : undefined;

    const tournament = await prisma.tournament.create({
      data: {
        title,
        pollId: pollId || undefined,
        gameId,
        mapId,
        challengeId: challengeId || undefined,
        easterEggId: easterEggId || undefined,
        config: config ?? undefined,
        startsAt,
        endsAt,
        status: TournamentStatus.OPEN,
        createdById: me.id,
      },
      include: {
        game: { select: { shortName: true, name: true } },
        map: { select: { name: true, slug: true } },
        challenge: { select: { name: true, type: true } },
        easterEgg: { select: { name: true } },
      },
    });
    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
