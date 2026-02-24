import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** POST: Submit your vote on the discard. Body: { choice: 'YES' | 'NO' } */
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

    const body = await request.json().catch(() => ({}));
    const choice = body.choice === 'YES' ? 'YES' : body.choice === 'NO' ? 'NO' : null;
    if (!choice) {
      return NextResponse.json({ error: 'Invalid choice. Use YES or NO.' }, { status: 400 });
    }

    // Find lobby user is in (as host or member)
    const myMembership = await prisma.mysteryBoxLobbyMember.findFirst({
      where: { userId: me.id },
      include: { lobby: true },
    });
    const hostedLobby = await prisma.mysteryBoxLobby.findFirst({
      where: { hostId: me.id },
    });
    const lobby = myMembership?.lobby ?? hostedLobby;
    if (!lobby) {
      return NextResponse.json({ error: 'You are not in a lobby' }, { status: 400 });
    }

    const vote = await prisma.mysteryBoxDiscardVote.findUnique({
      where: { lobbyId: lobby.id },
      include: { roll: true },
    });
    if (!vote) {
      return NextResponse.json({ error: 'No discard vote in progress' }, { status: 400 });
    }

    const votes = (vote.votes as Record<string, string>) ?? {};
    votes[me.id] = choice;
    await prisma.mysteryBoxDiscardVote.update({
      where: { id: vote.id },
      data: { votes: votes as object },
    });

    // Who needs to vote? Host + all members
    const members = await prisma.mysteryBoxLobbyMember.findMany({
      where: { lobbyId: lobby.id },
      select: { userId: true },
    });
    const voters = [lobby.hostId, ...members.map((m) => m.userId)];
    const uniqueVoters = Array.from(new Set(voters));

    const allVoted = uniqueVoters.every((uid) => votes[uid] != null);
    if (!allVoted) {
      return NextResponse.json({
        ok: true,
        status: 'PENDING',
        votes,
        votersNeeded: uniqueVoters.length,
        votedCount: Object.keys(votes).length,
      });
    }

    // All voted - check result
    const anyNo = uniqueVoters.some((uid) => votes[uid] === 'NO');
    if (anyNo) {
      await prisma.mysteryBoxDiscardVote.deleteMany({ where: { id: vote.id } });
      return NextResponse.json({
        ok: true,
        status: 'REJECTED',
        message: 'The discard was rejected. One or more members voted no.',
      });
    }

    // All yes - discard the roll (cascade will delete the discard vote)
    // Use deleteMany to avoid P2025 when two voters submit simultaneously and the first already deleted
    const deleted = await prisma.mysteryBoxRoll.deleteMany({ where: { id: vote.rollId } });
    if (deleted.count === 0) {
      // Another request already completed - treat as success (idempotent)
    }

    return NextResponse.json({
      ok: true,
      status: 'APPROVED',
      message: 'The challenge has been discarded.',
    });
  } catch (error) {
    console.error('Error submitting discard vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
