import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp } from '@/lib/ranks';

// Public profile (logs, achievements, counts). Private = minimal.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
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
      return NextResponse.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        level,
        totalXp,
        isPublic: false,
      });
    }

    return NextResponse.json({ ...user, level, totalXp });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
