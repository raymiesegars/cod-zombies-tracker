import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { PlayerCount } from '@prisma/client';

// Always fresh: XP and ranks change frequently
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarPreset: true,
        level: true,
        totalXp: true,
      },
      orderBy: { totalXp: 'desc' },
      take: 500,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      avatarPreset: user.avatarPreset,
        level: user.level,
      },
      value: user.totalXp,
      playerCount: 'SOLO' as PlayerCount,
      proofUrl: null as string | null,
      completedAt: new Date(0),
    }));

    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching rank leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
