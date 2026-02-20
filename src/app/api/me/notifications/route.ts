import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** List notifications for the current user. Returns unreadCount and notifications (newest first). */
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

    const [unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId: me.id, read: false } }),
      prisma.notification.findMany({
        where: { userId: me.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          challengeLog: {
            select: {
              id: true,
              map: { select: { slug: true } },
              challenge: { select: { name: true } },
              roundReached: true,
            },
          },
          easterEggLog: {
            select: {
              id: true,
              map: { select: { slug: true } },
              easterEgg: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const list = notifications.map((n) => {
      const logType = n.challengeLogId ? 'challenge' : 'easter_egg';
      const log = n.challengeLog ?? n.easterEggLog;
      const mapSlug = log?.map?.slug ?? null;
      const runLabel = n.challengeLog
        ? `${n.challengeLog.challenge.name} – Round ${n.challengeLog.roundReached}`
        : n.easterEggLog
          ? n.easterEggLog.easterEgg.name
          : 'Run';
      const runPath =
        mapSlug && log
          ? `/maps/${mapSlug}/run/${logType === 'easter_egg' ? 'easter-egg' : 'challenge'}/${log.id}`
          : null;
      return {
        id: n.id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        runLabel,
        runPath,
        logType,
        logId: n.challengeLogId ?? n.easterEggLogId,
      };
    });

    return NextResponse.json({ unreadCount, notifications: list });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** Delete all notifications for the current user. */
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

    await prisma.notification.deleteMany({
      where: { userId: me.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
