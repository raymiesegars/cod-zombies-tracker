import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PlayerCount, ChallengeType, Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url);
  const playerCount = searchParams.get('playerCount') as PlayerCount | null;
  const challengeType = searchParams.get('challengeType') as ChallengeType | null;
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));

  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const whereClause: Prisma.ChallengeLogWhereInput = {
      mapId: map.id,
    };

    if (playerCount) {
      whereClause.playerCount = playerCount;
    }

    if (challengeType) {
      whereClause.challenge = { type: challengeType };
    }

    // Fetch extra then dedupe by user+playerCount so we keep one best per person
    const logs = await prisma.challengeLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
          },
        },
        challenge: true,
      },
      orderBy: {
        roundReached: 'desc',
      },
      take: limit * 2,
    });

    // One entry per user per playerCount, keep highest round
    const userBestMap = new Map<string, typeof logs[0]>();
    
    for (const log of logs) {
      const key = `${log.userId}-${log.playerCount}`;
      const existing = userBestMap.get(key);
      
      if (!existing || log.roundReached > existing.roundReached) {
        userBestMap.set(key, log);
      }
    }

    const uniqueLogs = Array.from(userBestMap.values())
      .sort((a, b) => b.roundReached - a.roundReached)
      .slice(0, limit);

    const leaderboard = uniqueLogs.map((log, index) => ({
      rank: index + 1,
      user: log.user,
      value: log.roundReached,
      playerCount: log.playerCount,
      proofUrl: log.proofUrl,
      completedAt: log.completedAt,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
