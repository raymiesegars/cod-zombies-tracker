import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { computeWorldRecords } from '@/lib/world-records';

type ProfileBlocksWithCache = {
  selectedBlockIds?: unknown;
  worldRecordsCache?: {
    worldRecords?: unknown;
    verifiedWorldRecords?: unknown;
    updatedAt?: unknown;
  };
};

const WR_PROFILE_CACHE_MAX_AGE_MS = 15 * 60 * 1000;

function parseCachedWorldRecords(profileStatBlocks: unknown): {
  worldRecords: number;
  verifiedWorldRecords: number;
  updatedAtMs: number | null;
} | null {
  if (!profileStatBlocks || typeof profileStatBlocks !== 'object') return null;
  const cache = (profileStatBlocks as ProfileBlocksWithCache).worldRecordsCache;
  if (!cache || typeof cache !== 'object') return null;
  const worldRecords = cache.worldRecords;
  const verifiedWorldRecords = cache.verifiedWorldRecords;
  if (typeof worldRecords !== 'number' || typeof verifiedWorldRecords !== 'number') return null;
  const updatedAtRaw = cache.updatedAt;
  const updatedAtMs =
    typeof updatedAtRaw === 'string' && !Number.isNaN(Date.parse(updatedAtRaw))
      ? Date.parse(updatedAtRaw)
      : null;
  return { worldRecords, verifiedWorldRecords, updatedAtMs };
}

/** GET /api/users/[username]/world-records-summary
 * Returns only { worldRecords, verifiedWorldRecords } so the profile page can load fast and fetch this in the background.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true, profileStatBlocks: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPublic) {
      const supabaseUser = await getUser();
      const currentUser = supabaseUser
        ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
        : null;
      const isOwnProfile = currentUser && currentUser.id === user.id;
      if (!isOwnProfile) {
        return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
      }
    }

    const cached = parseCachedWorldRecords(user.profileStatBlocks);
    const isCacheFresh =
      cached?.updatedAtMs != null &&
      Date.now() - cached.updatedAtMs < WR_PROFILE_CACHE_MAX_AGE_MS;
    if (cached && isCacheFresh) {
      return NextResponse.json({
        worldRecords: cached.worldRecords,
        verifiedWorldRecords: cached.verifiedWorldRecords,
      });
    }

    let result;
    try {
      result = await computeWorldRecords(user.id);
    } catch (computeError) {
      if (cached) {
        return NextResponse.json({
          worldRecords: cached.worldRecords,
          verifiedWorldRecords: cached.verifiedWorldRecords,
        });
      }
      throw computeError;
    }
    if (
      cached &&
      cached.worldRecords > 0 &&
      cached.verifiedWorldRecords >= 0 &&
      result.worldRecords === 0 &&
      result.verifiedWorldRecords === 0
    ) {
      return NextResponse.json({
        worldRecords: cached.worldRecords,
        verifiedWorldRecords: cached.verifiedWorldRecords,
      });
    }
    const existingBlocks =
      typeof user.profileStatBlocks === 'object' && user.profileStatBlocks !== null
        ? (user.profileStatBlocks as ProfileBlocksWithCache)
        : {};
    const selectedBlockIds = Array.isArray(existingBlocks.selectedBlockIds)
      ? existingBlocks.selectedBlockIds
      : undefined;
    const mergedBlocks: Record<string, unknown> = {
      ...existingBlocks,
      ...(selectedBlockIds ? { selectedBlockIds } : {}),
      worldRecordsCache: {
        worldRecords: result.worldRecords,
        verifiedWorldRecords: result.verifiedWorldRecords,
        updatedAt: new Date().toISOString(),
      },
    };
    const shouldWriteCache =
      !cached ||
      cached.worldRecords !== result.worldRecords ||
      cached.verifiedWorldRecords !== result.verifiedWorldRecords ||
      !isCacheFresh;
    if (shouldWriteCache) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { profileStatBlocks: mergedBlocks as never },
        });
      } catch {
        // Cache write failures should not fail the endpoint response.
      }
    }

    return NextResponse.json({
      worldRecords: result.worldRecords,
      verifiedWorldRecords: result.verifiedWorldRecords,
    });
  } catch (error) {
    console.error('Error fetching world records summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
