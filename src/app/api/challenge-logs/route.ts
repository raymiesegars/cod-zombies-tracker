import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { normalizeProofUrls, validateProofUrl } from '@/lib/utils';
import { createCoOpRunPendingsForChallengeLog } from '@/lib/coop-pending';
import { isBo4Game, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isIwGame, isIwSpeedrunChallengeType, getMinRoundForSpeedrunChallengeType } from '@/lib/iw';
import type { Bo4Difficulty } from '@prisma/client';

// Log a new run. We run the achievement check when it’s a new best for that user+challenge+map+playerCount.
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const challengeId = body.challengeId;
    const mapId = body.mapId;
    const roundReached = typeof body.roundReached === 'number' ? body.roundReached : parseInt(String(body.roundReached), 10);
    const playerCount = body.playerCount;
    const rawProofUrls = Array.isArray(body.proofUrls)
      ? body.proofUrls
      : body.proofUrl != null
        ? [body.proofUrl]
        : [];
    for (const u of rawProofUrls) {
      const err = validateProofUrl(String(u));
      if (err) return NextResponse.json({ error: `Proof URL: ${err}` }, { status: 400 });
    }
    const proofUrls = normalizeProofUrls(rawProofUrls.map(String));
    const screenshotUrl = body.screenshotUrl ?? null;
    const notes = body.notes ?? null;
    const completionTimeSeconds = body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds))
      ? Math.max(0, Math.floor(Number(body.completionTimeSeconds)))
      : null;
    const teammateUserIds = Array.isArray(body.teammateUserIds) ? body.teammateUserIds.filter((id: unknown) => typeof id === 'string').slice(0, 10) : [];
    const teammateNonUserNames = Array.isArray(body.teammateNonUserNames) ? body.teammateNonUserNames.filter((n: unknown) => typeof n === 'string').slice(0, 10) : [];
    const requestVerification = Boolean(body.requestVerification);

    if (!challengeId || !mapId || Number.isNaN(roundReached) || roundReached < 1 || !playerCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (requestVerification) {
      const hasProof = (proofUrls?.filter(Boolean).length ?? 0) > 0 || !!screenshotUrl;
      if (!hasProof) {
        return NextResponse.json(
          { error: 'To request verification, add at least one proof (URL or screenshot) or uncheck "Request verification".' },
          { status: 400 }
        );
      }
    }

    const [challenge, mapWithGame, previousBest] = await Promise.all([
      prisma.challenge.findUnique({ where: { id: challengeId }, select: { id: true, type: true } }),
      prisma.map.findUnique({ where: { id: mapId }, include: { game: { select: { shortName: true } } } }),
      (async () => {
        const isSpeedrunType = challengeId
          ? await prisma.challenge.findUnique({ where: { id: challengeId }, select: { type: true } }).then((c) => c && isIwSpeedrunChallengeType(c.type))
          : false;
        if (isSpeedrunType) {
          const best = await prisma.challengeLog.findFirst({
            where: {
              userId: user.id,
              challengeId,
              mapId,
              playerCount,
              completionTimeSeconds: { not: null },
              ...(body.difficulty != null && { difficulty: body.difficulty as Bo4Difficulty }),
            },
            orderBy: { completionTimeSeconds: 'asc' },
            select: { completionTimeSeconds: true },
          });
          return best ? { completionTimeSeconds: best.completionTimeSeconds } : null;
        }
        return prisma.challengeLog.findFirst({
          where: {
            userId: user.id,
            challengeId,
            mapId,
            playerCount,
            ...(body.difficulty != null && { difficulty: body.difficulty as Bo4Difficulty }),
          },
          orderBy: { roundReached: 'desc' },
          select: { roundReached: true },
        });
      })(),
    ]);

    const map = mapWithGame;
    if (!challenge || !map) {
      return NextResponse.json({ error: 'Challenge or map not found' }, { status: 404 });
    }

    const minRound = isIwSpeedrunChallengeType(challenge.type) ? getMinRoundForSpeedrunChallengeType(challenge.type) : 1;
    if (roundReached < minRound) {
      return NextResponse.json(
        { error: `Round must be at least ${minRound} for this challenge (e.g. Round ${minRound} Speedrun requires round ${minRound}+).` },
        { status: 400 }
      );
    }

    const isBo4 = isBo4Game(map.game?.shortName);
    let difficulty: Bo4Difficulty | undefined;
    if (isBo4) {
      const d = body.difficulty;
      if (!d || !BO4_DIFFICULTIES.includes(d as any)) {
        return NextResponse.json(
          { error: 'BO4 maps require difficulty: CASUAL, NORMAL, HARDCORE, or REALISTIC' },
          { status: 400 }
        );
      }
      difficulty = d as Bo4Difficulty;
    }

    const isIw = isIwGame(map.game?.shortName);
    const isSpeedrun = challenge && isIwSpeedrunChallengeType(challenge.type);

    if (isIw) {
      const useFortuneCards = body.useFortuneCards;
      if (useFortuneCards !== true && useFortuneCards !== false) {
        return NextResponse.json(
          { error: 'IW maps require useFortuneCards: true (Fate & Fortune cards) or false (Fate cards only)' },
          { status: 400 }
        );
      }
      if (isSpeedrun && (completionTimeSeconds == null || completionTimeSeconds < 0)) {
        return NextResponse.json(
          { error: 'Speedrun challenges require completion time' },
          { status: 400 }
        );
      }
    }

    const useFortuneCards = isIw ? Boolean(body.useFortuneCards) : undefined;
    const useDirectorsCut = isIw ? Boolean(body.useDirectorsCut ?? false) : undefined;

    const isSpeedrunChal = challenge && isIwSpeedrunChallengeType(challenge.type);
    const previousRound = previousBest && 'roundReached' in previousBest ? previousBest.roundReached ?? 0 : 0;
    const previousTime = previousBest && 'completionTimeSeconds' in previousBest ? previousBest.completionTimeSeconds : null;
    const isImprovement = isSpeedrunChal
      ? (completionTimeSeconds != null && (previousTime == null || completionTimeSeconds < previousTime))
      : roundReached > previousRound;

    const log = await prisma.challengeLog.create({
      data: {
        userId: user.id,
        challengeId,
        mapId,
        roundReached,
        playerCount,
        proofUrls,
        screenshotUrl,
        notes,
        completionTimeSeconds,
        teammateUserIds,
        teammateNonUserNames,
        ...(difficulty != null && { difficulty }),
        ...(requestVerification && { verificationRequestedAt: new Date() }),
        ...(useFortuneCards != null && { useFortuneCards }),
        ...(useDirectorsCut != null && { useDirectorsCut }),
      },
    });

    if (teammateUserIds.length > 0) {
      await createCoOpRunPendingsForChallengeLog(log.id, user.id, teammateUserIds);
    }

    let newlyUnlocked: Awaited<ReturnType<typeof processMapAchievements>> = [];
    if (isImprovement) {
      newlyUnlocked = await processMapAchievements(user.id, mapId);
    }

    const xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
    const totalXp =
      xpGained > 0
        ? (await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true } }))?.totalXp ?? undefined
        : undefined;

    return NextResponse.json({
      ...log,
      xpGained,
      newlyUnlockedAchievements: newlyUnlocked.length,
      isNewRecord: isImprovement,
      ...(totalXp != null && { totalXp }),
    });
  } catch (error) {
    console.error('Error creating challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// List logs. ?userId and/or ?mapId to filter.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const mapId = searchParams.get('mapId');

  try {
    const logs = await prisma.challengeLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(mapId && { mapId }),
      },
      include: {
        challenge: true,
        map: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
          },
        },
      },
      orderBy: {
        roundReached: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching challenge logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
