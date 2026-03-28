import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { TournamentPollStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** GET: For the poll vote reminder popup. Returns the current active poll (open for voting) and whether the current user has voted. 401 if not signed in. */
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
      return NextResponse.json({ poll: null, hasVoted: false });
    }

    const now = new Date();
    const poll = await prisma.tournamentPoll.findFirst({
      where: {
        status: TournamentPollStatus.ACTIVE,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'asc' },
      select: {
        id: true,
        title: true,
        endsAt: true,
      },
    });
    if (!poll) {
      return NextResponse.json({ poll: null, hasVoted: false });
    }

    const vote = await prisma.tournamentPollVote.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId: me.id } },
      select: { optionId: true },
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        endsAt: poll.endsAt,
      },
      hasVoted: !!vote,
    });
  } catch (error) {
    console.error('Error fetching active poll for reminder:', error);
    return NextResponse.json({ poll: null, hasVoted: false });
  }
}
