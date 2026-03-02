import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { TournamentPollStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** GET: One poll with options. If poll has ended OR viewer is super admin, include vote counts per option. Otherwise options have no counts. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUser = await getUser();
    let isAdmin = false;
    let currentUserId: string | null = null;
    if (supabaseUser) {
      const me = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        select: { id: true },
      });
      if (me) {
        currentUserId = me.id;
        isAdmin = isSuperAdmin(me.id);
      }
    }

    const poll = await prisma.tournamentPoll.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const now = new Date();
    const ended = poll.status === TournamentPollStatus.ENDED || now >= poll.endsAt;
    const showResults = ended || isAdmin;

    let options: { id: string; label: string; order: number; voteCount?: number }[] = poll.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      order: opt.order,
    }));

    if (showResults) {
      const voteCounts = await prisma.tournamentPollVote.groupBy({
        by: ['optionId'],
        where: { pollId: id },
        _count: { optionId: true },
      });
      const countMap = Object.fromEntries(voteCounts.map((v) => [v.optionId, v._count.optionId]));
      options = options.map((o) => ({ ...o, voteCount: countMap[o.id] ?? 0 }));
    }

    const userVote = currentUserId
      ? await prisma.tournamentPollVote.findUnique({
          where: { pollId_userId: { pollId: id, userId: currentUserId } },
          select: { optionId: true },
        })
      : null;

    return NextResponse.json({
      id: poll.id,
      title: poll.title,
      status: poll.status,
      startsAt: poll.startsAt,
      endsAt: poll.endsAt,
      options,
      userVoteOptionId: userVote?.optionId ?? null,
    });
  } catch (error) {
    console.error('Error fetching tournament poll:', error);
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
  }
}

/** PATCH: Update poll (super admin only). Body: { title?, options?, status?, endsAt? }. */
export async function PATCH(
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
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.tournamentPoll.findUnique({ where: { id }, include: { options: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: { title?: string; status?: TournamentPollStatus; endsAt?: Date } = {};
    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
    if (body.status === 'DRAFT' || body.status === 'ACTIVE' || body.status === 'ENDED') updates.status = body.status;
    if (body.endsAt) updates.endsAt = new Date(body.endsAt);

    if (Array.isArray(body.options) && body.options.length >= 2 && body.options.length <= 8) {
      const labels = body.options
        .filter((o: unknown) => typeof o === 'string' && (o as string).trim())
        .map((o: string) => o.trim())
        .slice(0, 8);
      if (labels.length >= 2) {
        await prisma.$transaction([
          prisma.tournamentPollOption.deleteMany({ where: { pollId: id } }),
          prisma.tournamentPoll.update({
            where: { id },
            data: {
              ...updates,
              options: {
                create: labels.map((label: string, order: number) => ({ label, order })),
              },
            },
          }),
        ]);
        const updated = await prisma.tournamentPoll.findUnique({
          where: { id },
          include: { options: { orderBy: { order: 'asc' } } },
        });
        return NextResponse.json(updated);
      }
    }

    if (Object.keys(updates).length > 0) {
      const updated = await prisma.tournamentPoll.update({
        where: { id },
        data: updates,
        include: { options: { orderBy: { order: 'asc' } } },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json(existing);
  } catch (error) {
    console.error('Error updating tournament poll:', error);
    return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 });
  }
}
