import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isSpeedrunChallengeType } from '@/lib/iw';

export const dynamic = 'force-dynamic';

/** GET: Leaderboard for this tournament. Query: search (player name), verified (true = verified only). Returns best run per user, sorted by rank. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        challenge: { select: { type: true } },
        map: { select: { id: true } },
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const verifiedOnly = searchParams.get('verified') === 'true';

    const logs = await prisma.tournamentLog.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
            totalXp: true,
          },
        },
        challengeLog: {
          select: {
            id: true,
            roundReached: true,
            completionTimeSeconds: true,
            killsReached: true,
            scoreReached: true,
            isVerified: true,
            playerCount: true,
          },
        },
        easterEggLog: {
          select: {
            id: true,
            roundCompleted: true,
            completionTimeSeconds: true,
            isVerified: true,
            playerCount: true,
          },
        },
      },
    });

    let filtered = logs.filter((t) => {
      if (t.challengeLog && verifiedOnly && !t.challengeLog.isVerified) return false;
      if (t.easterEggLog && verifiedOnly && !t.easterEggLog.isVerified) return false;
      if (search) {
        const name = (t.user.displayName || t.user.username || '').toLowerCase();
        const un = (t.user.username || '').toLowerCase();
        const q = search.toLowerCase();
        if (!name.includes(q) && !un.includes(q)) return false;
      }
      return true;
    });

    const challengeType = tournament.challenge?.type;
    const isSpeedrun = challengeType ? isSpeedrunChallengeType(challengeType) : true;
    const isNoMansLand = challengeType === 'NO_MANS_LAND';
    const isRush = challengeType === 'RUSH';

    type Entry = {
      user: (typeof logs)[0]['user'];
      roundReached?: number;
      completionTimeSeconds?: number | null;
      killsReached?: number | null;
      scoreReached?: number | null;
      logId: string;
      isVerified: boolean;
      playerCount: string;
    };
    const byUser = new Map<string, Entry>();

    for (const t of filtered) {
      const uid = t.userId;
      const existing = byUser.get(uid);
      if (t.challengeLog) {
        const round = t.challengeLog.roundReached;
        const time = t.challengeLog.completionTimeSeconds ?? undefined;
        const kills = t.challengeLog.killsReached ?? undefined;
        const score = t.challengeLog.scoreReached ?? undefined;
        let better = false;
        if (!existing) {
          better = true;
        } else if (isSpeedrun) {
          better = time != null && (existing.completionTimeSeconds == null || time < (existing.completionTimeSeconds ?? 1e9));
        } else if (isNoMansLand) {
          better = (kills ?? 0) > (existing.killsReached ?? 0);
        } else if (isRush) {
          better = (score ?? 0) > (existing.scoreReached ?? 0);
        } else {
          better = (round ?? 0) > (existing.roundReached ?? 0);
        }
        if (better) {
          byUser.set(uid, {
            user: t.user,
            roundReached: round ?? undefined,
            completionTimeSeconds: time,
            killsReached: kills,
            scoreReached: score,
            logId: t.challengeLog.id,
            isVerified: t.challengeLog.isVerified,
            playerCount: t.challengeLog.playerCount,
          });
        }
      } else if (t.easterEggLog) {
        const time = t.easterEggLog.completionTimeSeconds ?? undefined;
        const round = t.easterEggLog.roundCompleted ?? undefined;
        const better = !existing
          ? true
          : time != null && (existing.completionTimeSeconds == null || time < (existing.completionTimeSeconds ?? 1e9));
        if (better) {
          byUser.set(uid, {
            user: t.user,
            roundReached: round ?? undefined,
            completionTimeSeconds: time,
            logId: t.easterEggLog.id,
            isVerified: t.easterEggLog.isVerified,
            playerCount: t.easterEggLog.playerCount,
          });
        }
      }
    }

    const entries = Array.from(byUser.entries()).map(([_, v]) => v);
    if (isSpeedrun) {
      entries.sort((a, b) => {
        const ta = a.completionTimeSeconds ?? 1e9;
        const tb = b.completionTimeSeconds ?? 1e9;
        return ta - tb;
      });
    } else if (isNoMansLand) {
      entries.sort((a, b) => (b.killsReached ?? 0) - (a.killsReached ?? 0));
    } else if (isRush) {
      entries.sort((a, b) => (b.scoreReached ?? 0) - (a.scoreReached ?? 0));
    } else {
      entries.sort((a, b) => (b.roundReached ?? 0) - (a.roundReached ?? 0));
    }

    const trophies = await prisma.tournamentTrophy.findMany({
      where: { tournamentId },
      select: { userId: true, place: true },
    });
    const trophyByUser = new Map<string, number>();
    for (const t of trophies) {
      trophyByUser.set(t.userId, t.place);
    }

    const ranked = entries.map((e, i) => ({
      rank: i + 1,
      user: e.user,
      roundReached: e.roundReached,
      completionTimeSeconds: e.completionTimeSeconds,
      killsReached: e.killsReached,
      scoreReached: e.scoreReached,
      logId: e.logId,
      isVerified: e.isVerified,
      playerCount: e.playerCount,
      trophyPlace: trophyByUser.get(e.user.id) ?? null,
    }));

    return NextResponse.json({ entries: ranked, total: ranked.length });
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
