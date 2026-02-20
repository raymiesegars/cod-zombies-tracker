import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

/** List all runs pending verification (challenge + easter egg). Admin only. */
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [challengeLogs, easterEggLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        where: {
          verificationRequestedAt: { not: null },
          isVerified: false,
          userId: { not: me.id },
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
          challenge: { select: { name: true, type: true } },
          map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
        },
        orderBy: { verificationRequestedAt: 'desc' },
      }),
      prisma.easterEggLog.findMany({
        where: {
          verificationRequestedAt: { not: null },
          isVerified: false,
          userId: { not: me.id },
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true } },
          easterEgg: { select: { name: true, type: true } },
          map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
        },
        orderBy: { verificationRequestedAt: 'desc' },
      }),
    ]);

    const challengeItems = challengeLogs.map((log) => ({
      logType: 'challenge' as const,
      logId: log.id,
      mapSlug: log.map.slug,
      mapName: log.map.name,
      mapImageUrl: log.map.imageUrl,
      gameShortName: log.map.game.shortName,
      runLabel: `${log.challenge.name} – Round ${log.roundReached}`,
      roundReached: log.roundReached,
      playerCount: log.playerCount,
      user: {
        id: log.user.id,
        username: log.user.username,
        displayName: log.user.displayName,
        avatarUrl: getDisplayAvatarUrl(log.user),
      },
      createdAt: log.verificationRequestedAt!.toISOString(),
    }));

    const eeItems = easterEggLogs.map((log) => ({
      logType: 'easter_egg' as const,
      logId: log.id,
      mapSlug: log.map.slug,
      mapName: log.map.name,
      mapImageUrl: log.map.imageUrl,
      gameShortName: log.map.game.shortName,
      runLabel: log.easterEgg.name,
      roundCompleted: log.roundCompleted,
      playerCount: log.playerCount,
      user: {
        id: log.user.id,
        username: log.user.username,
        displayName: log.user.displayName,
        avatarUrl: getDisplayAvatarUrl(log.user),
      },
      createdAt: log.verificationRequestedAt!.toISOString(),
    }));

    const runs = [...challengeItems, ...eeItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ runs });
  } catch (error) {
    console.error('Error fetching pending verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
