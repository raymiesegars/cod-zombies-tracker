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
  if (!log || log.userId !== user.id) return { error: 'Not found' as const, status: 404 as const };
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

    const body = await request.json();
    const roundReached = body.roundReached != null ? (typeof body.roundReached === 'number' ? body.roundReached : parseInt(String(body.roundReached), 10)) : undefined;
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
    const completionTimeSeconds = body.completionTimeSeconds !== undefined
      ? (body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds)) ? Math.max(0, Math.floor(Number(body.completionTimeSeconds))) : null)
      : undefined;
    const teammateUserIds = body.teammateUserIds !== undefined
      ? (Array.isArray(body.teammateUserIds) ? body.teammateUserIds.filter((id: unknown) => typeof id === 'string').slice(0, 10) : [])
      : undefined;
    const teammateNonUserNames = body.teammateNonUserNames !== undefined
      ? (Array.isArray(body.teammateNonUserNames) ? body.teammateNonUserNames.filter((n: unknown) => typeof n === 'string').slice(0, 10) : [])
      : undefined;
    const requestVerification = body.requestVerification === undefined ? undefined : Boolean(body.requestVerification);

    let difficulty: Bo4Difficulty | undefined;
    if (body.difficulty !== undefined) {
      const mapWithGame = log.map ?? await prisma.map.findUnique({ where: { id: log.mapId }, include: { game: { select: { shortName: true } } } });
      if (isBo4Game((mapWithGame as { game?: { shortName?: string } })?.game?.shortName)) {
        if (!body.difficulty || !BO4_DIFFICULTIES.includes(body.difficulty as any)) {
          return NextResponse.json({ error: 'BO4 maps require difficulty: CASUAL, NORMAL, HARDCORE, or REALISTIC' }, { status: 400 });
        }
        difficulty = body.difficulty as Bo4Difficulty;
      }
    }

    if (roundReached !== undefined && (Number.isNaN(roundReached) || roundReached < 1)) {
      return NextResponse.json({ error: 'Invalid roundReached' }, { status: 400 });
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
