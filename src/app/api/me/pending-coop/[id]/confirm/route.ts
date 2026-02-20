import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { getLevelFromXp } from '@/lib/ranks';

/** Confirm pending co-op: copy log to current user, award XP. Copy keeps same squad for display; no new pendings. */
export async function POST(
  _request: NextRequest,
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

    const { id: pendingId } = await params;
    const challengeLogSelect = {
      userId: true,
      teammateUserIds: true,
      teammateNonUserNames: true,
      challengeId: true,
      mapId: true,
      roundReached: true,
      playerCount: true,
      proofUrls: true,
      screenshotUrl: true,
      notes: true,
      completionTimeSeconds: true,
      difficulty: true,
    } as const;
    const pending = await prisma.coOpRunPending.findUnique({
      where: { id: pendingId },
      include: {
        challengeLog: { select: challengeLogSelect },
        easterEggLog: { include: { easterEgg: true } },
      },
    });

    if (!pending || pending.teammateUserId !== me.id || pending.status !== 'PENDING') {
      return NextResponse.json({ error: 'Not found or already handled' }, { status: 404 });
    }

    if (pending.challengeLog) {
      const log = pending.challengeLog;
      const originalCreatorId = typeof log.userId === 'string' ? log.userId : '';
      const rawTeammateIds = Array.isArray(log.teammateUserIds) ? log.teammateUserIds : [];
      const originalTeammateIds = rawTeammateIds.filter((id): id is string => typeof id === 'string');
      // same squad on the copy (creator + others), minus me since I'm the owner of this copy
      const copyTeammateUserIds: string[] = originalCreatorId
        ? [originalCreatorId, ...originalTeammateIds.filter((id) => id !== me.id)]
        : originalTeammateIds.filter((id) => id !== me.id);
      const rawNonUserNames = Array.isArray(log.teammateNonUserNames) ? log.teammateNonUserNames : [];
      const copyTeammateNonUserNames = rawNonUserNames.filter((n): n is string => typeof n === 'string');
      await prisma.$transaction(async (tx) => {
        await tx.challengeLog.create({
          data: {
            userId: me!.id,
            challengeId: log.challengeId,
            mapId: log.mapId,
            roundReached: log.roundReached,
            playerCount: log.playerCount,
            proofUrls: log.proofUrls,
            screenshotUrl: log.screenshotUrl,
            notes: log.notes,
            completionTimeSeconds: log.completionTimeSeconds,
            teammateUserIds: copyTeammateUserIds,
            teammateNonUserNames: copyTeammateNonUserNames,
            ...(log.difficulty != null && { difficulty: log.difficulty }),
          },
        });
        await tx.coOpRunPending.update({
          where: { id: pendingId },
          data: { status: 'CONFIRMED' },
        });
      });
      const newlyUnlocked = await processMapAchievements(me.id, log.mapId);
      const xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
      let totalXp: number | undefined;
      if (xpGained > 0) {
        const updated = await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true, level: true } });
        if (updated) {
          totalXp = updated.totalXp;
          const { level } = getLevelFromXp(updated.totalXp);
          if (level !== updated.level) {
            await prisma.user.update({ where: { id: me.id }, data: { level } });
          }
        }
      } else {
        const u = await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true } });
        totalXp = u?.totalXp;
      }
      return NextResponse.json({ ok: true, logType: 'challenge', xpGained: xpGained ?? 0, totalXp });
    }

    if (pending.easterEggLog) {
      const log = pending.easterEggLog;
      const ee = log.easterEgg;
      const originalCreatorId = typeof log.userId === 'string' ? log.userId : '';
      const rawTeammateIds = Array.isArray(log.teammateUserIds) ? log.teammateUserIds : [];
      const originalTeammateIds = rawTeammateIds.filter((id): id is string => typeof id === 'string');
      const copyTeammateUserIds: string[] = originalCreatorId
        ? [originalCreatorId, ...originalTeammateIds.filter((id) => id !== me.id)]
        : originalTeammateIds.filter((id) => id !== me.id);
      const rawNonUserNames = Array.isArray(log.teammateNonUserNames) ? log.teammateNonUserNames : [];
      const copyTeammateNonUserNames = rawNonUserNames.filter((n): n is string => typeof n === 'string');
      await prisma.$transaction(async (tx) => {
        await tx.easterEggLog.create({
          data: {
            userId: me!.id,
            easterEggId: log.easterEggId,
            mapId: log.mapId,
            roundCompleted: log.roundCompleted,
            playerCount: log.playerCount,
            isSolo: log.isSolo,
            isNoGuide: log.isNoGuide,
            proofUrls: log.proofUrls,
            screenshotUrl: log.screenshotUrl,
            notes: log.notes,
            completionTimeSeconds: log.completionTimeSeconds,
            teammateUserIds: copyTeammateUserIds,
            teammateNonUserNames: copyTeammateNonUserNames,
            ...(log.difficulty != null && { difficulty: log.difficulty }),
          },
        });
        await tx.coOpRunPending.update({
          where: { id: pendingId },
          data: { status: 'CONFIRMED' },
        });
      });

      let mainEeXpAwarded = 0;
      if (ee.xpReward > 0) {
        const existing = await prisma.mainEasterEggXpAwarded.findUnique({
          where: { userId_easterEggId: { userId: me.id, easterEggId: ee.id } },
        });
        if (!existing) {
          await prisma.mainEasterEggXpAwarded.create({
            data: { userId: me.id, easterEggId: ee.id },
          });
          await prisma.user.update({
            where: { id: me.id },
            data: { totalXp: { increment: ee.xpReward } },
          });
          mainEeXpAwarded = ee.xpReward;
          const eeAchievement = await prisma.achievement.findFirst({
            where: { easterEggId: ee.id, isActive: true },
            select: { id: true },
          });
          if (eeAchievement) {
            await prisma.userAchievement.upsert({
              where: { userId_achievementId: { userId: me.id, achievementId: eeAchievement.id } },
              create: { userId: me.id, achievementId: eeAchievement.id },
              update: {},
            });
          }
        }
      }

      const newlyUnlocked = await processMapAchievements(me.id, log.mapId);
      const xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0) + mainEeXpAwarded;
      let totalXp: number | undefined;
      if (xpGained > 0) {
        const updated = await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true, level: true } });
        if (updated) {
          totalXp = updated.totalXp;
          const { level } = getLevelFromXp(updated.totalXp);
          if (level !== updated.level) {
            await prisma.user.update({ where: { id: me.id }, data: { level } });
          }
        }
      } else {
        const u = await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true } });
        totalXp = u?.totalXp;
      }
      return NextResponse.json({ ok: true, logType: 'easter_egg', xpGained, totalXp });
    }

    return NextResponse.json({ error: 'Invalid pending' }, { status: 400 });
  } catch (error) {
    console.error('Error confirming pending co-op:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
