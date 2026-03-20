import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { getLevelFromXp } from '@/lib/ranks';
import { TournamentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const XP_BY_PLACE: Record<number, number> = {
  1: 30_000,
  2: 15_000,
  3: 7_500,
};

/** POST: Award one trophy (gold/silver/bronze) to a user for this tournament. Super admin only. Body: { userId: string, place: 1 | 2 | 3 }. */
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
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: tournamentId } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, status: true, endsAt: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    const now = new Date();
    const canAwardTrophies =
      tournament.status === TournamentStatus.LOCKED || new Date(tournament.endsAt) < now;
    if (!canAwardTrophies) {
      return NextResponse.json(
        { error: 'Tournament must be ended before awarding trophies (wait until the timer ends or use End tournament).' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userId = typeof body.userId === 'string' ? body.userId.trim() : null;
    const place = typeof body.place === 'number' && [1, 2, 3].includes(body.place) ? body.place : null;
    if (!userId || !place) {
      return NextResponse.json({ error: 'Provide userId and place (1=gold, 2=silver, 3=bronze)' }, { status: 400 });
    }

    const existing = await prisma.tournamentTrophy.findUnique({
      where: {
        tournamentId_place: { tournamentId, place },
      },
    });
    if (existing) {
      return NextResponse.json({ error: `Place ${place} (${place === 1 ? 'Gold' : place === 2 ? 'Silver' : 'Bronze'}) already awarded` }, { status: 400 });
    }

    const xp = XP_BY_PLACE[place] ?? 0;
    await prisma.$transaction(async (tx) => {
      await tx.tournamentTrophy.create({
        data: {
          tournamentId,
          userId,
          place,
          xpAwarded: xp,
          awardedById: me.id,
        },
      });
      if (xp > 0) {
        const updated = await tx.user.update({
          where: { id: userId },
          data: { totalXp: { increment: xp } },
          select: { totalXp: true, level: true },
        });
        const { level } = getLevelFromXp(updated.totalXp);
        if (level !== updated.level) {
          await tx.user.update({
            where: { id: userId },
            data: { level },
          });
        }
      }
    });

    const trophy = await prisma.tournamentTrophy.findFirst({
      where: { tournamentId, userId, place },
      include: { user: { select: { id: true, username: true, displayName: true } } },
    });
    return NextResponse.json({ ok: true, trophy });
  } catch (error) {
    console.error('Error awarding trophy:', error);
    return NextResponse.json({ error: 'Failed to award trophy' }, { status: 500 });
  }
}
