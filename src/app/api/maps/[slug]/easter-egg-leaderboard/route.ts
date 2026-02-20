import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBo4Game } from '@/lib/bo4';
import { BO4_DIFFICULTIES } from '@/lib/bo4';
import type { PlayerCount, Bo4Difficulty, Prisma } from '@prisma/client';

/**
 * GET /api/maps/[slug]/easter-egg-leaderboard?easterEggId=xxx&playerCount=&difficulty=&search=&offset=&limit=
 * Returns completion-time leaderboard for a specific easter egg on the map.
 * Entries ordered by completionTimeSeconds ASC (shortest first).
 * Only logs with completionTimeSeconds set are included.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url);
  const easterEggId = searchParams.get('easterEggId');
  const playerCount = searchParams.get('playerCount') as PlayerCount | null;
  const difficulty = searchParams.get('difficulty') as Bo4Difficulty | null;
  const searchQ = searchParams.get('search')?.trim() ?? '';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const limitParam = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '25', 10) || 25));
  const offsetParam = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);

  if (!easterEggId) {
    return NextResponse.json({ error: 'easterEggId is required' }, { status: 400 });
  }

  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      select: { id: true, game: { select: { shortName: true } } },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const ee = await prisma.easterEgg.findUnique({
      where: { id: easterEggId, mapId: map.id },
      select: { id: true, name: true },
    });
    if (!ee) {
      return NextResponse.json({ error: 'Easter egg not found for this map' }, { status: 404 });
    }

    const whereClause: Prisma.EasterEggLogWhereInput = {
      mapId: map.id,
      easterEggId: ee.id,
      completionTimeSeconds: { not: null },
      ...(verifiedOnly && { isVerified: true }),
    };
    if (playerCount) whereClause.playerCount = playerCount;
    if (isBo4Game(map.game?.shortName) && difficulty && BO4_DIFFICULTIES.includes(difficulty as any)) {
      whereClause.difficulty = difficulty;
    }

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
    }

    const logs = await prisma.easterEggLog.findMany({
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
      },
      orderBy: { completionTimeSeconds: 'asc' },
      skip: offsetParam,
      take: limitParam,
    });

    const total = await prisma.easterEggLog.count({ where: whereClause });

    const entries = logs.map((log, index) => ({
      rank: offsetParam + index + 1,
      user: log.user,
      value: log.completionTimeSeconds!,
      roundCompleted: log.roundCompleted ?? undefined,
      playerCount: log.playerCount,
      proofUrls: log.proofUrls ?? [],
      proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
      completedAt: log.completedAt,
      logId: log.id,
      runType: 'easter-egg' as const,
      isVerified: log.isVerified ?? false,
    }));

    return NextResponse.json({ total, entries, easterEggName: ee.name });
  } catch (error) {
    console.error('Error fetching easter egg time leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
