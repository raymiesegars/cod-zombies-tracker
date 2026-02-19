import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PlayerCount } from '@prisma/client';

// Always fresh: XP and ranks change frequently
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const SEARCH_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQ = searchParams.get('search')?.trim() ?? '';
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

    // Server-side search: find all public users matching name/username, return with global rank
    if (searchQ.length > 0) {
      const pattern = `%${searchQ.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      type Row = { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; level: number; totalXp: number; rank: number };
      const rows = await prisma.$queryRaw<Row[]>`
        SELECT u.id, u.username, u."displayName", u."avatarUrl", u."avatarPreset", u.level, u."totalXp",
          (SELECT COUNT(*)::int + 1 FROM "User" u2 WHERE u2."isPublic" = true AND u2."totalXp" > u."totalXp") as rank
        FROM "User" u
        WHERE u."isPublic" = true
          AND (u.username ILIKE ${pattern} OR u."displayName" ILIKE ${pattern})
        ORDER BY u."totalXp" DESC
        LIMIT ${SEARCH_LIMIT}
      `;
      const total = rows.length;
      const entries = rows.map((user) => ({
        rank: user.rank,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          avatarPreset: user.avatarPreset,
          level: user.level,
        },
        value: user.totalXp,
        playerCount: 'SOLO' as PlayerCount,
        proofUrl: null as string | null,
        completedAt: new Date(0),
      }));
      return NextResponse.json(
        { total, entries },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
      );
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: { isPublic: true } }),
      prisma.user.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          avatarPreset: true,
          level: true,
          totalXp: true,
        },
        orderBy: { totalXp: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    const entries = users.map((user, i) => ({
      rank: offset + i + 1,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        avatarPreset: user.avatarPreset,
        level: user.level,
      },
      value: user.totalXp,
      playerCount: 'SOLO' as PlayerCount,
      proofUrl: null as string | null,
      completedAt: new Date(0),
    }));

    return NextResponse.json(
      { total, entries },
      {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching rank leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
