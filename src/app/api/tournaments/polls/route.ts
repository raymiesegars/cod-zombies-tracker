import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { TournamentPollStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** GET: List all polls for dropdown (id, title, status, endsAt). Default order: latest first. */
export async function GET() {
  try {
    const polls = await prisma.tournamentPoll.findMany({
      orderBy: { endsAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    });
    return NextResponse.json(polls, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error listing tournament polls:', error);
    return NextResponse.json({ error: 'Failed to list polls' }, { status: 500 });
  }
}

/** POST: Create a new poll (super admin only). Body: { title, options: string[] (2-8), startsAt?, endsAt? }. */
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
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const rawOptions = Array.isArray(body.options) ? body.options : [];
    const options = rawOptions
      .filter((o: unknown) => typeof o === 'string' && (o as string).trim())
      .map((o: string) => o.trim())
      .slice(0, 8);

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (options.length < 2 || options.length > 8) {
      return NextResponse.json({ error: 'Between 2 and 8 options are required' }, { status: 400 });
    }

    const now = new Date();
    const startsAt = body.startsAt ? new Date(body.startsAt) : now;
    const endsAt = body.endsAt ? new Date(body.endsAt) : new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const poll = await prisma.tournamentPoll.create({
      data: {
        title,
        status: TournamentPollStatus.ACTIVE,
        startsAt,
        endsAt,
        createdById: me.id,
        options: {
          create: options.map((label: string, order: number) => ({ label, order })),
        },
      },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json(poll);
  } catch (error) {
    console.error('Error creating tournament poll:', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
