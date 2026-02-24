import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

/** GET /api/users/[username]/easter-eggs-overview
 * Returns all main-quest Easter eggs with done/not done and log ID for linking.
 * Uses achievements (EASTER_EGG_COMPLETE) for done count to match the profile block; logId is included when user has a log for that EE.
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

    // Use achievements (checkboxes) for done count, matching the profile block.
    // Include ALL EASTER_EGG_COMPLETE achievements; some may have easterEggId null (legacy/balance patches).
    const userEeAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        achievement: { type: 'EASTER_EGG_COMPLETE', isActive: true },
      },
      select: { achievement: { select: { easterEggId: true, mapId: true } } },
    });
    const eeIdsWithAchievement = new Set<string>();
    for (const ua of userEeAchievements) {
      const ach = ua.achievement;
      if (ach.easterEggId) {
        eeIdsWithAchievement.add(ach.easterEggId);
      } else if (ach.mapId) {
        // Fallback: achievement has mapId but no easterEggId (legacy); add main EE(s) for that map
        for (const e of allMainEes) {
          if (e.mapId === ach.mapId) eeIdsWithAchievement.add(e.id);
        }
      }
    }

    // Optional: get most recent log per EE for linking (user may have logged or only checked the box)
    const userEeLogs = await prisma.easterEggLog.findMany({
      where: {
        userId: user.id,
        easterEggId: { in: allMainEes.map((e) => e.id) },
      },
      select: { id: true, easterEggId: true },
      orderBy: { completedAt: 'desc' },
    });
    const logByEeId = new Map<string, string>();
    for (const log of userEeLogs) {
      if (!logByEeId.has(log.easterEggId)) logByEeId.set(log.easterEggId, log.id);
    }

    const done = allMainEes.filter((e) => eeIdsWithAchievement.has(e.id)).map((e) => ({
      id: e.id,
      name: e.name,
      mapId: e.map.id,
      mapName: e.map.name,
      mapSlug: e.map.slug,
      gameShortName: e.map.game?.shortName ?? null,
      logId: logByEeId.get(e.id),
    }));

    const notDone = allMainEes
      .filter((e) => !eeIdsWithAchievement.has(e.id))
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
