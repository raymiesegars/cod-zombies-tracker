import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { grantVerifiedAchievementsForMap } from '@/lib/verified-xp';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** Approve verification for a run. Admin only. Creates VERIFICATION_APPROVED notification for the run owner. */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        select: { id: true, userId: true, mapId: true, verificationRequestedAt: true, isVerified: true },
      });
      if (!log || !log.verificationRequestedAt || log.isVerified) {
        return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
      }
      if (log.userId === me.id) {
        return NextResponse.json({ error: 'You cannot verify your own run' }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.challengeLog.update({
          where: { id: logId },
          data: { isVerified: true, verificationRequestedAt: null },
        }),
        prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_APPROVED,
            challengeLogId: log.id,
            read: false,
          },
        }),
      ]);
      await grantVerifiedAchievementsForMap(log.userId, log.mapId);
    } else {
      const log = await prisma.easterEggLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, mapId: true, verificationRequestedAt: true, isVerified: true },
      });
      if (!log || !log.verificationRequestedAt || log.isVerified) {
        return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
      }
      if (log.userId === me.id) {
        return NextResponse.json({ error: 'You cannot verify your own run' }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.easterEggLog.update({
          where: { id: logId },
          data: { isVerified: true, verificationRequestedAt: null },
        }),
        prisma.notification.create({
          data: {
            userId: log.userId,
            type: NotificationType.VERIFICATION_APPROVED,
            easterEggLogId: log.id,
            read: false,
          },
        }),
      ]);
      await grantVerifiedAchievementsForMap(log.userId, log.mapId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error approving verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
