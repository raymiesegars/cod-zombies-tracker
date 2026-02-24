import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** POST: Create a new lobby (user becomes host). Fails if already in one. */
export async function POST() {
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

    // Check if already in a lobby (as host or member)
    const existing = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id },
      include: { lobby: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Already in a lobby. Leave first to create a new one.' },
        { status: 400 }
      );
    }
    const hosted = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
    });
    if (hosted) {
      return NextResponse.json(
        { error: 'Already hosting a lobby.' },
        { status: 400 }
      );
    }

    const lobby = await prisma.mysteryBoxLobby.create({
      data: { hostId: me.id },
    });

    return NextResponse.json({ lobby: { id: lobby.id } });
  } catch (error) {
    console.error('Error creating mystery box lobby:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE: Leave current lobby (host or member). Always creates a new solo lobby so you never end up with none. */
export async function DELETE() {
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

    // If host: save roll before delete, then create solo lobby and copy roll
    const hosted = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
    });
    if (hosted) {
      const activeRoll = await prisma.mysteryBoxRoll.findFirst({
        where: { lobbyId: hosted.id, completedByHost: false },
        select: { gameId: true, mapId: true, challengeId: true, tags: true, filterSettings: true },
      });

      await prisma.mysteryBoxLobby.delete({ where: { id: hosted.id } });

      const solo = await prisma.mysteryBoxLobby.create({ data: { hostId: me.id } });

      if (activeRoll?.gameId && activeRoll?.mapId && activeRoll?.challengeId) {
        await prisma.mysteryBoxRoll.create({
          data: {
            lobbyId: solo.id,
            gameId: activeRoll.gameId,
            mapId: activeRoll.mapId,
            challengeId: activeRoll.challengeId,
            tags: activeRoll.tags ?? undefined,
            filterSettings: activeRoll.filterSettings ?? undefined,
          },
        });
      }
      return NextResponse.json({ ok: true, newLobbyId: solo.id });
    }

    // If member: remove from lobby and create solo lobby with a copy of the challenge if there was one
    const membership = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id },
    });
    if (membership) {
      // Explicitly fetch the roll from the lobby they're leaving (more reliable than nested include)
      const activeRoll = await prisma.mysteryBoxRoll.findFirst({
        where: { lobbyId: membership.lobbyId, completedByHost: false },
        select: { gameId: true, mapId: true, challengeId: true, tags: true, filterSettings: true },
      });

      await prisma.$transaction(async (tx) => {
        await tx.mysteryBoxLobbyMember.delete({ where: { id: membership.id } });
        const solo = await tx.mysteryBoxLobby.create({ data: { hostId: me.id } });
        if (activeRoll?.gameId && activeRoll?.mapId && activeRoll?.challengeId) {
          await tx.mysteryBoxRoll.create({
            data: {
              lobbyId: solo.id,
              gameId: activeRoll.gameId,
              mapId: activeRoll.mapId,
              challengeId: activeRoll.challengeId,
              tags: activeRoll.tags ?? undefined,
              filterSettings: activeRoll.filterSettings ?? undefined,
            },
          });
        }
      });
      return NextResponse.json({ ok: true });
    }

    // Already not in one - ensure we have a solo lobby
    const orphaned = await prisma.mysteryBoxLobby.findFirst({ where: { hostId: me.id } });
    if (!orphaned) {
      await prisma.mysteryBoxLobby.create({ data: { hostId: me.id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error leaving mystery box lobby:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
