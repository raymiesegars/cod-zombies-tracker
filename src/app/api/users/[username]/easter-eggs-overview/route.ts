import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

/** GET /api/users/[username]/easter-eggs-overview
 * Returns all main-quest Easter eggs with done/not done and log ID for linking.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
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

    const allMainEes = await prisma.easterEgg.findMany({
      where: { type: 'MAIN_QUEST', isActive: true },
      include: {
        map: { select: { id: true, name: true, slug: true, game: { select: { shortName: true } } } },
      },
      orderBy: [{ map: { game: { order: 'asc' } } }, { map: { order: 'asc' } }],
    });

    const userEeLogs = await prisma.easterEggLog.findMany({
      where: {
        userId: user.id,
        easterEggId: { in: allMainEes.map((e) => e.id) },
      },
      select: {
        id: true,
        easterEggId: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    // Best (most recent) log per EE for linking
    const logByEeId = new Map<string, string>();
    for (const log of userEeLogs) {
      if (!logByEeId.has(log.easterEggId)) {
        logByEeId.set(log.easterEggId, log.id);
      }
    }

    const done = allMainEes.filter((e) => logByEeId.has(e.id)).map((e) => ({
      id: e.id,
      name: e.name,
      mapId: e.map.id,
      mapName: e.map.name,
      mapSlug: e.map.slug,
      gameShortName: e.map.game?.shortName ?? null,
      logId: logByEeId.get(e.id)!,
    }));

    const notDone = allMainEes
      .filter((e) => !logByEeId.has(e.id))
      .map((e) => ({
        id: e.id,
        name: e.name,
        mapId: e.map.id,
        mapName: e.map.name,
        mapSlug: e.map.slug,
        gameShortName: e.map.game?.shortName ?? null,
      }));

    return NextResponse.json({
      done,
      notDone,
      total: allMainEes.length,
    });
  } catch (error) {
    console.error('Error fetching easter eggs overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
