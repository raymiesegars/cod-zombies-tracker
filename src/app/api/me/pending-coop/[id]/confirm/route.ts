import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { getLevelFromXp } from '@/lib/ranks';
import { computeMysteryBoxXp, type MysteryBoxFilterSettings } from '@/lib/mystery-box';

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
      mysteryBoxRollId: true,
      verificationRequestedAt: true,
      wawNoJug: true,
      wawFixedWunderwaffe: true,
      firstRoomVariant: true,
      bo2BankUsed: true,
      useFortuneCards: true,
      useDirectorsCut: true,
      bo3GobbleGumMode: true,
      bo3AatUsed: true,
      bo4ElixirMode: true,
      bocwSupportMode: true,
      bo6GobbleGumMode: true,
      bo6SupportMode: true,
      bo7SupportMode: true,
      bo7IsCursedRun: true,
      bo7RelicsUsed: true,
      rampageInducerUsed: true,
      ww2ConsumablesUsed: true,
      vanguardVoidUsed: true,
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
      const createdLog = await prisma.$transaction(async (tx) => {
        const newLog = await tx.challengeLog.create({
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
            // If the original run was submitted for verification, submit the accepted copy for verification too
            ...((log as { verificationRequestedAt?: Date | null }).verificationRequestedAt != null && {
              verificationRequestedAt: new Date(),
            }),
            ...(log.difficulty != null && { difficulty: log.difficulty }),
            ...(log.wawNoJug != null && { wawNoJug: log.wawNoJug }),
            ...(log.wawFixedWunderwaffe != null && { wawFixedWunderwaffe: log.wawFixedWunderwaffe }),
            ...(log.firstRoomVariant != null && { firstRoomVariant: log.firstRoomVariant }),
            ...(log.bo2BankUsed != null && { bo2BankUsed: log.bo2BankUsed }),
            ...(log.useFortuneCards != null && { useFortuneCards: log.useFortuneCards }),
            ...(log.useDirectorsCut != null && { useDirectorsCut: log.useDirectorsCut }),
            ...(log.bo3GobbleGumMode != null && { bo3GobbleGumMode: log.bo3GobbleGumMode }),
            ...(log.bo3AatUsed != null && { bo3AatUsed: log.bo3AatUsed }),
            ...(log.bo4ElixirMode != null && { bo4ElixirMode: log.bo4ElixirMode }),
            ...(log.bocwSupportMode != null && { bocwSupportMode: log.bocwSupportMode }),
            ...(log.bo6GobbleGumMode != null && { bo6GobbleGumMode: log.bo6GobbleGumMode }),
            ...(log.bo6SupportMode != null && { bo6SupportMode: log.bo6SupportMode }),
            ...(log.bo7SupportMode != null && { bo7SupportMode: log.bo7SupportMode }),
            ...(log.bo7IsCursedRun != null && { bo7IsCursedRun: log.bo7IsCursedRun }),
            ...(log.bo7RelicsUsed != null && { bo7RelicsUsed: log.bo7RelicsUsed }),
            ...(log.rampageInducerUsed != null && { rampageInducerUsed: log.rampageInducerUsed }),
            ...(log.ww2ConsumablesUsed != null && { ww2ConsumablesUsed: log.ww2ConsumablesUsed }),
            ...(log.vanguardVoidUsed != null && { vanguardVoidUsed: log.vanguardVoidUsed }),
          },
        });
        await tx.coOpRunPending.update({
          where: { id: pendingId },
          data: { status: 'CONFIRMED' },
        });
        return newLog;
      });
      const newlyUnlocked = await processMapAchievements(me.id, log.mapId);
      let xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);

      // Mystery box: if original log was from a mystery box roll, award completion + XP to teammate
      let mysteryBoxXp = 0;
      let mysteryBoxTotalXp: number | undefined;
      let mysteryBoxCompletionsCount: number | undefined;
      if (log.mysteryBoxRollId) {
        const roll = await prisma.mysteryBoxRoll.findUnique({
          where: { id: log.mysteryBoxRollId },
          include: { lobby: { include: { members: { select: { userId: true } } } } },
        });
        if (roll && roll.mapId === log.mapId && roll.challengeId === log.challengeId) {
          const tags = (roll.tags ?? {}) as Record<string, unknown>;
          const arrEq = (a: unknown[], b: unknown[]) =>
            JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
          const tagMatch =
            (tags.wawNoJug === undefined || tags.wawNoJug === (log.wawNoJug ?? false)) &&
            (tags.wawFixedWunderwaffe === undefined || tags.wawFixedWunderwaffe === (log.wawFixedWunderwaffe ?? false)) &&
            (tags.firstRoomVariant === undefined || tags.firstRoomVariant === (log.firstRoomVariant ?? null)) &&
            (tags.bo2BankUsed === undefined || tags.bo2BankUsed === (log.bo2BankUsed ?? null)) &&
            (tags.useFortuneCards === undefined || tags.useFortuneCards === (log.useFortuneCards ?? undefined)) &&
            (tags.useDirectorsCut === undefined || tags.useDirectorsCut === (log.useDirectorsCut ?? false)) &&
            (tags.bo3GobbleGumMode === undefined || tags.bo3GobbleGumMode === (log.bo3GobbleGumMode ?? null)) &&
            (tags.bo3AatUsed === undefined || tags.bo3AatUsed === (log.bo3AatUsed ?? null)) &&
            (tags.bo4ElixirMode === undefined || tags.bo4ElixirMode === (log.bo4ElixirMode ?? null)) &&
            (tags.bocwSupportMode === undefined || tags.bocwSupportMode === (log.bocwSupportMode ?? null)) &&
            (tags.bo6GobbleGumMode === undefined || tags.bo6GobbleGumMode === (log.bo6GobbleGumMode ?? null)) &&
            (tags.bo6SupportMode === undefined || tags.bo6SupportMode === (log.bo6SupportMode ?? null)) &&
            (tags.bo7SupportMode === undefined || tags.bo7SupportMode === (log.bo7SupportMode ?? null)) &&
            (tags.bo7IsCursedRun === undefined || tags.bo7IsCursedRun === (log.bo7IsCursedRun ?? false)) &&
            (tags.bo7RelicsUsed === undefined || (Array.isArray(tags.bo7RelicsUsed) && Array.isArray(log.bo7RelicsUsed) && arrEq(tags.bo7RelicsUsed as unknown[], log.bo7RelicsUsed as unknown[]))) &&
            (tags.rampageInducerUsed === undefined || tags.rampageInducerUsed === (log.rampageInducerUsed ?? null)) &&
            (tags.ww2ConsumablesUsed === undefined || tags.ww2ConsumablesUsed === (log.ww2ConsumablesUsed ?? null)) &&
            (tags.vanguardVoidUsed === undefined || tags.vanguardVoidUsed === (log.vanguardVoidUsed ?? null));
          if (tagMatch) {
            const existingCompletion = await prisma.mysteryBoxCompletion.findUnique({
              where: { userId_rollId: { userId: me.id, rollId: roll.id } },
            });
            if (!existingCompletion) {
              const filterSettings = (roll.filterSettings ?? {}) as MysteryBoxFilterSettings | null;
              mysteryBoxXp = computeMysteryBoxXp(filterSettings, log.roundReached);
              await prisma.$transaction([
                prisma.mysteryBoxCompletion.create({
                  data: {
                    userId: me.id,
                    rollId: roll.id,
                    challengeLogId: createdLog.id,
                    xpAwarded: mysteryBoxXp,
                  },
                }),
                prisma.user.update({
                  where: { id: me.id },
                  data: {
                    totalXp: { increment: mysteryBoxXp },
                    mysteryBoxCompletionsLifetime: { increment: 1 },
                  },
                }),
              ]);
              const lobbyUserIds = [roll.lobby.hostId, ...roll.lobby.members.map((m) => m.userId)];
              const expectedCount = new Set(lobbyUserIds).size;
              const completionCount = await prisma.mysteryBoxCompletion.count({ where: { rollId: roll.id } });
              if (completionCount >= expectedCount) {
                await prisma.mysteryBoxRoll.update({
                  where: { id: roll.id },
                  data: { completedByHost: true },
                });
              }
            }
          }
        }
      }

      xpGained += mysteryBoxXp;
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
        if (mysteryBoxXp > 0) {
          mysteryBoxTotalXp = (await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true } }))?.totalXp;
          mysteryBoxCompletionsCount = (
            await prisma.user.findUnique({
              where: { id: me.id },
              select: { mysteryBoxCompletionsLifetime: true },
            })
          )?.mysteryBoxCompletionsLifetime ?? 0;
        }
      } else {
        const u = await prisma.user.findUnique({ where: { id: me.id }, select: { totalXp: true } });
        totalXp = u?.totalXp;
      }
      return NextResponse.json({
        ok: true,
        logType: 'challenge',
        xpGained,
        totalXp,
        ...(mysteryBoxXp > 0 && {
          mysteryBoxXp,
          mysteryBoxTotalXp: mysteryBoxTotalXp ?? totalXp,
          mysteryBoxCompletionsCount,
        }),
      });
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
            // If the original run was submitted for verification, submit the accepted copy for verification too
            ...((log as { verificationRequestedAt?: Date | null }).verificationRequestedAt != null && {
              verificationRequestedAt: new Date(),
            }),
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
