import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';
import { getUser } from '@/lib/supabase/server';

// Public profile (logs, achievements, counts). Private = minimal.
// When viewer is admin, response includes viewed user's isAdmin (so UI can show Promote/Remove admin).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
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
        challengeLogs: {
          include: {
            challenge: true,
            map: {
              include: {
                game: true,
              },
            },
          },
          orderBy: {
            roundReached: 'desc',
          },
        },
        easterEggLogs: {
          include: {
            easterEgg: true,
            map: {
              include: {
                game: true,
              },
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: 'desc',
          },
        },
        _count: {
          select: {
            challengeLogs: true,
            easterEggLogs: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalXp = user.totalXp ?? 0;
    const level = getLevelFromXp(totalXp).level;

    if (!user.isPublic) {
      const privatePayload = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        avatarPreset: user.avatarPreset,
        level,
        totalXp,
        isPublic: false,
        ...(viewerIsAdmin && { isAdmin: user.isAdmin }),
      };
      return NextResponse.json(privatePayload);
    }

    const payload = { ...user, level, totalXp } as Record<string, unknown>;
    if (!viewerIsAdmin) {
      delete payload.isAdmin;
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

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
