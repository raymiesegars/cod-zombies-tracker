import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** POST: Start a discard vote. Host only. Body: { intent?: 'discard' | 'reroll' }. Reroll = discard + spin (uses another token). */
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
      include: {
        currentRoll: true,
        members: { select: { userId: true } },
      },
    });
    if (!lobby) {
      return NextResponse.json({ error: 'You must host a lobby to start a discard vote' }, { status: 400 });
    }
    if (!lobby.currentRoll) {
      return NextResponse.json({ error: 'No roll to discard' }, { status: 400 });
    }

    // Check if there's already an active vote
    const existing = await prisma.mysteryBoxDiscardVote.findUnique({
      where: { lobbyId: lobby.id },
    });
    if (existing) {
      return NextResponse.json({ error: 'A discard vote is already in progress' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const intent = body.intent === 'reroll' ? 'reroll' : 'discard';

    const voters = [lobby.hostId, ...lobby.members.map((m) => m.userId)];
    const uniqueVoters = Array.from(new Set(voters));

    const vote = await prisma.mysteryBoxDiscardVote.create({
      data: {
        lobbyId: lobby.id,
        rollId: lobby.currentRoll.id,
        votes: {},
        intent,
      },
    });

    return NextResponse.json({
      vote: {
        id: vote.id,
        lobbyId: vote.lobbyId,
        rollId: vote.rollId,
        intent: vote.intent ?? 'discard',
        votes: (vote.votes as Record<string, string>) ?? {},
        votersNeeded: uniqueVoters.length,
      },
    });
  } catch (error) {
    console.error('Error starting discard vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
