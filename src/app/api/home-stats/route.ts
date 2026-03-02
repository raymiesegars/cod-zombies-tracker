import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60;

/** Lightweight counts for home page hero: maps, users, achievements (active), total runs (challenge + EE logs). */
export async function GET() {
  try {
    const [maps, users, achievements, challengeLogs, easterEggLogs] = await Promise.all([
      prisma.map.count(),
      prisma.user.count(),
      prisma.achievement.count({ where: { isActive: true } }),
      prisma.challengeLog.count(),
      prisma.easterEggLog.count(),
    ]);
    const runs = challengeLogs + easterEggLogs;
    return NextResponse.json(
      { maps, users, achievements, runs },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (error) {
    console.error('Error fetching home stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
