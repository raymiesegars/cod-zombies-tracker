import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

// Map detail: challenges, EEs, achievements. If logged in, we include which ones they’ve unlocked.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      include: {
        game: true,
        challenges: {
          where: { isActive: true },
          orderBy: { type: 'asc' },
        },
        easterEggs: {
          where: { isActive: true },
          orderBy: [{ type: 'asc' }, { id: 'asc' }],
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
        achievements: {
          where: { isActive: true },
          orderBy: { slug: 'asc' },
        },
      },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const supabaseUser = await getUser();
    let unlockedAchievementIds: string[] = [];
    if (supabaseUser) {
      const user = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        select: { id: true },
      });
      if (user) {
        const unlocked = await prisma.userAchievement.findMany({
          where: {
            userId: user.id,
            achievement: { mapId: map.id },
          },
          select: { achievementId: true },
        });
        unlockedAchievementIds = unlocked.map((u) => u.achievementId);
      }
    }

    return NextResponse.json({
      ...map,
      unlockedAchievementIds,
    });
  } catch (error) {
    console.error('Error fetching map:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
