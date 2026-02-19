import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBo4Game } from '@/lib/bo4';
import { BO4_DIFFICULTIES } from '@/lib/bo4';
import type { PlayerCount, ChallengeType, Prisma, Bo4Difficulty } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url);
  const playerCount = searchParams.get('playerCount') as PlayerCount | null;
  const challengeType = searchParams.get('challengeType') as ChallengeType | null;
  const difficulty = searchParams.get('difficulty') as Bo4Difficulty | null;
  const searchQ = searchParams.get('search')?.trim() ?? '';
  const limitParam = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '25', 10) || 25));
  const offsetParam = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
  const mergeTake = 500;

  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      select: { id: true, game: { select: { shortName: true } } },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const whereClause: Prisma.ChallengeLogWhereInput = {
      mapId: map.id,
    };

    const eeWhereClause: Prisma.EasterEggLogWhereInput = {
      mapId: map.id,
      roundCompleted: { not: null },
    };

    // Restrict to users matching search (by username/displayName) when search is provided
    if (searchQ.length > 0) {
      const searchUsers = await prisma.user.findMany({
        where: {
          isPublic: true,
          OR: [
            { username: { contains: searchQ, mode: 'insensitive' } },
            { displayName: { contains: searchQ, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      const searchUserIds = searchUsers.map((u) => u.id);
      if (searchUserIds.length === 0) {
        return NextResponse.json({ total: 0, entries: [] });
      }
      whereClause.userId = { in: searchUserIds };
      eeWhereClause.userId = { in: searchUserIds };
    }

    if (playerCount) {
      whereClause.playerCount = playerCount;
      eeWhereClause.playerCount = playerCount;
    }

    if (isBo4Game(map.game?.shortName) && difficulty && BO4_DIFFICULTIES.includes(difficulty as any)) {
      whereClause.difficulty = difficulty;
      eeWhereClause.difficulty = difficulty;
    }

    // "Highest Round" = best round from any challenge or easter egg; other types filter challenge logs only
    if (challengeType && challengeType !== 'HIGHEST_ROUND') {
      whereClause.challenge = { type: challengeType };
    }

    // Fetch challenge logs and easter egg logs (with round), merge by best round per user+playerCount
    const [challengeLogs, eeLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        where: whereClause,
        include: {
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
          challenge: true,
        },
        orderBy: { roundReached: 'desc' },
        take: mergeTake * 2,
      }),
      prisma.easterEggLog.findMany({
        where: eeWhereClause,
        include: {
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
        orderBy: { roundCompleted: 'desc' },
        take: mergeTake * 2,
      }),
    ]);

    type LeaderboardEntry = {
      userId: string;
      playerCount: PlayerCount;
      round: number;
      user: { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; level: number };
      proofUrls: string[];
      proofUrl: string | null;
      completedAt: Date;
    };

    const userBestMap = new Map<string, LeaderboardEntry>();

    for (const log of challengeLogs) {
      const key = `${log.userId}-${log.playerCount}`;
      const existing = userBestMap.get(key);
      if (!existing || log.roundReached > existing.round) {
        userBestMap.set(key, {
          userId: log.userId,
          playerCount: log.playerCount,
          round: log.roundReached,
          user: log.user,
          proofUrls: log.proofUrls ?? [],
          proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
          completedAt: log.completedAt,
        });
      }
    }

    for (const log of eeLogs) {
      const key = `${log.userId}-${log.playerCount}`;
      const round = log.roundCompleted!;
      const existing = userBestMap.get(key);
      if (!existing || round > existing.round) {
        userBestMap.set(key, {
          userId: log.userId,
          playerCount: log.playerCount,
          round,
          user: log.user,
          proofUrls: log.proofUrls ?? [],
          proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
          completedAt: log.completedAt,
        });
      }
    }

    const uniqueLogs = Array.from(userBestMap.values())
      .sort((a, b) => b.round - a.round);

    const total = uniqueLogs.length;
    const entries = uniqueLogs
      .slice(offsetParam, offsetParam + limitParam)
      .map((entry, index) => ({
        rank: offsetParam + index + 1,
        user: entry.user,
        value: entry.round,
        playerCount: entry.playerCount,
        proofUrls: entry.proofUrls,
        proofUrl: entry.proofUrl,
        completedAt: entry.completedAt,
      }));

    return NextResponse.json({ total, entries });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
