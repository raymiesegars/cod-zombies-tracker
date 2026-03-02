import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { getLevelFromXp } from '@/lib/ranks';
import { isSpeedrunChallengeType } from '@/lib/iw';

const XP_BY_PLACE: Record<number, number> = {
  1: 30_000,
  2: 15_000,
  3: 7_500,
};

export const dynamic = 'force-dynamic';

/** POST: Award gold/silver/bronze to top 3 (by verified leaderboard). Super admin only. Idempotent: if already awarded, returns current state. */
export async function POST(
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

    const { id: tournamentId } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        challenge: { select: { type: true } },
        trophies: true,
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    if (tournament.trophies.length >= 3) {
      return NextResponse.json({
        message: 'Trophies already awarded',
        trophies: tournament.trophies,
      });
    }

    const logs = await prisma.tournamentLog.findMany({
      where: { tournamentId },
      include: {
        user: { select: { id: true } },
        challengeLog: {
          select: {
            roundReached: true,
            completionTimeSeconds: true,
            isVerified: true,
          },
        },
        easterEggLog: {
          select: {
            roundCompleted: true,
            completionTimeSeconds: true,
            isVerified: true,
          },
        },
      },
    });

    const verified = logs.filter((t) => {
      if (t.challengeLog) return t.challengeLog.isVerified;
      if (t.easterEggLog) return t.easterEggLog.isVerified;
      return false;
    });

    const isSpeedrun = tournament.challenge
      ? isSpeedrunChallengeType(tournament.challenge.type)
      : true;
    const byUser = new Map<
      string,
      { roundReached?: number; completionTimeSeconds?: number | null }
    >();
    for (const t of verified) {
      const uid = t.userId;
      const existing = byUser.get(uid);
      if (t.challengeLog) {
        const round = t.challengeLog.roundReached;
        const time = t.challengeLog.completionTimeSeconds ?? undefined;
        const better = !existing
          ? true
          : isSpeedrun
            ? (time != null && (existing.completionTimeSeconds == null || time < existing.completionTimeSeconds))
            : (round > (existing.roundReached ?? 0));
        if (better) byUser.set(uid, { roundReached: round, completionTimeSeconds: time });
      } else if (t.easterEggLog) {
        const time = t.easterEggLog.completionTimeSeconds ?? undefined;
        const better = !existing
          ? true
          : time != null && (existing.completionTimeSeconds == null || time < (existing.completionTimeSeconds ?? 1e9));
        if (better) byUser.set(uid, { completionTimeSeconds: time });
      }
    }

    const entries = Array.from(byUser.entries()).map(([userId, v]) => ({ userId, ...v }));
    if (isSpeedrun) {
      entries.sort((a, b) => ((a.completionTimeSeconds ?? 1e9) - (b.completionTimeSeconds ?? 1e9)));
    } else {
      entries.sort((a, b) => (b.roundReached ?? 0) - (a.roundReached ?? 0));
    }
    const top3 = entries.slice(0, 3).map((e) => e.userId);
    if (top3.length === 0) {
      return NextResponse.json({ error: 'No verified runs to award' }, { status: 400 });
    }

    const existingPlaces = new Set(tournament.trophies.map((t) => t.place));
    await prisma.$transaction(async (tx) => {
      for (let place = 1; place <= top3.length; place++) {
        if (existingPlaces.has(place)) continue;
        const userId = top3[place - 1]!;
        const xp = XP_BY_PLACE[place] ?? 0;
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
      }
    });

    const trophies = await prisma.tournamentTrophy.findMany({
      where: { tournamentId },
      include: { user: { select: { id: true, username: true, displayName: true } } },
    });
    return NextResponse.json({ ok: true, trophies });
  } catch (error) {
    console.error('Error awarding trophies:', error);
    return NextResponse.json({ error: 'Failed to award trophies' }, { status: 500 });
  }
}
