import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { sortAchievementsForDisplay } from '@/lib/achievements/categories';

// No mapId = completion by game + map list. mapId = achievements for that map + unlocked ids.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId') || undefined;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPublic) {
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const currentUser = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
      });
      if (!currentUser || currentUser.id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const completionRows = await prisma.$queryRaw<
      { gameId: string; gameName: string; shortName: string; order: number; total: bigint; unlocked: bigint }[]
    >`
      SELECT g.id as "gameId", g.name as "gameName", g."shortName", g."order",
        COUNT(a.id)::bigint as total,
        COUNT(ua.id)::bigint as unlocked
      FROM "Game" g
      JOIN "Map" m ON m."gameId" = g.id
      JOIN "Achievement" a ON a."mapId" = m.id AND a."isActive" = true
      LEFT JOIN "UserAchievement" ua ON ua."achievementId" = a.id AND ua."userId" = ${user.id}
      GROUP BY g.id, g.name, g."shortName", g."order"
      ORDER BY g."order"
    `;

    type MapSummaryRow = { mapId: string; mapName: string; mapSlug: string; gameShortName: string | null; gameOrder: number; mapOrder: number; total: bigint; unlocked: bigint };
    let mapSummaryRows: MapSummaryRow[] = [];
    type VerifiedMapSummaryRow = { mapId: string; mapName: string; mapSlug: string; gameShortName: string | null; gameOrder: number; mapOrder: number; total: bigint; unlocked: bigint };
    let verifiedMapSummaryRows: VerifiedMapSummaryRow[] = [];
    let verifiedCompletionRows: { gameId: string; gameName: string; shortName: string; order: number; total: bigint; unlocked: bigint }[] = [];
    if (!mapId) {
      mapSummaryRows = (await prisma.$queryRaw`
        SELECT m.id as "mapId", m.name as "mapName", m.slug as "mapSlug",
          g."shortName" as "gameShortName", g."order" as "gameOrder", m."order" as "mapOrder",
          COUNT(a.id)::bigint as total,
          COUNT(ua.id)::bigint as unlocked
        FROM "Map" m
        JOIN "Game" g ON m."gameId" = g.id
        JOIN "Achievement" a ON a."mapId" = m.id AND a."isActive" = true
        LEFT JOIN "UserAchievement" ua ON ua."achievementId" = a.id AND ua."userId" = ${user.id}
        GROUP BY m.id, m.name, m.slug, g."shortName", g."order", m."order"
        ORDER BY g."order", m."order"
      `) as MapSummaryRow[];
      verifiedCompletionRows = (await prisma.$queryRaw`
        SELECT g.id as "gameId", g.name as "gameName", g."shortName", g."order",
          COUNT(a.id)::bigint as total,
          COUNT(ua.id)::bigint as unlocked
        FROM "Game" g
        JOIN "Map" m ON m."gameId" = g.id
        JOIN "Achievement" a ON a."mapId" = m.id AND a."isActive" = true
        LEFT JOIN "UserAchievement" ua ON ua."achievementId" = a.id AND ua."userId" = ${user.id} AND ua."verifiedAt" IS NOT NULL
        GROUP BY g.id, g.name, g."shortName", g."order"
        ORDER BY g."order"
      `) as { gameId: string; gameName: string; shortName: string; order: number; total: bigint; unlocked: bigint }[];
      verifiedMapSummaryRows = (await prisma.$queryRaw`
        SELECT m.id as "mapId", m.name as "mapName", m.slug as "mapSlug",
          g."shortName" as "gameShortName", g."order" as "gameOrder", m."order" as "mapOrder",
          COUNT(a.id)::bigint as total,
          COUNT(ua.id)::bigint as unlocked
        FROM "Map" m
        JOIN "Game" g ON m."gameId" = g.id
        JOIN "Achievement" a ON a."mapId" = m.id AND a."isActive" = true
        LEFT JOIN "UserAchievement" ua ON ua."achievementId" = a.id AND ua."userId" = ${user.id} AND ua."verifiedAt" IS NOT NULL
        GROUP BY m.id, m.name, m.slug, g."shortName", g."order", m."order"
        ORDER BY g."order", m."order"
      `) as VerifiedMapSummaryRow[];
    }

    const completionByGame = completionRows.map((r) => ({
      gameId: r.gameId,
      gameName: r.gameName,
      shortName: r.shortName,
      order: r.order,
      total: Number(r.total),
      unlocked: Number(r.unlocked),
      percentage: Number(r.total) > 0 ? Math.round((Number(r.unlocked) / Number(r.total)) * 100) : 0,
    }));

    const mapsByGame = await prisma.map.findMany({
      where: { achievements: { some: { isActive: true } } },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        gameId: true,
        game: { select: { id: true, name: true, shortName: true, order: true } },
      },
      orderBy: [{ game: { order: 'asc' } }, { order: 'asc' }],
    });

    const mapsByGameMap = new Map<string, typeof mapsByGame>();
    for (const m of mapsByGame) {
      if (!mapsByGameMap.has(m.gameId)) mapsByGameMap.set(m.gameId, []);
      mapsByGameMap.get(m.gameId)!.push(m);
    }

    if (!mapId) {
      const summaryByMap = mapSummaryRows.map((r) => ({
        mapId: r.mapId,
        mapName: r.mapName,
        mapSlug: r.mapSlug,
        gameShortName: r.gameShortName,
        total: Number(r.total),
        unlocked: Number(r.unlocked),
      }));
      const verifiedSummaryByMap = verifiedMapSummaryRows.map((r) => ({
        mapId: r.mapId,
        mapName: r.mapName,
        mapSlug: r.mapSlug,
        gameShortName: r.gameShortName,
        total: Number(r.total),
        unlocked: Number(r.unlocked),
      }));
      const verifiedCompletionByGame = verifiedCompletionRows.map((r) => ({
        gameId: r.gameId,
        gameName: r.gameName,
        shortName: r.shortName,
        order: r.order,
        total: Number(r.total),
        unlocked: Number(r.unlocked),
        percentage: Number(r.total) > 0 ? Math.round((Number(r.unlocked) / Number(r.total)) * 100) : 0,
      }));
    const verifiedAchievementsTotal = await prisma.userAchievement.count({
      where: { userId: user.id, verifiedAt: { not: null } },
    });

    return NextResponse.json({
      completionByGame,
      summaryByMap,
      verifiedCompletionByGame,
      verifiedSummaryByMap,
      mapsByGame: Object.fromEntries(
        Array.from(mapsByGameMap.entries()).map(([gameId, maps]) => [
          gameId,
          maps.map((m) => ({ id: m.id, name: m.name, slug: m.slug, order: m.order, game: m.game })),
        ])
      ),
      achievements: [],
      unlockedAchievementIds: [],
      verifiedAchievementsTotal,
    });
  }

    // They picked a map – only that map’s achievements
    const [rawAchievements, unlocked] = await Promise.all([
      prisma.achievement.findMany({
        where: {
          isActive: true,
          OR: [{ mapId }, { easterEgg: { mapId } }],
        },
        include: {
          map: {
            select: {
              id: true,
              name: true,
              slug: true,
              order: true,
              game: { select: { id: true, name: true, shortName: true, order: true } },
            },
          },
          easterEgg: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ type: 'asc' }, { slug: 'asc' }],
      }),
      prisma.userAchievement.findMany({
        where: {
          userId: user.id,
          achievement: {
            OR: [{ mapId }, { easterEgg: { mapId } }],
          },
        },
        select: { achievementId: true, verifiedAt: true },
      }),
    ]);

    const unlockedIds = unlocked.map((u) => u.achievementId);
    const verifiedUnlockedAchievementIds = unlocked.filter((u) => u.verifiedAt != null).map((u) => u.achievementId);

    // EE achievements may have mapId null (linked only via easterEgg); attach map so profile filter works
    let achievements = rawAchievements;
    const needMap = rawAchievements.some((a) => !a.map);
    if (needMap && mapId) {
      const mapInfo = await prisma.map.findUnique({
        where: { id: mapId },
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
          game: { select: { id: true, name: true, shortName: true, order: true } },
        },
      });
      if (mapInfo) {
        achievements = rawAchievements.map((a) => ({
          ...a,
          map: a.map ?? mapInfo,
        }));
      }
    }

    // Hide redundant generic "Main Quest" when this map has a specific-named main quest achievement
    const hasSpecificEeAchievement = achievements.some(
      (a) => a.type === 'EASTER_EGG_COMPLETE' && ((a.easterEgg as { name?: string } | null)?.name !== 'Main Quest' || a.slug !== 'main-quest')
    );
    if (hasSpecificEeAchievement) {
      achievements = achievements.filter(
        (a) => !(a.type === 'EASTER_EGG_COMPLETE' && a.name === 'Main Quest' && a.slug === 'main-quest')
      );
    }

    achievements = sortAchievementsForDisplay(achievements.filter((a) => a.isActive !== false));

    return NextResponse.json({
      completionByGame,
      mapsByGame: Object.fromEntries(
        Array.from(mapsByGameMap.entries()).map(([gameId, maps]) => [
          gameId,
          maps.map((m) => ({ id: m.id, name: m.name, slug: m.slug, order: m.order, game: m.game })),
        ])
      ),
      achievements,
      unlockedAchievementIds: unlockedIds,
      verifiedUnlockedAchievementIds,
    });
  } catch (error) {
    console.error('Error fetching achievements overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
