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

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
      : null;
    const isOwnProfile = currentUser && currentUser.id === user.id;
    if (!user.isPublic && !isOwnProfile) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    const result = await computeWorldRecords(user.id);
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
    await prisma.user.update({
      where: { id: user.id },
      data: { profileStatBlocks: mergedBlocks as never },
    });

    return NextResponse.json({
      worldRecords: result.worldRecords,
      verifiedWorldRecords: result.verifiedWorldRecords,
    });
  } catch (error) {
    console.error('Error fetching world records summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
