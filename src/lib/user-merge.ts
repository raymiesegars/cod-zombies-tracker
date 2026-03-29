import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { processMapAchievements } from '@/lib/achievements';
import { grantVerifiedAchievementsForMap } from '@/lib/verified-xp';
import { getLevelFromXp } from '@/lib/ranks';
import { claimVerifiedLevelMilestones } from '@/lib/verified-level-milestones';
import { refreshStoredRankOneCountsForMaps } from '@/lib/world-records';

type MergeableUser = {
  id: string;
  username: string;
  displayName: string | null;
  isArchived: boolean;
  isExternalPlaceholder: boolean;
};

type ChallengeLogShape = {
  id: string;
  mapId: string;
  challengeId: string;
  playerCount: string;
  roundReached: number;
  completionTimeSeconds: number | null;
  killsReached: number | null;
  scoreReached: number | null;
  difficulty: string | null;
  isVerified: boolean;
  verifiedAt: Date | null;
  verifiedById: string | null;
  proofUrls: string[];
  screenshotUrl: string | null;
  bo3GobbleGumMode: string | null;
  bo3AatUsed: boolean | null;
  bo4ElixirMode: string | null;
  bocwSupportMode: string | null;
  bo6GobbleGumMode: string | null;
  bo6SupportMode: string | null;
  bo7GobbleGumMode: string | null;
  bo7SupportMode: string | null;
  bo7IsCursedRun: boolean | null;
  bo7RelicsUsed: string[];
  useFortuneCards: boolean | null;
  useDirectorsCut: boolean | null;
  rampageInducerUsed: boolean | null;
  vanguardVoidUsed: boolean | null;
  ww2ConsumablesUsed: boolean | null;
  wawNoJug: boolean | null;
  wawFixedWunderwaffe: boolean | null;
  bo2BankUsed: boolean | null;
  firstRoomVariant: string | null;
  teammateUserIds: string[];
};

type EasterEggLogShape = {
  id: string;
  mapId: string;
  easterEggId: string;
  playerCount: string;
  roundCompleted: number | null;
  completionTimeSeconds: number | null;
  difficulty: string | null;
  isSolo: boolean;
  isNoGuide: boolean;
  isVerified: boolean;
  verifiedAt: Date | null;
  verifiedById: string | null;
  proofUrls: string[];
  screenshotUrl: string | null;
  rampageInducerUsed: boolean | null;
  vanguardVoidUsed: boolean | null;
  ww2ConsumablesUsed: boolean | null;
  teammateUserIds: string[];
};

type MergePreview = {
  sourceUser: MergeableUser;
  targetUser: MergeableUser;
  moveChallengeLogCount: number;
  moveEasterEggLogCount: number;
  duplicateChallengeLogCount: number;
  duplicateEasterEggLogCount: number;
  sourceChallengeLogCount: number;
  sourceEasterEggLogCount: number;
  sourceVerifiedChallengeLogCount: number;
  sourceVerifiedEasterEggLogCount: number;
  touchedMapCount: number;
};

type MergeMeta = {
  version: 1;
  movedChallengeLogIds: string[];
  movedEeLogIds: string[];
  promotedTargetChallengeIds: string[];
  promotedTargetEeIds: string[];
  movedIdentityKeys: Array<{ source: string; externalKey: string }>;
  touchedMapIds: string[];
  sourceWasPublic: boolean;
};

export type MergeExecuteResult = MergePreview & {
  movedChallengeLogCount: number;
  movedEasterEggLogCount: number;
  deletedDuplicateChallengeLogCount: number;
  deletedDuplicateEasterEggLogCount: number;
  archivedSourceUserId: string;
  targetUserId: string;
};

export type MergeHistoryEntry = {
  id: string;
  createdAt: string;
  notes: string | null;
  sourceUser: {
    id: string;
    username: string;
    displayName: string | null;
    isArchived: boolean;
  };
  targetUser: {
    id: string;
    username: string;
    displayName: string | null;
    isArchived: boolean;
  };
  mergedByUser: {
    id: string;
    username: string;
    displayName: string | null;
  };
  movedChallengeLogCount: number;
  movedEasterEggLogCount: number;
  skippedChallengeDuplicateCount: number;
  skippedEasterEggDuplicateCount: number;
  rollbackEligible: boolean;
};

function normString(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

function normProof(proofUrls: string[], screenshotUrl: string | null): string {
  const first = proofUrls.find((p) => p && p.trim().length > 0) ?? screenshotUrl ?? '';
  const s = normString(first);
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

function normBool(v: boolean | null): string {
  if (v == null) return '';
  return v ? '1' : '0';
}

function sortedRelics(relics: string[]): string {
  return relics.map((r) => r.trim().toLowerCase()).sort().join(',');
}

function challengeSig(log: ChallengeLogShape): string {
  return [
    log.mapId,
    log.challengeId,
    log.playerCount,
    String(log.roundReached),
    String(log.completionTimeSeconds ?? ''),
    String(log.killsReached ?? ''),
    String(log.scoreReached ?? ''),
    String(log.difficulty ?? ''),
    normProof(log.proofUrls, log.screenshotUrl),
    normString(log.bo3GobbleGumMode),
    normBool(log.bo3AatUsed),
    normString(log.bo4ElixirMode),
    normString(log.bocwSupportMode),
    normString(log.bo6GobbleGumMode),
    normString(log.bo6SupportMode),
    normString(log.bo7GobbleGumMode),
    normString(log.bo7SupportMode),
    normBool(log.bo7IsCursedRun),
    sortedRelics(log.bo7RelicsUsed ?? []),
    normBool(log.useFortuneCards),
    normBool(log.useDirectorsCut),
    normBool(log.rampageInducerUsed),
    normBool(log.vanguardVoidUsed),
    normBool(log.ww2ConsumablesUsed),
    normBool(log.wawNoJug),
    normBool(log.wawFixedWunderwaffe),
    normBool(log.bo2BankUsed),
    normString(log.firstRoomVariant),
  ].join('|');
}

function eeSig(log: EasterEggLogShape): string {
  return [
    log.mapId,
    log.easterEggId,
    log.playerCount,
    String(log.roundCompleted ?? ''),
    String(log.completionTimeSeconds ?? ''),
    String(log.difficulty ?? ''),
    normProof(log.proofUrls, log.screenshotUrl),
    normBool(log.isSolo),
    normBool(log.isNoGuide),
    normBool(log.rampageInducerUsed),
    normBool(log.vanguardVoidUsed),
    normBool(log.ww2ConsumablesUsed),
  ].join('|');
}

function replaceTeammateIds(ids: string[], sourceUserId: string, targetUserId: string): string[] {
  if (!ids.includes(sourceUserId)) return ids;
  const out = ids.map((id) => (id === sourceUserId ? targetUserId : id));
  return Array.from(new Set(out));
}

function stripWorldRecordsCache(profileStatBlocks: unknown): Record<string, unknown> {
  const existing =
    profileStatBlocks && typeof profileStatBlocks === 'object'
      ? ({ ...(profileStatBlocks as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  if ('worldRecordsCache' in existing) delete existing.worldRecordsCache;
  return existing;
}

function encodeMergeNotes(meta: MergeMeta, userNotes?: string): string {
  const encoded = JSON.stringify(meta);
  const trimmed = userNotes?.trim();
  if (!trimmed) return `__CZT_MERGE_META__${encoded}`;
  return `${trimmed}\n\n__CZT_MERGE_META__${encoded}`;
}

function parseMergeMeta(notes: string | null | undefined): MergeMeta | null {
  if (!notes) return null;
  const marker = '__CZT_MERGE_META__';
  const idx = notes.lastIndexOf(marker);
  if (idx < 0) return null;
  const raw = notes.slice(idx + marker.length).trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MergeMeta;
    if (
      parsed &&
      parsed.version === 1 &&
      Array.isArray(parsed.movedChallengeLogIds) &&
      Array.isArray(parsed.movedEeLogIds)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function stripMergeMeta(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const marker = '__CZT_MERGE_META__';
  const idx = notes.lastIndexOf(marker);
  const base = idx >= 0 ? notes.slice(0, idx).trim() : notes.trim();
  return base.length ? base : null;
}

async function getMergeUsers(sourceUserId: string, targetUserId: string): Promise<{
  sourceUser: MergeableUser;
  targetUser: MergeableUser;
}> {
  if (!sourceUserId || !targetUserId) throw new Error('sourceUserId and targetUserId are required');
  if (sourceUserId === targetUserId) throw new Error('Cannot merge a user into itself');

  const [sourceUser, targetUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sourceUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
        isArchived: true,
        isExternalPlaceholder: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
        isArchived: true,
        isExternalPlaceholder: true,
      },
    }),
  ]);

  if (!sourceUser) throw new Error('Source user not found');
  if (!targetUser) throw new Error('Target user not found');
  if (targetUser.isArchived) throw new Error('Target user is archived');
  if (sourceUser.isArchived) throw new Error('Source user is already archived');

  return { sourceUser, targetUser };
}

async function loadLogs(sourceUserId: string, targetUserId: string) {
  const [sourceChallengeLogs, targetChallengeLogs, sourceEeLogs, targetEeLogs] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { userId: sourceUserId },
      select: {
        id: true,
        mapId: true,
        challengeId: true,
        playerCount: true,
        roundReached: true,
        completionTimeSeconds: true,
        killsReached: true,
        scoreReached: true,
        difficulty: true,
        isVerified: true,
        verifiedAt: true,
        verifiedById: true,
        proofUrls: true,
        screenshotUrl: true,
        bo3GobbleGumMode: true,
        bo3AatUsed: true,
        bo4ElixirMode: true,
        bocwSupportMode: true,
        bo6GobbleGumMode: true,
        bo6SupportMode: true,
        bo7GobbleGumMode: true,
        bo7SupportMode: true,
        bo7IsCursedRun: true,
        bo7RelicsUsed: true,
        useFortuneCards: true,
        useDirectorsCut: true,
        rampageInducerUsed: true,
        vanguardVoidUsed: true,
        ww2ConsumablesUsed: true,
        wawNoJug: true,
        wawFixedWunderwaffe: true,
        bo2BankUsed: true,
        firstRoomVariant: true,
        teammateUserIds: true,
      },
    }),
    prisma.challengeLog.findMany({
      where: { userId: targetUserId },
      select: {
        id: true,
        mapId: true,
        challengeId: true,
        playerCount: true,
        roundReached: true,
        completionTimeSeconds: true,
        killsReached: true,
        scoreReached: true,
        difficulty: true,
        isVerified: true,
        verifiedAt: true,
        verifiedById: true,
        proofUrls: true,
        screenshotUrl: true,
        bo3GobbleGumMode: true,
        bo3AatUsed: true,
        bo4ElixirMode: true,
        bocwSupportMode: true,
        bo6GobbleGumMode: true,
        bo6SupportMode: true,
        bo7GobbleGumMode: true,
        bo7SupportMode: true,
        bo7IsCursedRun: true,
        bo7RelicsUsed: true,
        useFortuneCards: true,
        useDirectorsCut: true,
        rampageInducerUsed: true,
        vanguardVoidUsed: true,
        ww2ConsumablesUsed: true,
        wawNoJug: true,
        wawFixedWunderwaffe: true,
        bo2BankUsed: true,
        firstRoomVariant: true,
        teammateUserIds: true,
      },
    }),
    prisma.easterEggLog.findMany({
      where: { userId: sourceUserId },
      select: {
        id: true,
        mapId: true,
        easterEggId: true,
        playerCount: true,
        roundCompleted: true,
        completionTimeSeconds: true,
        difficulty: true,
        isSolo: true,
        isNoGuide: true,
        isVerified: true,
        verifiedAt: true,
        verifiedById: true,
        proofUrls: true,
        screenshotUrl: true,
        rampageInducerUsed: true,
        vanguardVoidUsed: true,
        ww2ConsumablesUsed: true,
        teammateUserIds: true,
      },
    }),
    prisma.easterEggLog.findMany({
      where: { userId: targetUserId },
      select: {
        id: true,
        mapId: true,
        easterEggId: true,
        playerCount: true,
        roundCompleted: true,
        completionTimeSeconds: true,
        difficulty: true,
        isSolo: true,
        isNoGuide: true,
        isVerified: true,
        verifiedAt: true,
        verifiedById: true,
        proofUrls: true,
        screenshotUrl: true,
        rampageInducerUsed: true,
        vanguardVoidUsed: true,
        ww2ConsumablesUsed: true,
        teammateUserIds: true,
      },
    }),
  ]);

  return {
    sourceChallengeLogs: sourceChallengeLogs as unknown as ChallengeLogShape[],
    targetChallengeLogs: targetChallengeLogs as unknown as ChallengeLogShape[],
    sourceEeLogs: sourceEeLogs as unknown as EasterEggLogShape[],
    targetEeLogs: targetEeLogs as unknown as EasterEggLogShape[],
  };
}

function buildDuplicateSets(
  sourceChallengeLogs: ChallengeLogShape[],
  targetChallengeLogs: ChallengeLogShape[],
  sourceEeLogs: EasterEggLogShape[],
  targetEeLogs: EasterEggLogShape[]
) {
  const challengeSigToTarget = new Map<string, ChallengeLogShape>();
  for (const log of targetChallengeLogs) {
    const sig = challengeSig(log);
    if (!challengeSigToTarget.has(sig)) challengeSigToTarget.set(sig, log);
  }

  const eeSigToTarget = new Map<string, EasterEggLogShape>();
  for (const log of targetEeLogs) {
    const sig = eeSig(log);
    if (!eeSigToTarget.has(sig)) eeSigToTarget.set(sig, log);
  }

  const duplicateSourceChallengeIds: string[] = [];
  const duplicateSourceEeIds: string[] = [];
  const moveSourceChallengeIds: string[] = [];
  const moveSourceEeIds: string[] = [];
  const targetChallengeNeedsVerify: string[] = [];
  const targetEeNeedsVerify: string[] = [];
  const touchedMapIds = new Set<string>();

  for (const s of sourceChallengeLogs) {
    touchedMapIds.add(s.mapId);
    const targetMatch = challengeSigToTarget.get(challengeSig(s));
    if (!targetMatch) {
      moveSourceChallengeIds.push(s.id);
      continue;
    }
    duplicateSourceChallengeIds.push(s.id);
    if (s.isVerified && !targetMatch.isVerified) targetChallengeNeedsVerify.push(targetMatch.id);
  }

  for (const s of sourceEeLogs) {
    touchedMapIds.add(s.mapId);
    const targetMatch = eeSigToTarget.get(eeSig(s));
    if (!targetMatch) {
      moveSourceEeIds.push(s.id);
      continue;
    }
    duplicateSourceEeIds.push(s.id);
    if (s.isVerified && !targetMatch.isVerified) targetEeNeedsVerify.push(targetMatch.id);
  }

  return {
    duplicateSourceChallengeIds,
    duplicateSourceEeIds,
    moveSourceChallengeIds,
    moveSourceEeIds,
    targetChallengeNeedsVerify: Array.from(new Set(targetChallengeNeedsVerify)),
    targetEeNeedsVerify: Array.from(new Set(targetEeNeedsVerify)),
    touchedMapIds: Array.from(touchedMapIds),
  };
}

export async function previewUserMerge(sourceUserId: string, targetUserId: string): Promise<MergePreview> {
  const { sourceUser, targetUser } = await getMergeUsers(sourceUserId, targetUserId);
  const { sourceChallengeLogs, targetChallengeLogs, sourceEeLogs, targetEeLogs } = await loadLogs(
    sourceUserId,
    targetUserId
  );

  const sets = buildDuplicateSets(sourceChallengeLogs, targetChallengeLogs, sourceEeLogs, targetEeLogs);

  return {
    sourceUser,
    targetUser,
    moveChallengeLogCount: sets.moveSourceChallengeIds.length,
    moveEasterEggLogCount: sets.moveSourceEeIds.length,
    duplicateChallengeLogCount: sets.duplicateSourceChallengeIds.length,
    duplicateEasterEggLogCount: sets.duplicateSourceEeIds.length,
    sourceChallengeLogCount: sourceChallengeLogs.length,
    sourceEasterEggLogCount: sourceEeLogs.length,
    sourceVerifiedChallengeLogCount: sourceChallengeLogs.filter((l) => l.isVerified).length,
    sourceVerifiedEasterEggLogCount: sourceEeLogs.filter((l) => l.isVerified).length,
    touchedMapCount: sets.touchedMapIds.length,
  };
}

async function revalidateMergedTargetUser(
  userId: string,
  touchedMapIds: string[]
): Promise<void> {
  if (touchedMapIds.length === 0) return;

  const uniqueMapIds = Array.from(new Set(touchedMapIds));

  for (const mapId of uniqueMapIds) {
    await processMapAchievements(userId, mapId, false);
  }

  const verifiedMapIdsSet = new Set<string>();
  const [verifiedChallengeMaps, verifiedEeMaps] = await Promise.all([
    prisma.challengeLog.findMany({
      where: { userId, mapId: { in: uniqueMapIds }, isVerified: true },
      select: { mapId: true },
      distinct: ['mapId'],
    }),
    prisma.easterEggLog.findMany({
      where: { userId, mapId: { in: uniqueMapIds }, isVerified: true },
      select: { mapId: true },
      distinct: ['mapId'],
    }),
  ]);
  for (const row of verifiedChallengeMaps) verifiedMapIdsSet.add(row.mapId);
  for (const row of verifiedEeMaps) verifiedMapIdsSet.add(row.mapId);

  for (const mapId of Array.from(verifiedMapIdsSet)) {
    await grantVerifiedAchievementsForMap(userId, mapId, { skipUserUpdate: true });
  }

  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { verifiedTotalXp: true },
  });
  const previousVerified = previous?.verifiedTotalXp ?? 0;

  const allUas = await prisma.userAchievement.findMany({
    where: { userId, achievement: { isActive: true } },
    select: {
      verifiedAt: true,
      achievement: {
        select: {
          xpReward: true,
          map: { select: { game: { select: { shortName: true } } } },
          easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
        },
      },
    },
  });

  let totalXp = 0;
  let customZombiesTotalXp = 0;
  let verifiedTotalXp = 0;
  let verifiedCustomZombiesTotalXp = 0;

  for (const ua of allUas) {
    const shortName =
      ua.achievement.map?.game?.shortName ??
      ua.achievement.easterEgg?.map?.game?.shortName ??
      null;
    const xp = ua.achievement.xpReward;
    const isCustom = shortName === 'BO3_CUSTOM';
    if (isCustom) customZombiesTotalXp += xp;
    else totalXp += xp;
    if (ua.verifiedAt) {
      if (isCustom) verifiedCustomZombiesTotalXp += xp;
      else verifiedTotalXp += xp;
    }
  }

  const level = getLevelFromXp(totalXp).level;
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp,
      customZombiesTotalXp,
      verifiedTotalXp,
      verifiedCustomZombiesTotalXp,
      level,
    },
  });

  await claimVerifiedLevelMilestones(userId, previousVerified, verifiedTotalXp);
}

export async function executeUserMerge(
  sourceUserId: string,
  targetUserId: string,
  mergedByUserId: string,
  notes?: string
): Promise<MergeExecuteResult> {
  const preview = await previewUserMerge(sourceUserId, targetUserId);
  const { sourceChallengeLogs, targetChallengeLogs, sourceEeLogs, targetEeLogs } = await loadLogs(
    sourceUserId,
    targetUserId
  );
  const sets = buildDuplicateSets(sourceChallengeLogs, targetChallengeLogs, sourceEeLogs, targetEeLogs);
  const now = new Date();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const sourceBefore = await tx.user.findUnique({
      where: { id: sourceUserId },
      select: { isPublic: true, profileStatBlocks: true },
    });
    const targetBefore = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { profileStatBlocks: true },
    });
    const sourceWasPublic = sourceBefore?.isPublic ?? true;

    if (sets.targetChallengeNeedsVerify.length > 0) {
      await tx.challengeLog.updateMany({
        where: { id: { in: sets.targetChallengeNeedsVerify } },
        data: { isVerified: true, verifiedAt: now },
      });
    }
    if (sets.targetEeNeedsVerify.length > 0) {
      await tx.easterEggLog.updateMany({
        where: { id: { in: sets.targetEeNeedsVerify } },
        data: { isVerified: true, verifiedAt: now },
      });
    }

    if (sets.moveSourceChallengeIds.length > 0) {
      await tx.challengeLog.updateMany({
        where: { id: { in: sets.moveSourceChallengeIds } },
        data: { userId: targetUserId },
      });
    }
    if (sets.moveSourceEeIds.length > 0) {
      await tx.easterEggLog.updateMany({
        where: { id: { in: sets.moveSourceEeIds } },
        data: { userId: targetUserId },
      });
    }

    const [challengeTeammateLogs, eeTeammateLogs] = await Promise.all([
      tx.challengeLog.findMany({
        where: { teammateUserIds: { has: sourceUserId } },
        select: { id: true, teammateUserIds: true },
      }),
      tx.easterEggLog.findMany({
        where: { teammateUserIds: { has: sourceUserId } },
        select: { id: true, teammateUserIds: true },
      }),
    ]);

    for (const log of challengeTeammateLogs) {
      const next = replaceTeammateIds(log.teammateUserIds, sourceUserId, targetUserId);
      await tx.challengeLog.update({
        where: { id: log.id },
        data: { teammateUserIds: next },
      });
    }
    for (const log of eeTeammateLogs) {
      const next = replaceTeammateIds(log.teammateUserIds, sourceUserId, targetUserId);
      await tx.easterEggLog.update({
        where: { id: log.id },
        data: { teammateUserIds: next },
      });
    }

    const sourceIdentities = await tx.externalAccountIdentity.findMany({
      where: { userId: sourceUserId },
      select: { source: true, externalName: true, externalKey: true },
    });
    if (sourceIdentities.length > 0) {
      await tx.externalAccountIdentity.createMany({
        data: sourceIdentities.map((x) => ({
          userId: targetUserId,
          source: x.source,
          externalName: x.externalName,
          externalKey: x.externalKey,
        })),
        skipDuplicates: true,
      });
      await tx.externalAccountIdentity.deleteMany({ where: { userId: sourceUserId } });
    }

    await tx.user.update({
      where: { id: sourceUserId },
      data: {
        isArchived: true,
        archivedAt: now,
        isPublic: false,
        archivedReason: notes?.trim() ? `Merged into ${targetUserId}: ${notes.trim()}` : `Merged into ${targetUserId}`,
        mergedIntoUserId: targetUserId,
      },
    });

    await Promise.all([
      tx.user.update({
        where: { id: sourceUserId },
        data: { profileStatBlocks: stripWorldRecordsCache(sourceBefore?.profileStatBlocks) as never },
      }),
      tx.user.update({
        where: { id: targetUserId },
        data: { profileStatBlocks: stripWorldRecordsCache(targetBefore?.profileStatBlocks) as never },
      }),
    ]);

    const meta: MergeMeta = {
      version: 1,
      movedChallengeLogIds: sets.moveSourceChallengeIds,
      movedEeLogIds: sets.moveSourceEeIds,
      promotedTargetChallengeIds: sets.targetChallengeNeedsVerify,
      promotedTargetEeIds: sets.targetEeNeedsVerify,
      movedIdentityKeys: sourceIdentities.map((x) => ({ source: String(x.source), externalKey: x.externalKey })),
      touchedMapIds: sets.touchedMapIds,
      sourceWasPublic,
    };

    await tx.userMergeAudit.create({
      data: {
        sourceUserId,
        targetUserId,
        mergedByUserId,
        movedChallengeLogCount: sets.moveSourceChallengeIds.length,
        movedEasterEggLogCount: sets.moveSourceEeIds.length,
        skippedChallengeDuplicateCount: sets.duplicateSourceChallengeIds.length,
        skippedEasterEggDuplicateCount: sets.duplicateSourceEeIds.length,
        notes: encodeMergeNotes(meta, notes),
      },
    });
  });

  await revalidateMergedTargetUser(targetUserId, sets.touchedMapIds);
  await refreshStoredRankOneCountsForMaps(sets.touchedMapIds);

  return {
    ...preview,
    movedChallengeLogCount: sets.moveSourceChallengeIds.length,
    movedEasterEggLogCount: sets.moveSourceEeIds.length,
    deletedDuplicateChallengeLogCount: 0,
    deletedDuplicateEasterEggLogCount: 0,
    archivedSourceUserId: sourceUserId,
    targetUserId,
  };
}

export async function listUserMergeHistory(limit = 100): Promise<MergeHistoryEntry[]> {
  const rows = await prisma.userMergeAudit.findMany({
    take: Math.max(1, Math.min(300, limit)),
    orderBy: { createdAt: 'desc' },
    include: {
      sourceUser: { select: { id: true, username: true, displayName: true, isArchived: true } },
      targetUser: { select: { id: true, username: true, displayName: true, isArchived: true } },
      mergedByUser: { select: { id: true, username: true, displayName: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    notes: stripMergeMeta(r.notes),
    sourceUser: r.sourceUser,
    targetUser: r.targetUser,
    mergedByUser: r.mergedByUser,
    movedChallengeLogCount: r.movedChallengeLogCount,
    movedEasterEggLogCount: r.movedEasterEggLogCount,
    skippedChallengeDuplicateCount: r.skippedChallengeDuplicateCount,
    skippedEasterEggDuplicateCount: r.skippedEasterEggDuplicateCount,
    rollbackEligible:
      r.sourceUser.isArchived &&
      r.sourceUser.id !== r.targetUser.id &&
      parseMergeMeta(r.notes) != null,
  }));
}

export async function rollbackUserMerge(auditId: string, rolledBackByUserId: string): Promise<void> {
  if (!auditId) throw new Error('auditId is required');
  const audit = await prisma.userMergeAudit.findUnique({
    where: { id: auditId },
    include: {
      sourceUser: { select: { id: true, isArchived: true, mergedIntoUserId: true, profileStatBlocks: true } },
      targetUser: { select: { id: true, isArchived: true, profileStatBlocks: true } },
    },
  });
  if (!audit) throw new Error('Merge audit not found');
  const meta = parseMergeMeta(audit.notes);
  if (!meta) throw new Error('This merge was created before rollback metadata and cannot be auto-rolled back');
  if (audit.targetUser.isArchived) throw new Error('Target user is archived; cannot rollback');
  if (!audit.sourceUser.isArchived) throw new Error('Source user is not archived');
  if (audit.sourceUser.mergedIntoUserId !== audit.targetUser.id) {
    throw new Error('Source user is no longer merged into this target');
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (meta.promotedTargetChallengeIds.length > 0) {
      await tx.challengeLog.updateMany({
        where: { id: { in: meta.promotedTargetChallengeIds }, userId: audit.targetUser.id },
        data: { isVerified: false, verifiedAt: null, verifiedById: null },
      });
    }
    if (meta.promotedTargetEeIds.length > 0) {
      await tx.easterEggLog.updateMany({
        where: { id: { in: meta.promotedTargetEeIds }, userId: audit.targetUser.id },
        data: { isVerified: false, verifiedAt: null, verifiedById: null },
      });
    }

    if (meta.movedChallengeLogIds.length > 0) {
      await tx.challengeLog.updateMany({
        where: { id: { in: meta.movedChallengeLogIds }, userId: audit.targetUser.id },
        data: { userId: audit.sourceUser.id },
      });
    }
    if (meta.movedEeLogIds.length > 0) {
      await tx.easterEggLog.updateMany({
        where: { id: { in: meta.movedEeLogIds }, userId: audit.targetUser.id },
        data: { userId: audit.sourceUser.id },
      });
    }

    if (meta.movedIdentityKeys.length > 0) {
      const targetIdentities = await tx.externalAccountIdentity.findMany({
        where: {
          userId: audit.targetUser.id,
          OR: meta.movedIdentityKeys.map((k) => ({ source: k.source as never, externalKey: k.externalKey })),
        },
        select: { source: true, externalName: true, externalKey: true },
      });
      if (targetIdentities.length > 0) {
        await tx.externalAccountIdentity.createMany({
          data: targetIdentities.map((x) => ({
            userId: audit.sourceUser.id,
            source: x.source,
            externalName: x.externalName,
            externalKey: x.externalKey,
          })),
          skipDuplicates: true,
        });
        await tx.externalAccountIdentity.deleteMany({
          where: {
            userId: audit.targetUser.id,
            OR: targetIdentities.map((x) => ({ source: x.source, externalKey: x.externalKey })),
          },
        });
      }
    }

    await tx.user.update({
      where: { id: audit.sourceUser.id },
      data: {
        isArchived: false,
        archivedAt: null,
        archivedReason: null,
        mergedIntoUserId: null,
        isPublic: meta.sourceWasPublic,
      },
    });

    await Promise.all([
      tx.user.update({
        where: { id: audit.sourceUser.id },
        data: { profileStatBlocks: stripWorldRecordsCache(audit.sourceUser.profileStatBlocks) as never },
      }),
      tx.user.update({
        where: { id: audit.targetUser.id },
        data: { profileStatBlocks: stripWorldRecordsCache(audit.targetUser.profileStatBlocks) as never },
      }),
    ]);

    await tx.userMergeAudit.create({
      data: {
        sourceUserId: audit.targetUser.id,
        targetUserId: audit.sourceUser.id,
        mergedByUserId: rolledBackByUserId,
        movedChallengeLogCount: meta.movedChallengeLogIds.length,
        movedEasterEggLogCount: meta.movedEeLogIds.length,
        skippedChallengeDuplicateCount: 0,
        skippedEasterEggDuplicateCount: 0,
        notes: `Rollback of merge ${audit.id}`,
      },
    });
  });

  await Promise.all([
    revalidateMergedTargetUser(audit.targetUser.id, meta.touchedMapIds),
    revalidateMergedTargetUser(audit.sourceUser.id, meta.touchedMapIds),
  ]);
  await refreshStoredRankOneCountsForMaps(meta.touchedMapIds);
}

