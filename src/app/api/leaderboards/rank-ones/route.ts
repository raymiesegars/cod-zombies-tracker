import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import { getRankOneCountsByScope, computeScopedRankOneCountsByUserId, type RankOneRunScope } from '@/lib/world-records';
import type { PlayerCount } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const SEARCH_LIMIT = 100;

type Row = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
  totalXp: number;
  worldRecords: number;
  verifiedWorldRecords: number;
  rank: number;
};

type ProfileBlocksWithCache = {
  selectedBlockIds?: unknown;
  worldRecordsCache?: {
    worldRecords?: unknown;
    verifiedWorldRecords?: unknown;
    updatedAt?: unknown;
  };
};

function getCachedWorldRecords(blocks: unknown): { worldRecords: number; verifiedWorldRecords: number } | null {
  if (!blocks || typeof blocks !== 'object') return null;
  const cache = (blocks as ProfileBlocksWithCache).worldRecordsCache;
  if (!cache || typeof cache !== 'object') return null;
  const worldRecords = cache.worldRecords;
  const verifiedWorldRecords = cache.verifiedWorldRecords;
  if (typeof worldRecords !== 'number' || typeof verifiedWorldRecords !== 'number') return null;
  return { worldRecords, verifiedWorldRecords };
}

async function persistRankOneCache(rows: Row[]): Promise<void> {
  if (rows.length === 0) return;
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    select: { id: true, profileStatBlocks: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  const updates: Array<Promise<unknown>> = [];

  for (const row of rows) {
    const user = byId.get(row.id);
    if (!user) continue;
    const cached = getCachedWorldRecords(user.profileStatBlocks);
    if (
      cached &&
      cached.worldRecords === row.worldRecords &&
      cached.verifiedWorldRecords === row.verifiedWorldRecords
    ) {
      continue;
    }
    const existing =
      user.profileStatBlocks && typeof user.profileStatBlocks === 'object'
        ? (user.profileStatBlocks as Record<string, unknown>)
        : {};
    const selectedBlockIds = Array.isArray(existing.selectedBlockIds) ? existing.selectedBlockIds : undefined;
    const merged: Record<string, unknown> = {
      ...existing,
      ...(selectedBlockIds ? { selectedBlockIds } : {}),
      worldRecordsCache: {
        worldRecords: row.worldRecords,
        verifiedWorldRecords: row.verifiedWorldRecords,
        updatedAt: new Date().toISOString(),
      },
    };
    updates.push(
      prisma.user.update({
        where: { id: row.id },
        data: { profileStatBlocks: merged as never },
      })
    );
  }
  if (updates.length > 0) {
    await Promise.allSettled(updates);
  }
}

function assignCompetitionRanks(rows: Row[], valueKey: 'worldRecords' | 'verifiedWorldRecords'): Row[] {
  let rank = 1;
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i]![valueKey];
    if (i > 0 && v < rows[i - 1]![valueKey]) rank = i + 1;
    rows[i]!.rank = rank;
  }
  return rows;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQ = searchParams.get('search')?.trim() ?? '';
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
    const verifiedOnly = searchParams.get('verified') === '1' || searchParams.get('verified') === 'true';
    const gameId = searchParams.get('gameId')?.trim() || null;
    const mapId = searchParams.get('mapId')?.trim() || null;
    const runScopeRaw = searchParams.get('runScope')?.trim();
    const runScope: RankOneRunScope =
      runScopeRaw === 'nonSpeedrun' || runScopeRaw === 'speedrun' || runScopeRaw === 'eeSpeedrun'
        ? runScopeRaw
        : 'all';
    const isGlobalScope = !gameId && !mapId;
    const valueKey: 'worldRecords' | 'verifiedWorldRecords' = verifiedOnly ? 'verifiedWorldRecords' : 'worldRecords';
    if (mapId && gameId) {
      const map = await prisma.map.findFirst({ where: { id: mapId, gameId }, select: { id: true } });
      if (!map) {
        return NextResponse.json(
          { error: 'mapId does not belong to gameId' },
          { status: 400, headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
        );
      }
    }

    const counts =
      runScope === 'all'
        ? await getRankOneCountsByScope({ gameId, mapId })
        : await computeScopedRankOneCountsByUserId({ gameId, mapId }, { runScope });

    const rankedUserIds: string[] = [];
    counts.forEach((c, userId) => {
      if (valueKey === 'verifiedWorldRecords') {
        if (c.verifiedWorldRecords > 0) rankedUserIds.push(userId);
      } else if (c.worldRecords > 0) {
        rankedUserIds.push(userId);
      }
    });

    if (rankedUserIds.length === 0) {
      return NextResponse.json(
        { total: 0, entries: [] },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: rankedUserIds },
        isPublic: true,
        isArchived: false,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarPreset: true,
        totalXp: true,
      },
    });

    let rows: Row[] = users.map((u) => {
      const c = counts.get(u.id);
      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        avatarPreset: u.avatarPreset,
        totalXp: u.totalXp,
        worldRecords: c?.worldRecords ?? 0,
        verifiedWorldRecords: c?.verifiedWorldRecords ?? 0,
        rank: 0,
      };
    });

    rows.sort((a, b) => {
      const va = a[valueKey];
      const vb = b[valueKey];
      if (vb !== va) return vb - va;
      return a.id.localeCompare(b.id);
    });
    assignCompetitionRanks(rows, valueKey);

    if (searchQ.length > 0) {
      const q = searchQ.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.username.toLowerCase().includes(q) ||
          (r.displayName && r.displayName.toLowerCase().includes(q))
      );
      const sliced = rows.slice(0, SEARCH_LIMIT);
      if (isGlobalScope && runScope === 'all' && counts.size > 0) await persistRankOneCache(sliced);
      const entries = sliced.map((user) => {
        const val = user[valueKey];
        const level = getLevelFromXp(user.totalXp).level;
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
          value: val,
          playerCount: 'SOLO' as PlayerCount,
          proofUrl: null as string | null,
          completedAt: new Date(0),
        };
      });
      return NextResponse.json(
        { total: rows.length, entries },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
      );
    }

    const total = rows.length;
    const page = rows.slice(offset, offset + limit);
    if (isGlobalScope && runScope === 'all' && counts.size > 0) await persistRankOneCache(page);
    const entries = page.map((user) => {
      const val = user[valueKey];
      const level = getLevelFromXp(user.totalXp).level;
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
        value: val,
        playerCount: 'SOLO' as PlayerCount,
        proofUrl: null as string | null,
        completedAt: new Date(0),
      };
    });

    return NextResponse.json(
      { total, entries },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching rank-ones leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
