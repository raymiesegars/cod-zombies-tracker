import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import { Prisma, type PlayerCount } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const SEARCH_LIMIT = 100;

type ScopedXpRow = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
  scopedXp: number;
  rank: number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQ = searchParams.get('search')?.trim() ?? '';
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
    const verifiedOnly = searchParams.get('verified') !== '0' && searchParams.get('verified') !== 'false';
    const gameId = searchParams.get('gameId')?.trim() || null;
    const mapId = searchParams.get('mapId')?.trim() || null;

    if (mapId && gameId) {
      const map = await prisma.map.findFirst({ where: { id: mapId, gameId }, select: { id: true } });
      if (!map) {
        return NextResponse.json(
          { error: 'mapId does not belong to gameId' },
          { status: 400, headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
        );
      }
    }

    const searchPattern = `%${searchQ.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
    const verifiedSql = verifiedOnly ? Prisma.sql`AND ua."verifiedAt" IS NOT NULL` : Prisma.empty;
    const mapSql = mapId ? Prisma.sql`AND COALESCE(a."mapId", ee."mapId") = ${mapId}` : Prisma.empty;
    const gameSql = !mapId && gameId ? Prisma.sql`AND m."gameId" = ${gameId}` : Prisma.empty;
    const searchSql = searchQ
      ? Prisma.sql`AND (u.username ILIKE ${searchPattern} OR u."displayName" ILIKE ${searchPattern})`
      : Prisma.empty;

    const rows = await prisma.$queryRaw<ScopedXpRow[]>`
      WITH scoped AS (
        SELECT
          ua."userId" as user_id,
          SUM(a."xpReward")::int as scoped_xp
        FROM "UserAchievement" ua
        JOIN "Achievement" a ON a.id = ua."achievementId"
        LEFT JOIN "EasterEgg" ee ON ee.id = a."easterEggId"
        JOIN "Map" m ON m.id = COALESCE(a."mapId", ee."mapId")
        WHERE a."isActive" = true
          ${verifiedSql}
          ${mapSql}
          ${gameSql}
        GROUP BY ua."userId"
      ),
      ranked AS (
        SELECT
          u.id,
          u.username,
          u."displayName",
          u."avatarUrl",
          u."avatarPreset",
          s.scoped_xp as "scopedXp",
          RANK() OVER (ORDER BY s.scoped_xp DESC, u.id ASC)::int as rank
        FROM scoped s
        JOIN "User" u ON u.id = s.user_id
        WHERE u."isPublic" = true
          AND u."isArchived" = false
          ${searchSql}
      )
      SELECT *
      FROM ranked
      ORDER BY rank
      LIMIT ${searchQ ? SEARCH_LIMIT : limit}
      OFFSET ${searchQ ? 0 : offset}
    `;

    const totalRows = await prisma.$queryRaw<Array<{ count: bigint }>>`
      WITH scoped AS (
        SELECT
          ua."userId" as user_id,
          SUM(a."xpReward")::int as scoped_xp
        FROM "UserAchievement" ua
        JOIN "Achievement" a ON a.id = ua."achievementId"
        LEFT JOIN "EasterEgg" ee ON ee.id = a."easterEggId"
        JOIN "Map" m ON m.id = COALESCE(a."mapId", ee."mapId")
        WHERE a."isActive" = true
          ${verifiedSql}
          ${mapSql}
          ${gameSql}
        GROUP BY ua."userId"
      )
      SELECT COUNT(*)::bigint AS count
      FROM scoped s
      JOIN "User" u ON u.id = s.user_id
      WHERE u."isPublic" = true
        AND u."isArchived" = false
        ${searchSql}
    `;
    const total = Number(totalRows[0]?.count ?? BigInt(0));

    const entries = rows.map((row) => ({
      rank: row.rank,
      user: {
        id: row.id,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        avatarPreset: row.avatarPreset,
        level: getLevelFromXp(row.scopedXp).level,
      },
      value: row.scopedXp,
      playerCount: 'SOLO' as PlayerCount,
      proofUrl: null as string | null,
      completedAt: new Date(0),
    }));

    return NextResponse.json(
      { total, entries },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching hall-of-fame scoped XP leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
