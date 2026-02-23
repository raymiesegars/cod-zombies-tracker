import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { revokeVerifiedAchievementsForMapIfNeeded } from '@/lib/verified-xp';
import { getLevelFromXp } from '@/lib/ranks';
import { revokeAchievementsForMapAfterDelete } from '@/lib/achievements';
import { normalizeProofUrls, validateProofUrl } from '@/lib/utils';
import { createCoOpRunPendingsForChallengeLog } from '@/lib/coop-pending';
import { isBo4Game, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isIwGame, isIwSpeedrunChallengeType, isSpeedrunChallengeType, getMinRoundForSpeedrunChallengeType } from '@/lib/iw';
import { isBo3Game, BO3_GOBBLEGUM_MODES } from '@/lib/bo3';
import { isBocwGame, BOCW_SUPPORT_MODES } from '@/lib/bocw';
import { isBo6Game, BO6_GOBBLEGUM_MODES, BO6_SUPPORT_MODES } from '@/lib/bo6';
import { isBo7Game, BO7_SUPPORT_MODES, BO7_RELICS } from '@/lib/bo7';
import type { Bo4Difficulty } from '@prisma/client';

type Params = { params: Promise<{ id: string }> };

async function getLogAndUser(id: string) {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const };
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });
  if (!user) return { error: 'User not found' as const, status: 404 as const };
  const log = await prisma.challengeLog.findUnique({
    where: { id },
    include: {
      challenge: true,
      map: { include: { game: true } },
    },
  });
  if (!log) return { error: 'Not found' as const, status: 404 as const };
  const isOwner = log.userId === user.id;
  const isAdminEditingPending = user.isAdmin === true && (log as { verificationRequestedAt?: string | null }).verificationRequestedAt != null && !log.isVerified;
  if (!isOwner && !isSuperAdmin(user.id) && !isAdminEditingPending) return { error: 'Not found' as const, status: 404 as const };
  return { log, user };
}

// Get log: owner always; others can view if log owner's profile is public
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const log = await prisma.challengeLog.findUnique({
      where: { id },
      include: {
        challenge: true,
        map: { include: { game: true } },
        user: { select: { id: true, isPublic: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, totalXp: true } },
      },
    });
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true, isAdmin: true } })
      : null;
    const isOwner = currentUser && log.userId === currentUser.id;
    const isAdmin = currentUser?.isAdmin === true;
    if (!isOwner && !log.user.isPublic && !isAdmin) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { user: u, ...logWithoutUser } = log;
    const teammateUserIds = (logWithoutUser as { teammateUserIds?: string[] }).teammateUserIds ?? [];
    let teammateUserDetails: { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; level: number }[] = [];
    if (teammateUserIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: teammateUserIds } },
        select: { id: true, username: true, displayName: true, avatarUrl: true, avatarPreset: true, totalXp: true },
      });
      teammateUserDetails = users.map((tu) => ({
        id: tu.id,
        username: tu.username,
        displayName: tu.displayName,
        avatarUrl: tu.avatarUrl,
        avatarPreset: tu.avatarPreset,
        level: getLevelFromXp(tu.totalXp ?? 0).level,
      }));
    }
    const runOwner = {
      id: u.id,
      username: u.username,
      displayName: u.displayName ?? u.username,
      avatarUrl: u.avatarUrl,
      avatarPreset: u.avatarPreset,
      level: getLevelFromXp(u.totalXp ?? 0).level,
    };
    return NextResponse.json({
      ...logWithoutUser,
      isOwner: isOwner ?? false,
      runOwnerUsername: u.username ?? undefined,
      runOwnerDisplayName: u.displayName ?? u.username ?? undefined,
      runOwner,
      teammateUserDetails,
    });
  } catch (error) {
    console.error('Error fetching challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update round, proof, notes, etc.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    const { log, user } = result;

    // Verified runs are immutable for everyone except super admins
    if (log.isVerified && !isSuperAdmin(user.id)) {
      return NextResponse.json(
        { error: 'This run has been verified and can no longer be edited. Contact a super admin if changes are needed.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const roundReached =
      body.roundReached != null
        ? Math.floor(Number(body.roundReached))
        : undefined;
    const playerCount = body.playerCount;
    const proofUrlsRaw =
      body.proofUrls !== undefined
        ? (Array.isArray(body.proofUrls) ? body.proofUrls : [body.proofUrls])
        : undefined;
    if (proofUrlsRaw !== undefined) {
      for (const u of proofUrlsRaw) {
        const err = validateProofUrl(String(u));
        if (err) return NextResponse.json({ error: `Proof URL: ${err}` }, { status: 400 });
      }
    }
    const proofUrls = proofUrlsRaw !== undefined ? normalizeProofUrls(proofUrlsRaw.map(String)) : undefined;
    const screenshotUrl = body.screenshotUrl !== undefined ? body.screenshotUrl : undefined;
    const notes = body.notes !== undefined ? body.notes : undefined;
    const completionTimeSeconds =
      body.completionTimeSeconds !== undefined
        ? (body.completionTimeSeconds != null &&
          Number.isFinite(Number(body.completionTimeSeconds))
          ? Math.max(0, Math.floor(Number(body.completionTimeSeconds)))
          : null)
        : undefined;
    const teammateUserIds = body.teammateUserIds !== undefined
      ? (Array.isArray(body.teammateUserIds) ? body.teammateUserIds.filter((id: unknown) => typeof id === 'string').slice(0, 10) : [])
      : undefined;
    const teammateNonUserNames = body.teammateNonUserNames !== undefined
      ? (Array.isArray(body.teammateNonUserNames) ? body.teammateNonUserNames.filter((n: unknown) => typeof n === 'string').slice(0, 10) : [])
      : undefined;
    const requestVerification = body.requestVerification === undefined ? undefined : Boolean(body.requestVerification);
    const useFortuneCards = body.useFortuneCards !== undefined ? (body.useFortuneCards === true || body.useFortuneCards === false ? body.useFortuneCards : undefined) : undefined;
    const useDirectorsCut = body.useDirectorsCut !== undefined ? Boolean(body.useDirectorsCut) : undefined;

    const mapWithGame = log.map ?? await prisma.map.findUnique({ where: { id: log.mapId }, include: { game: { select: { shortName: true } } } });
    const gameShortName = (mapWithGame as { game?: { shortName?: string } })?.game?.shortName;
    if (isIwGame(gameShortName) && useFortuneCards !== undefined && useFortuneCards !== true && useFortuneCards !== false) {
      return NextResponse.json({ error: 'IW maps require useFortuneCards: true or false' }, { status: 400 });
    }

    const bo3GobbleGumMode = body.bo3GobbleGumMode !== undefined
      ? isBo3Game(gameShortName) && (BO3_GOBBLEGUM_MODES as readonly string[]).includes(body.bo3GobbleGumMode) ? body.bo3GobbleGumMode : undefined
      : undefined;
    const bo3AatUsed = body.bo3AatUsed !== undefined && isBo3Game(gameShortName) ? Boolean(body.bo3AatUsed) : undefined;
    const bo4ElixirMode = body.bo4ElixirMode !== undefined && isBo4Game(gameShortName) ? body.bo4ElixirMode : undefined;
    const bocwSupportMode = body.bocwSupportMode !== undefined
      ? isBocwGame(gameShortName) && (BOCW_SUPPORT_MODES as readonly string[]).includes(body.bocwSupportMode) ? body.bocwSupportMode : undefined
      : undefined;
    const bo6GobbleGumMode = body.bo6GobbleGumMode !== undefined
      ? isBo6Game(gameShortName) && (BO6_GOBBLEGUM_MODES as readonly string[]).includes(body.bo6GobbleGumMode) ? body.bo6GobbleGumMode : undefined
      : undefined;
    const bo6SupportMode = body.bo6SupportMode !== undefined
      ? isBo6Game(gameShortName) && (BO6_SUPPORT_MODES as readonly string[]).includes(body.bo6SupportMode) ? body.bo6SupportMode : undefined
      : undefined;
    const bo7SupportMode = body.bo7SupportMode !== undefined
      ? isBo7Game(gameShortName) && (BO7_SUPPORT_MODES as readonly string[]).includes(body.bo7SupportMode) ? body.bo7SupportMode : undefined
      : undefined;
    const bo7IsCursedRun = body.bo7IsCursedRun !== undefined && isBo7Game(gameShortName) ? Boolean(body.bo7IsCursedRun) : undefined;
    const bo7RelicsUsed = body.bo7RelicsUsed !== undefined && isBo7Game(gameShortName) && Array.isArray(body.bo7RelicsUsed)
      ? (body.bo7RelicsUsed as unknown[]).filter((r): r is string => (BO7_RELICS as readonly string[]).includes(r as string))
      : undefined;
    const rampageInducerUsed = body.rampageInducerUsed !== undefined && (isBocwGame(gameShortName) || isBo6Game(gameShortName) || isBo7Game(gameShortName))
      ? Boolean(body.rampageInducerUsed)
      : undefined;

    let difficulty: Bo4Difficulty | undefined;
    if (body.difficulty !== undefined) {
      if (isBo4Game(gameShortName)) {
        if (!body.difficulty || !BO4_DIFFICULTIES.includes(body.difficulty as any)) {
          return NextResponse.json({ error: 'BO4 maps require difficulty: CASUAL, NORMAL, HARDCORE, or REALISTIC' }, { status: 400 });
        }
        difficulty = body.difficulty as Bo4Difficulty;
      }
    }

    if (roundReached !== undefined && (Number.isNaN(roundReached) || roundReached < 1)) {
      return NextResponse.json({ error: 'Invalid roundReached' }, { status: 400 });
    }
    const challenge = log.challenge;
    if (roundReached !== undefined && challenge && isSpeedrunChallengeType(challenge.type)) {
      const minRound = getMinRoundForSpeedrunChallengeType(challenge.type);
      if (roundReached < minRound) {
        return NextResponse.json(
          { error: `Round must be at least ${minRound} for this challenge (e.g. Round ${minRound} Speedrun requires round ${minRound}+).` },
          { status: 400 }
        );
      }
    }

    if (requestVerification === true) {
      const effectiveProofUrls = proofUrls !== undefined ? proofUrls : (log.proofUrls ?? []);
      const effectiveScreenshotUrl = screenshotUrl !== undefined ? screenshotUrl : log.screenshotUrl;
      const hasProof = (Array.isArray(effectiveProofUrls) && effectiveProofUrls.filter(Boolean).length > 0) || !!effectiveScreenshotUrl;
      if (!hasProof) {
        return NextResponse.json(
          { error: 'To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.challengeLog.update({
      where: { id },
      data: {
        ...(roundReached !== undefined && { roundReached }),
        ...(playerCount !== undefined && { playerCount }),
        ...(proofUrls !== undefined && { proofUrls }),
        ...(screenshotUrl !== undefined && { screenshotUrl }),
        ...(notes !== undefined && { notes }),
        ...(completionTimeSeconds !== undefined && { completionTimeSeconds }),
        ...(teammateUserIds !== undefined && { teammateUserIds }),
        ...(teammateNonUserNames !== undefined && { teammateNonUserNames }),
        ...(difficulty !== undefined && { difficulty }),
        ...(requestVerification !== undefined && {
          verificationRequestedAt: requestVerification ? new Date() : null,
        }),
        ...(useFortuneCards !== undefined && { useFortuneCards }),
        ...(useDirectorsCut !== undefined && { useDirectorsCut }),
        ...(bo3GobbleGumMode !== undefined && { bo3GobbleGumMode }),
        ...(bo3AatUsed !== undefined && { bo3AatUsed }),
        ...(bo4ElixirMode !== undefined && { bo4ElixirMode }),
        ...(bocwSupportMode !== undefined && { bocwSupportMode }),
        ...(bo6GobbleGumMode !== undefined && { bo6GobbleGumMode }),
        ...(bo6SupportMode !== undefined && { bo6SupportMode }),
        ...(bo7SupportMode !== undefined && { bo7SupportMode }),
        ...(bo7IsCursedRun !== undefined && { bo7IsCursedRun }),
        ...(bo7RelicsUsed !== undefined && { bo7RelicsUsed }),
        ...(rampageInducerUsed !== undefined && { rampageInducerUsed }),
      },
      include: {
        challenge: true,
        map: { include: { game: true } },
      },
    });
    if (teammateUserIds !== undefined && teammateUserIds.length > 0) {
      await createCoOpRunPendingsForChallengeLog(id, user.id, teammateUserIds);
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete your log; super admins can delete any log. We revoke achievements and subtract XP.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const log = await prisma.challengeLog.findUnique({
      where: { id },
      include: { challenge: true, map: { include: { game: true } } },
    });
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwner = log.userId === currentUser.id;
    const canDelete = isOwner || isSuperAdmin(currentUser.id);
    if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const mapId = log.mapId;
    const userId = log.userId;

    await prisma.challengeLog.delete({ where: { id } });
    const { xpSubtracted } = await revokeAchievementsForMapAfterDelete(userId, mapId);
    await revokeVerifiedAchievementsForMapIfNeeded(userId, mapId);

    return NextResponse.json({
      deleted: true,
      xpSubtracted,
    });
  } catch (error) {
    console.error('Error deleting challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
