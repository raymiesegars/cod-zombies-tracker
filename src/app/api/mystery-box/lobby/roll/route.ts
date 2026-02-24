import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { spendToken, pickRandomRoll, type MysteryBoxFilterSettings } from '@/lib/mystery-box';

export const dynamic = 'force-dynamic';

/** DELETE: Reset/discard current roll when solo only. No vote, no token. Use discard-vote when in a group. */
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

    const lobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
      include: { currentRoll: true, discardVote: true, members: true },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'You must host a lobby to reset' }, { status: 400 });
    }
    if (lobby.members.length > 0) {
      return NextResponse.json(
        { error: 'Use Discard in the lobby to discard when playing with others. Reset is only for solo.' },
        { status: 400 }
      );
    }
    if (!lobby.currentRoll) {
      return NextResponse.json({ error: 'No roll to reset' }, { status: 400 });
    }
    if (lobby.discardVote) {
      return NextResponse.json(
        { error: 'A discard vote is in progress. Complete the vote to discard.' },
        { status: 400 }
      );
    }

    await prisma.mysteryBoxRoll.delete({
      where: { id: lobby.currentRoll.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error resetting mystery box roll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST: Spend a token and roll. Host only. Body: { filterSettings?: MysteryBoxFilterSettings } */
export async function POST(request: NextRequest) {
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

    const lobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
      include: { currentRoll: true, members: { select: { userId: true } } },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'You must host a lobby to spin' }, { status: 400 });
    }

    // Everyone in lobby (host + members) must spend 1 token
    const lobbyUserIds = [lobby.hostId, ...lobby.members.map((m) => m.userId)];
    const uniqueUserIds = Array.from(new Set(lobbyUserIds));

    const usersWithTokens = await prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, mysteryBoxTokens: true, username: true, displayName: true },
    });
    const insufficient = usersWithTokens.filter((u) => (u.mysteryBoxTokens ?? 0) < 1);
    if (insufficient.length > 0) {
      return NextResponse.json(
        {
          error: 'Everyone in the lobby needs at least 1 token to spin.',
          insufficientTokens: insufficient.map((u) => ({
            userId: u.id,
            displayName: u.displayName ?? u.username,
          })),
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const filterSettings = body.filterSettings as MysteryBoxFilterSettings | null | undefined;

    // Spend 1 token for each lobby member (all or nothing)
    const spentIds: string[] = [];
    for (const uid of uniqueUserIds) {
      const ok = await spendToken(uid);
      if (!ok) {
        for (const refundId of spentIds) {
          await prisma.user.update({
            where: { id: refundId },
            data: { mysteryBoxTokens: { increment: 1 } },
          });
        }
        return NextResponse.json({ error: 'Failed to spend tokens. Please try again.' }, { status: 500 });
      }
      spentIds.push(uid);
    }

    const result = await pickRandomRoll(filterSettings ?? null);
    if (!result) {
      // Refund token if no valid options (shouldn't happen with no filters)
      await prisma.user.update({
        where: { id: me.id },
        data: { mysteryBoxTokens: { increment: 1 } },
      });
      return NextResponse.json(
        { error: 'No challenges match your filters. Try fewer restrictions.' },
        { status: 400 }
      );
    }

    // Delete existing roll (one per lobby), create new one
    await prisma.mysteryBoxRoll.deleteMany({ where: { lobbyId: lobby.id } });
    const roll = await prisma.mysteryBoxRoll.create({
      data: {
        lobbyId: lobby.id,
        gameId: result.gameId,
        mapId: result.mapId,
        challengeId: result.challengeId,
        tags: (result.tags ?? undefined) as object | undefined,
        filterSettings: (filterSettings ?? undefined) as object | undefined,
      },
    });

    const [game, map, challenge] = await Promise.all([
      prisma.game.findUnique({ where: { id: roll.gameId }, select: { id: true, name: true, shortName: true } }),
      prisma.map.findUnique({ where: { id: roll.mapId }, select: { id: true, name: true, slug: true } }),
      prisma.challenge.findUnique({ where: { id: roll.challengeId }, select: { id: true, name: true, type: true } }),
    ]);

    return NextResponse.json({
      roll: {
        id: roll.id,
        gameId: roll.gameId,
        mapId: roll.mapId,
        challengeId: roll.challengeId,
        tags: roll.tags,
        filterSettings: roll.filterSettings,
        game: game ?? undefined,
        map: map ?? undefined,
        challenge: challenge ?? undefined,
      },
    });
  } catch (error) {
    console.error('Error rolling mystery box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
