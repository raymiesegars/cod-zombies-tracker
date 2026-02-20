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
    let viewerIsAdmin = false;
    if (viewerSupabase) {
      const viewer = await prisma.user.findUnique({
        where: { supabaseId: viewerSupabase.id },
        select: { isAdmin: true },
      });
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

    const payload = { ...user, level, totalXp };
    if (!viewerIsAdmin) {
      delete (payload as { isAdmin?: boolean }).isAdmin;
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
