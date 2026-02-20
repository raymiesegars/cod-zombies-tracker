import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

/** List runs someone else logged that tag you as teammate (pending confirm/deny). */
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pendings = await prisma.coOpRunPending.findMany({
      where: { teammateUserId: me.id, status: 'PENDING' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
          },
        },
        challengeLog: {
          include: {
            challenge: { select: { name: true, type: true } },
            map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
          },
        },
        easterEggLog: {
          include: {
            easterEgg: { select: { name: true, type: true } },
            map: { select: { name: true, slug: true, imageUrl: true, game: { select: { shortName: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const list = pendings.map((p) => {
      const creator = p.creator;
      const avatarUrl = getDisplayAvatarUrl(creator);
      if (p.challengeLog) {
        const log = p.challengeLog;
        return {
          id: p.id,
          logType: 'challenge' as const,
          logId: log.id,
          mapSlug: log.map.slug,
          mapName: log.map.name,
          mapImageUrl: log.map.imageUrl,
          gameShortName: log.map.game.shortName,
          runLabel: `${log.challenge.name} – Round ${log.roundReached}`,
          roundReached: log.roundReached,
          playerCount: log.playerCount,
          creator: {
            id: creator.id,
            username: creator.username,
            displayName: creator.displayName,
            avatarUrl,
          },
          createdAt: p.createdAt,
        };
      }
      const log = p.easterEggLog!;
      return {
        id: p.id,
        logType: 'easter_egg' as const,
        logId: log.id,
        mapSlug: log.map.slug,
        mapName: log.map.name,
        mapImageUrl: log.map.imageUrl,
        gameShortName: log.map.game.shortName,
        runLabel: log.easterEgg.name,
        roundCompleted: log.roundCompleted,
        playerCount: log.playerCount,
        creator: {
          id: creator.id,
          username: creator.username,
          displayName: creator.displayName,
          avatarUrl,
        },
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({ pendings: list });
  } catch (error) {
    console.error('Error fetching pending co-op:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
