import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { grantVerifiedAchievementsForMap } from '@/lib/verified-xp';
import { adminXpForRun } from '@/lib/admin-levels';
import { refreshStoredRankOneCountsForMap } from '@/lib/world-records';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    const now = new Date();

    if (logType === 'challenge') {
      const log = await prisma.challengeLog.findUnique({
        where: { id: logId },
        select: { id: true, userId: true, mapId: true, verificationRequestedAt: true, isVerified: true, roundReached: true },
      });
      if (!log || !log.verificationRequestedAt || log.isVerified) {
        return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
      }
      if (log.userId === me.id && !isSuperAdmin(me.id)) {
        return NextResponse.json({ error: 'You cannot verify your own run' }, { status: 400 });
      }
      await prisma.challengeLog.update({
        where: { id: logId },
        data: { isVerified: true, verificationRequestedAt: null, verifiedById: me.id, verifiedAt: now },
      });
      const mapWithGame = await prisma.map.findUnique({
        where: { id: log.mapId },
        select: { game: { select: { shortName: true } } },
      });
      const isBo3Custom = mapWithGame?.game?.shortName === 'BO3_CUSTOM';
      const { verifiedTotalXp, verifiedCustomZombiesTotalXp, xpGained } = await grantVerifiedAchievementsForMap(log.userId, log.mapId, { recordMilestones: true });
      await refreshStoredRankOneCountsForMap(log.mapId);
      await prisma.notification.create({
        data: {
          userId: log.userId,
          type: NotificationType.VERIFICATION_APPROVED,
          challengeLogId: log.id,
          read: false,
          verifiedXpGained: xpGained > 0 ? xpGained : null,
          verifiedTotalXp: xpGained > 0 && !isBo3Custom ? verifiedTotalXp : null,
          verifiedCustomZombiesTotalXp: xpGained > 0 && isBo3Custom ? verifiedCustomZombiesTotalXp : null,
        },
      });
      const adminXp = adminXpForRun(log.roundReached);
      if (adminXp > 0) {
        await prisma.user.update({
          where: { id: me.id },
          data: { adminXp: { increment: adminXp } },
        });
      }
      return NextResponse.json({ ok: true, adminXpGained: adminXp });
    }

    const log = await prisma.easterEggLog.findUnique({
      where: { id: logId },
      select: { id: true, userId: true, mapId: true, verificationRequestedAt: true, isVerified: true, roundCompleted: true },
    });
    if (!log || !log.verificationRequestedAt || log.isVerified) {
      return NextResponse.json({ error: 'Run not found or not pending verification' }, { status: 400 });
    }
    if (log.userId === me.id && !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'You cannot verify your own run' }, { status: 400 });
    }
    await prisma.easterEggLog.update({
      where: { id: logId },
      data: { isVerified: true, verificationRequestedAt: null, verifiedById: me.id, verifiedAt: now },
    });
    const mapWithGameEe = await prisma.map.findUnique({
      where: { id: log.mapId },
      select: { game: { select: { shortName: true } } },
    });
    const isBo3CustomEe = mapWithGameEe?.game?.shortName === 'BO3_CUSTOM';
    const { verifiedTotalXp, verifiedCustomZombiesTotalXp, xpGained } = await grantVerifiedAchievementsForMap(log.userId, log.mapId, { recordMilestones: true });
    await refreshStoredRankOneCountsForMap(log.mapId);
    await prisma.notification.create({
      data: {
        userId: log.userId,
        type: NotificationType.VERIFICATION_APPROVED,
        easterEggLogId: log.id,
        read: false,
        verifiedXpGained: xpGained > 0 ? xpGained : null,
        verifiedTotalXp: xpGained > 0 && !isBo3CustomEe ? verifiedTotalXp : null,
        verifiedCustomZombiesTotalXp: xpGained > 0 && isBo3CustomEe ? verifiedCustomZombiesTotalXp : null,
      },
    });
    const rounds = log.roundCompleted ?? 1;
    const adminXp = adminXpForRun(rounds);
    if (adminXp > 0) {
      await prisma.user.update({
        where: { id: me.id },
        data: { adminXp: { increment: adminXp } },
      });
    }
    return NextResponse.json({ ok: true, adminXpGained: adminXp });
  } catch (error) {
    console.error('Error approving verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
