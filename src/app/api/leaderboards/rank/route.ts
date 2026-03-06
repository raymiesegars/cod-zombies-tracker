import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import type { PlayerCount } from '@prisma/client';

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
    const verifiedOnly = searchParams.get('verified') === '1' || searchParams.get('verified') === 'true';

    // Server-side search: find all public users matching name/username, return with global rank
    if (searchQ.length > 0) {
      const pattern = `%${searchQ.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      type Row = { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; level: number; totalXp: number; verifiedTotalXp: number; rank: number };
      const rows = verifiedOnly
        ? await prisma.$queryRaw<(Omit<Row, 'level'> & { level?: number })[]>`
            SELECT * FROM (
              SELECT u.id, u.username, u."displayName", u."avatarUrl", u."avatarPreset", u."totalXp", u."verifiedTotalXp",
                RANK() OVER (ORDER BY u."verifiedTotalXp" DESC, u.id ASC)::int as rank
              FROM "User" u
              WHERE u."isPublic" = true
                AND (u.username ILIKE ${pattern} OR u."displayName" ILIKE ${pattern})
            ) sub
            ORDER BY rank
            LIMIT ${SEARCH_LIMIT}
          `
        : await prisma.$queryRaw<Row[]>`
            SELECT * FROM (
              SELECT u.id, u.username, u."displayName", u."avatarUrl", u."avatarPreset", u.level, u."totalXp", u."verifiedTotalXp",
                RANK() OVER (ORDER BY u."totalXp" DESC, u.id ASC)::int as rank
              FROM "User" u
              WHERE u."isPublic" = true
                AND (u.username ILIKE ${pattern} OR u."displayName" ILIKE ${pattern})
            ) sub
            ORDER BY rank
            LIMIT ${SEARCH_LIMIT}
          `;
      const total = rows.length;
      const entries = rows.map((user) => {
        const xp = verifiedOnly ? (user.verifiedTotalXp ?? 0) : user.totalXp;
        return {
          rank: user.rank,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            avatarPreset: user.avatarPreset,
            level: getLevelFromXp(xp).level,
          },
          value: verifiedOnly ? (user.verifiedTotalXp ?? 0) : user.totalXp,
        playerCount: 'SOLO' as PlayerCount,
        proofUrl: null as string | null,
        completedAt: new Date(0),
      };
      });
      return NextResponse.json(
        { total, entries },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
      );
    }

    type RankRow = { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; totalXp: number; verifiedTotalXp: number; rank: number };
    const rows = verifiedOnly
      ? await prisma.$queryRaw<RankRow[]>`
          SELECT * FROM (
            SELECT u.id, u.username, u."displayName", u."avatarUrl", u."avatarPreset", u."totalXp", u."verifiedTotalXp",
              RANK() OVER (ORDER BY u."verifiedTotalXp" DESC, u.id ASC)::int as rank
            FROM "User" u
            WHERE u."isPublic" = true
          ) sub
          ORDER BY rank
          LIMIT ${limit} OFFSET ${offset}
        `
      : await prisma.$queryRaw<RankRow[]>`
          SELECT * FROM (
            SELECT u.id, u.username, u."displayName", u."avatarUrl", u."avatarPreset", u."totalXp", u."verifiedTotalXp",
              RANK() OVER (ORDER BY u."totalXp" DESC, u.id ASC)::int as rank
            FROM "User" u
            WHERE u."isPublic" = true
          ) sub
          ORDER BY rank
          LIMIT ${limit} OFFSET ${offset}
        `;

    const total = await prisma.user.count({ where: { isPublic: true } });
    const entries = rows.map((user) => {
      const xp = verifiedOnly ? (user.verifiedTotalXp ?? 0) : user.totalXp;
      const level = getLevelFromXp(xp).level;
      return {
        rank: user.rank,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          avatarPreset: user.avatarPreset,
          level,
        },
        value: xp,
        playerCount: 'SOLO' as PlayerCount,
        proofUrl: null as string | null,
        completedAt: new Date(0),
      };
    });

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
