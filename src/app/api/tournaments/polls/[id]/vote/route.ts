import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { TournamentPollStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** POST: Vote for an option (one vote per user per poll). Body: { optionId }. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: pollId } = await params;
    const body = await request.json().catch(() => ({}));
    const optionId = typeof body.optionId === 'string' ? body.optionId.trim() : '';
    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    const poll = await prisma.tournamentPoll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }
    if (poll.status !== TournamentPollStatus.ACTIVE) {
      return NextResponse.json({ error: 'Poll is not open for voting' }, { status: 400 });
    }
    if (new Date() >= poll.endsAt) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 });
    }
    const option = poll.options.find((o) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    const existing = await prisma.tournamentPollVote.findUnique({
      where: { pollId_userId: { pollId, userId: me.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 });
    }

    await prisma.tournamentPollVote.create({
      data: { pollId, userId: me.id, optionId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
