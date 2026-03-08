import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const limit = 10;
    const users = await prisma.user.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarPreset: true,
        level: true,
        mysteryBoxCompletionsLifetime: true,
      },
      orderBy: { mysteryBoxCompletionsLifetime: 'desc' },
      take: limit,
    });

    const entries = users
      .filter((u) => (u.mysteryBoxCompletionsLifetime ?? 0) > 0)
      .map((u, i) => ({
        rank: i + 1,
        user: {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          avatarPreset: u.avatarPreset,
          level: u.level ?? 1,
        },
        completions: u.mysteryBoxCompletionsLifetime ?? 0,
      }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching mystery box leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
