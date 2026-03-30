import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import { getUser } from '@/lib/supabase/server';
import { computeUserStats, type UserWithLogs } from '@/lib/user-stats';
import { computeWorldRecords } from '@/lib/world-records';

function getCachedWorldRecords(profileStatBlocks: unknown): {
  worldRecords: number;
  verifiedWorldRecords: number;
} | null {
  if (!profileStatBlocks || typeof profileStatBlocks !== 'object') return null;
  const cache = (profileStatBlocks as { worldRecordsCache?: unknown }).worldRecordsCache;
  if (!cache || typeof cache !== 'object') return null;
  const worldRecords = (cache as { worldRecords?: unknown }).worldRecords;
  const verifiedWorldRecords = (cache as { verifiedWorldRecords?: unknown }).verifiedWorldRecords;
  if (typeof worldRecords !== 'number' || typeof verifiedWorldRecords !== 'number') return null;
  return { worldRecords, verifiedWorldRecords };
}

// Public profile (logs, achievements, counts). Private = minimal.
// ?withStats=true returns profile + stats in one response to reduce connection usage.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const withStats = request.nextUrl.searchParams.get('withStats') === 'true';
    const hideCustom = request.nextUrl.searchParams.get('hideCustom') === '1';

    const viewerSupabase = await getUser();
    let viewerId: string | null = null;
    let viewerIsAdmin = false;
    if (viewerSupabase) {
      const viewer = await prisma.user.findUnique({
        where: { supabaseId: viewerSupabase.id },
        select: { id: true, isAdmin: true },
      });
      viewerId = viewer?.id ?? null;
      viewerIsAdmin = viewer?.isAdmin ?? false;
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            challengeLogs: true,
            easterEggLogs: true,
            userAchievements: true,
          },
        },
        ...(withStats && {
          challengeLogs: {
            ...(hideCustom && { where: { map: { game: { shortName: { not: 'BO3_CUSTOM' } } } } }),
            include: {
              challenge: true,
              map: { include: { game: true } },
            },
          },
          easterEggLogs: {
            ...(hideCustom && { where: { map: { game: { shortName: { not: 'BO3_CUSTOM' } } } } }),
            include: {
              easterEgg: true,
              map: { include: { game: true } },
            },
          },
        }),
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isArchived && !viewerIsAdmin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalXp = user.totalXp ?? 0;
    const verifiedTotalXp = user.verifiedTotalXp ?? 0;
    const level = getLevelFromXp(totalXp).level;
    const verifiedLevel = getLevelFromXp(verifiedTotalXp).level;

    if (!user.isPublic) {
      const privatePayload = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        avatarPreset: user.avatarPreset,
        level,
        totalXp,
        verifiedLevel,
        verifiedTotalXp,
        isPublic: false,
        ...(viewerIsAdmin && {
          isAdmin: user.isAdmin,
          isEasterEggAdmin: user.isEasterEggAdmin,
          isContributor: user.isContributor,
        }),
      };
      return NextResponse.json(privatePayload);
    }

    const payload = { ...user, level, totalXp, verifiedLevel, verifiedTotalXp } as Record<string, unknown>;
    if (!viewerIsAdmin) {
      delete payload.isAdmin;
      delete payload.isEasterEggAdmin;
      delete payload.isContributor;
    }

    const friendCount = await prisma.friendRequest.count({
      where: {
        status: 'ACCEPTED',
        OR: [{ fromUserId: user.id }, { toUserId: user.id }],
      },
    });
    payload.friendCount = friendCount;

    let friendshipStatus: 'friends' | 'pending_sent' | 'pending_received' | null = null;
    let friendRequestId: string | undefined;
    if (viewerId && viewerId !== user.id) {
      const fr = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromUserId: viewerId, toUserId: user.id },
            { fromUserId: user.id, toUserId: viewerId },
          ],
        },
        select: { id: true, status: true, fromUserId: true },
      });
      if (fr) {
        if (fr.status === 'ACCEPTED') friendshipStatus = 'friends';
        else if (fr.status === 'PENDING') {
          if (fr.fromUserId === viewerId) friendshipStatus = 'pending_sent';
          else {
            friendshipStatus = 'pending_received';
            friendRequestId = fr.id;
          }
        }
      }
    }
    payload.friendshipStatus = friendshipStatus;
    if (friendRequestId) payload.friendRequestId = friendRequestId;

    if (withStats && 'challengeLogs' in user && 'easterEggLogs' in user) {
      const stats = await computeUserStats(user as unknown as UserWithLogs, hideCustom);
      try {
        const records = await computeWorldRecords(user.id);
        stats.worldRecords = records.worldRecords;
        stats.verifiedWorldRecords = records.verifiedWorldRecords;
      } catch {
        const cached = getCachedWorldRecords(user.profileStatBlocks);
        if (cached) {
          stats.worldRecords = cached.worldRecords;
          stats.verifiedWorldRecords = cached.verifiedWorldRecords;
        }
      }
      Object.assign(payload, stats);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
