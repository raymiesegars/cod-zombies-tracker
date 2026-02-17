import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// List a user's runs on a map (for viewing another user's profile). User must be public.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; mapSlug: string }> }
) {
  try {
    const { username, mapSlug } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
    });
    if (!user || !user.isPublic) {
      return NextResponse.json({ error: 'User not found or profile is private' }, { status: 404 });
    }

    const map = await prisma.map.findUnique({
      where: { slug: mapSlug },
      select: { id: true },
    });
    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const includeChallenge = {
      challenge: true,
      map: { include: { game: true } },
    };
    const includeEasterEgg = {
      easterEgg: true,
      map: { include: { game: true } },
    };

    const [challengeLogs, easterEggLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        where: { userId: user.id, mapId: map.id },
        include: includeChallenge,
        orderBy: { roundReached: 'desc' },
      }),
      prisma.easterEggLog.findMany({
        where: { userId: user.id, mapId: map.id },
        include: includeEasterEgg,
        orderBy: [{ roundCompleted: 'desc' }, { completedAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({ challengeLogs, easterEggLogs });
  } catch (error) {
    console.error('Error fetching user map runs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
