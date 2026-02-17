import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dev only – quick DB counts. 404 in prod.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  try {
    const [achievementCount, mapCount, userCount, challengeCount] = await Promise.all([
      prisma.achievement.count({ where: { isActive: true, mapId: { not: null } } }),
      prisma.map.count(),
      prisma.user.count(),
      prisma.challenge.count({ where: { isActive: true } }),
    ]);

    const sampleAchievement = await prisma.achievement.findFirst({
      where: { isActive: true, mapId: { not: null } },
      select: { id: true, name: true, slug: true, mapId: true },
    });

    return NextResponse.json({
      ok: true,
      message: 'DB diagnostic (app Prisma connection)',
      counts: {
        achievements: achievementCount,
        maps: mapCount,
        users: userCount,
        challenges: challengeCount,
      },
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
        DIRECT_URL: process.env.DIRECT_URL ? 'set' : 'missing',
      },
      sampleAchievement: sampleAchievement ?? null,
    });
  } catch (error) {
    console.error('[debug/db]', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
