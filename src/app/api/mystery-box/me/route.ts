import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { accrueAndGetTokens } from '@/lib/mystery-box';
import { getDisplayAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

/** GET: tokens, nextTokenAt, lobby (if in one), current roll. */
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

    const { tokens, nextTokenAt } = await accrueAndGetTokens(me.id);

    // Am I in a lobby? As host or as member.
    const myMembership = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id },
      include: { lobby: true },
    });
    const hostedLobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
      include: { currentRoll: true },
    });

    const lobby = myMembership?.lobby ?? hostedLobby;
    if (!lobby) {
      return NextResponse.json({
        tokens,
        nextTokenAt: nextTokenAt?.toISOString() ?? null,
        lobby: null,
      });
    }

    // Fetch full lobby with host, members, roll details, discard vote
    const fullLobby = await prisma.mysteryBoxLobby.findUnique({
      where: { id: lobby.id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
            totalXp: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                avatarPreset: true,
                level: true,
                totalXp: true,
              },
            },
          },
        },
        currentRoll: {
          include: {
            lobby: true,
          },
        },
        discardVote: true,
      },
    });

    if (!fullLobby) {
      return NextResponse.json({
        tokens,
        nextTokenAt: nextTokenAt?.toISOString() ?? null,
        lobby: null,
      });
    }

    const roll = fullLobby.currentRoll;
    let rollDetails = null;
    let completionByUserId = new Set<string>();
    if (roll) {
      const [game, map, challenge, userCompletion, completions] = await Promise.all([
        prisma.game.findUnique({ where: { id: roll.gameId }, select: { id: true, name: true, shortName: true } }),
        prisma.map.findUnique({ where: { id: roll.mapId }, select: { id: true, name: true, slug: true } }),
        prisma.challenge.findUnique({ where: { id: roll.challengeId }, select: { id: true, name: true, type: true } }),
        prisma.mysteryBoxCompletion.findUnique({
          where: { userId_rollId: { userId: me.id, rollId: roll.id } },
          select: { id: true },
        }),
        prisma.mysteryBoxCompletion.findMany({
          where: { rollId: roll.id },
          select: { userId: true },
        }),
      ]);
      completionByUserId = new Set(completions.map((c) => c.userId));
      rollDetails = {
        id: roll.id,
        gameId: roll.gameId,
        mapId: roll.mapId,
        challengeId: roll.challengeId,
        tags: roll.tags as object | null,
        filterSettings: roll.filterSettings as object | null,
        completedByHost: roll.completedByHost,
        userHasCompleted: Boolean(userCompletion),
        createdAt: roll.createdAt.toISOString(),
        game: game ?? undefined,
        map: map ?? undefined,
        challenge: challenge ?? undefined,
      };
    }

    const isHost = fullLobby.hostId === me.id;

    const voters = [fullLobby.hostId, ...fullLobby.members.map((m) => m.userId)];
    const uniqueVoters = Array.from(new Set(voters));

    const discardVoteDetails = fullLobby.discardVote
      ? {
          id: fullLobby.discardVote.id,
          rollId: fullLobby.discardVote.rollId,
          intent: (fullLobby.discardVote as { intent?: string | null }).intent ?? 'discard',
          votes: (fullLobby.discardVote.votes as Record<string, string>) ?? {},
          votersNeeded: uniqueVoters.length,
          userHasVoted: (fullLobby.discardVote.votes as Record<string, string>)?.[me.id] != null,
        }
      : null;

    return NextResponse.json({
      tokens,
      nextTokenAt: nextTokenAt?.toISOString() ?? null,
      lobby: {
        id: fullLobby.id,
        hostId: fullLobby.hostId,
        isHost,
        host: {
          ...fullLobby.host,
          avatarUrl: getDisplayAvatarUrl(fullLobby.host),
          hasLoggedChallenge: roll ? completionByUserId.has(fullLobby.hostId) : undefined,
        },
        members: fullLobby.members.map((m) => ({
          ...m.user,
          avatarUrl: getDisplayAvatarUrl(m.user),
          joinedAt: m.joinedAt.toISOString(),
          hasLoggedChallenge: roll ? completionByUserId.has(m.userId) : undefined,
        })),
        roll: rollDetails,
        discardVote: discardVoteDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching mystery box me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
