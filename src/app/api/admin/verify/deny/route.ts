import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Deny verification for a run. Admin only. Requires message. Creates VERIFICATION_DENIED notification. */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true, displayName: true, username: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const logType = body.logType === 'easter_egg' ? 'easter_egg' : 'challenge';
    const logId = typeof body.logId === 'string' ? body.logId.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!logId) {
      return NextResponse.json({ error: 'logId is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'message is required (reason for not verifying)' }, { status: 400 });
    }

    const denierLabel = (me.displayName && me.displayName.trim()) || me.username || 'An admin';

    if (logType === 'challenge') {
      const log = await prisma.challengeLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, verificationRequestedAt: true },
      });
      if (!log || !log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
      }
      if (log.userId === me.id) {
        return NextResponse.json({ error: 'You cannot deny verification for your own run' }, { status: 400 });
      }
      const fullMessage = `Denied by ${denierLabel}: ${message}`.slice(0, 2000);
      await prisma.$transaction([
        prisma.challengeLog.update({
          where: { id: logId },
          data: { verificationRequestedAt: null },
        }),
        prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_DENIED,
            challengeLogId: log.id,
            message: fullMessage,
            read: false,
          },
        }),
      ]);
    } else {
      const log = await prisma.easterEggLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, verificationRequestedAt: true },
      });
      if (!log || !log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
      }
      if (log.userId === me.id) {
        return NextResponse.json({ error: 'You cannot deny verification for your own run' }, { status: 400 });
      }
      const fullMessage = `Denied by ${denierLabel}: ${message}`.slice(0, 2000);
      await prisma.$transaction([
        prisma.easterEggLog.update({
          where: { id: logId },
          data: { verificationRequestedAt: null },
        }),
        prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_DENIED,
            easterEggLogId: log.id,
            message: fullMessage,
            read: false,
          },
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error denying verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
