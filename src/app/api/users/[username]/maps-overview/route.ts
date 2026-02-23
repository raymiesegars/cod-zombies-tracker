import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

/** GET /api/users/[username]/maps-overview
 * Returns maps played (with link info) and maps not yet played.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        challengeLogs: { select: { mapId: true } },
        easterEggLogs: { select: { mapId: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
      : null;
    const isOwnProfile = currentUser && currentUser.id === user.id;
    if (!user.isPublic && !isOwnProfile) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    const playedMapIds = new Set<string>();
    for (const log of user.challengeLogs) playedMapIds.add(log.mapId);
    for (const log of user.easterEggLogs) playedMapIds.add(log.mapId);

    const allMaps = await prisma.map.findMany({
      include: { game: { select: { shortName: true, order: true } } },
      orderBy: [{ game: { order: 'asc' } }, { order: 'asc' }],
    });

    const played = allMaps
      .filter((m) => playedMapIds.has(m.id))
      .map((m) => ({
        mapId: m.id,
        mapName: m.name,
        mapSlug: m.slug,
        gameShortName: m.game?.shortName ?? null,
      }));

    const notPlayed = allMaps
      .filter((m) => !playedMapIds.has(m.id))
      .map((m) => ({
        mapId: m.id,
        mapName: m.name,
        mapSlug: m.slug,
        gameShortName: m.game?.shortName ?? null,
      }));

    return NextResponse.json({
      played,
      notPlayed,
      total: allMaps.length,
    });
  } catch (error) {
    console.error('Error fetching maps overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
