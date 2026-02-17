import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Your challenge + EE logs. ?mapId to filter.
export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId') ?? undefined;

    const baseWhere = { userId: user.id };
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
        where: mapId ? { ...baseWhere, mapId } : baseWhere,
        include: includeChallenge,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.easterEggLog.findMany({
        where: mapId ? { ...baseWhere, mapId } : baseWhere,
        include: includeEasterEgg,
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ challengeLogs, easterEggLogs });
  } catch (error) {
    console.error('Error fetching my logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
