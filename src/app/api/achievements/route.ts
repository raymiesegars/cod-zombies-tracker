import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// List achievements. ?type / ?rarity to filter.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const rarity = searchParams.get('rarity');

  try {
    const achievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        ...(type && { type: type as any }),
        ...(rarity && { rarity: rarity as any }),
      },
      orderBy: [
        { rarity: 'asc' },
        { xpReward: 'asc' },
      ],
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
