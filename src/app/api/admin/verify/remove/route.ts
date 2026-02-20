import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Remove verification from a run. Super admin only. Notifies the run owner. */
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
      return NextResponse.json({ error: 'Forbidden: super admin only' }, { status: 403 });
    }

    const body = await request.json();
    const logType = body.logType === 'easter_egg' ? 'easter_egg' : 'challenge';
    const logId = typeof body.logId === 'string' ? body.logId.trim() : '';
    if (!logId) {
      return NextResponse.json({ error: 'logId is required' }, { status: 400 });
    }

    if (logType === 'challenge') {
      const log = await prisma.challengeLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, isVerified: true },
      });
      if (!log || !log.isVerified) {
        return NextResponse.json({ error: 'Run not found or not verified' }, { status: 400 });
      }
      await prisma.challengeLog.update({
        where: { id: logId },
        data: { isVerified: false },
      });
      try {
        await prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_REMOVED,
            challengeLogId: log.id,
            read: false,
          },
        });
      } catch (notifErr) {
        console.error('Error creating VERIFICATION_REMOVED notification:', notifErr);
      }
    } else {
      const log = await prisma.easterEggLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, isVerified: true },
      });
      if (!log || !log.isVerified) {
        return NextResponse.json({ error: 'Run not found or not verified' }, { status: 400 });
      }
      await prisma.easterEggLog.update({
        where: { id: logId },
        data: { isVerified: false },
      });
      try {
        await prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_REMOVED,
            easterEggLogId: log.id,
            read: false,
          },
        });
      } catch (notifErr) {
        console.error('Error creating VERIFICATION_REMOVED notification:', notifErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error removing verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
