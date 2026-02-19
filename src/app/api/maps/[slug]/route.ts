import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { sortAchievementsForDisplay } from '@/lib/achievements/categories';

// Map detail: challenges, EEs, achievements. If logged in, we include which ones they’ve unlocked.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
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
      },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    // Achievements: mapId = this map OR easterEgg belongs to this map
    let achievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        OR: [{ mapId: map.id }, { easterEgg: { mapId: map.id } }],
      },
      orderBy: [{ type: 'asc' }, { slug: 'asc' }],
      include: {
        easterEgg: { select: { id: true, name: true, slug: true } },
      },
    });

    const hasSpecificEeAchievement = achievements.some(
      (a) =>
        a.type === 'EASTER_EGG_COMPLETE' &&
        (a.easterEgg?.name !== 'Main Quest' || a.slug !== 'main-quest'),
    );
    if (hasSpecificEeAchievement) {
      achievements = achievements.filter(
        (a) =>
          !(
            a.type === 'EASTER_EGG_COMPLETE' &&
            a.name === 'Main Quest' &&
            a.slug === 'main-quest'
          ),
      );
    }

    achievements = sortAchievementsForDisplay(achievements);

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
            achievement: {
              OR: [{ mapId: map.id }, { easterEgg: { mapId: map.id } }],
            },
          },
          select: { achievementId: true },
        });
        unlockedAchievementIds = unlocked.map((u) => u.achievementId);
      }
    }

    return NextResponse.json({
      ...map,
      achievements,
      unlockedAchievementIds,
    });
  } catch (error) {
    console.error('Error fetching map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
