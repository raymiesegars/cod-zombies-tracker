import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import { computeRankOneCountsByUserId } from '@/lib/world-records';
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
    const valueKey: 'worldRecords' | 'verifiedWorldRecords' = verifiedOnly ? 'verifiedWorldRecords' : 'worldRecords';

    const counts = await computeRankOneCountsByUserId();

    const users = await prisma.user.findMany({
      where: { isPublic: true },
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
