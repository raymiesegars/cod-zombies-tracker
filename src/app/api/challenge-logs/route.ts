import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { normalizeProofUrls, validateProofUrl } from '@/lib/utils';
import { createCoOpRunPendingsForChallengeLog } from '@/lib/coop-pending';
import { isBo4Game, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isIwGame, isSpeedrunChallengeType, getMinRoundForSpeedrunChallengeType } from '@/lib/iw';
import { isBo3Game, BO3_GOBBLEGUM_MODES, BO3_GOBBLEGUM_DEFAULT } from '@/lib/bo3';
import { isBocwGame, BOCW_SUPPORT_MODES, BOCW_SUPPORT_DEFAULT } from '@/lib/bocw';
import { isBo6Game, BO6_GOBBLEGUM_MODES, BO6_GOBBLEGUM_DEFAULT, BO6_SUPPORT_MODES, BO6_SUPPORT_DEFAULT } from '@/lib/bo6';
import { isBo7Game, BO7_SUPPORT_MODES, BO7_SUPPORT_DEFAULT, BO7_RELICS } from '@/lib/bo7';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
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
    const killsReached = body.killsReached != null
      ? (typeof body.killsReached === 'number' ? body.killsReached : parseInt(String(body.killsReached), 10))
      : undefined;
    const scoreReached = body.scoreReached != null
      ? (typeof body.scoreReached === 'number' ? body.scoreReached : parseInt(String(body.scoreReached), 10))
      : undefined;
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

    if (!challengeId || !mapId || !playerCount) {
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
        const c = await prisma.challenge.findUnique({ where: { id: challengeId }, select: { type: true } });
        if (!c) return null;
        if (isSpeedrunChallengeType(c.type)) {
          const best = await prisma.challengeLog.findFirst({
            where: {
              userId: user.id,
              challengeId,
              mapId,
              playerCount,
              completionTimeSeconds: { not: null },
              ...(body.difficulty != null && { difficulty: body.difficulty as Bo4Difficulty }),
              ...(body.bocwSupportMode != null && { bocwSupportMode: body.bocwSupportMode }),
            },
            orderBy: { completionTimeSeconds: 'asc' },
            select: { completionTimeSeconds: true },
          });
          return best ? { completionTimeSeconds: best.completionTimeSeconds } : null;
        }
        if (c.type === 'NO_MANS_LAND') {
          const best = await prisma.challengeLog.findFirst({
            where: {
              userId: user.id,
              challengeId,
              mapId,
              playerCount,
              killsReached: { not: null },
              ...(body.difficulty != null && { difficulty: body.difficulty as Bo4Difficulty }),
            },
            orderBy: { killsReached: 'desc' },
            select: { killsReached: true },
          });
          return best ? { killsReached: best.killsReached } : null;
        }
        if (c.type === 'RUSH') {
          const best = await prisma.challengeLog.findFirst({
            where: {
              userId: user.id,
              challengeId,
              mapId,
              playerCount,
              scoreReached: { not: null },
              ...(body.difficulty != null && { difficulty: body.difficulty as Bo4Difficulty }),
            },
            orderBy: { scoreReached: 'desc' },
            select: { scoreReached: true },
          });
          return best ? { scoreReached: best.scoreReached } : null;
        }
        const best = await prisma.challengeLog.findFirst({
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
        return best ? { roundReached: best.roundReached } : null;
      })(),
    ]);

    const map = mapWithGame;
    if (!challenge || !map) {
      return NextResponse.json({ error: 'Challenge or map not found' }, { status: 404 });
    }

    if (challenge.type === 'NO_MANS_LAND') {
      if (killsReached == null || Number.isNaN(killsReached) || killsReached < 1) {
        return NextResponse.json(
          { error: "No Man's Land requires a valid kills count (1+)." },
          { status: 400 }
        );
      }
    } else if (challenge.type === 'RUSH') {
      if (scoreReached == null || Number.isNaN(scoreReached) || scoreReached < 1) {
        return NextResponse.json(
          { error: 'Rush requires a valid score (1+).' },
          { status: 400 }
        );
      }
    } else {
      const minRound = isSpeedrunChallengeType(challenge.type) ? getMinRoundForSpeedrunChallengeType(challenge.type) : 1;
      if (Number.isNaN(roundReached) || roundReached < minRound) {
        return NextResponse.json(
          { error: `Round must be at least ${minRound} for this challenge (e.g. Round ${minRound} Speedrun requires round ${minRound}+).` },
          { status: 400 }
        );
      }
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

    const gameShortName = map.game?.shortName;
    const isIw = isIwGame(gameShortName);
    const isBo3 = isBo3Game(gameShortName);
    const isBocw = isBocwGame(gameShortName);
    const isBo6 = isBo6Game(gameShortName);
    const isBo7 = isBo7Game(gameShortName);
    const isSpeedrun = challenge && isSpeedrunChallengeType(challenge.type);

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

    const isWaw = gameShortName === 'WAW';
    if (isWaw && isSpeedrun && (completionTimeSeconds == null || completionTimeSeconds < 0)) {
      return NextResponse.json(
        { error: 'Speedrun challenges require completion time' },
        { status: 400 }
      );
    }

    if (isBo3) {
      const mode = body.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT;
      if (!(BO3_GOBBLEGUM_MODES as readonly string[]).includes(mode)) {
        return NextResponse.json({ error: 'Invalid bo3GobbleGumMode' }, { status: 400 });
      }
    }

    if (isBocw) {
      const mode = body.bocwSupportMode ?? BOCW_SUPPORT_DEFAULT;
      if (!(BOCW_SUPPORT_MODES as readonly string[]).includes(mode)) {
        return NextResponse.json({ error: 'Invalid bocwSupportMode' }, { status: 400 });
      }
    }

    if (isBo6) {
      const gg = body.bo6GobbleGumMode ?? BO6_GOBBLEGUM_DEFAULT;
      const sup = body.bo6SupportMode ?? BO6_SUPPORT_DEFAULT;
      if (!(BO6_GOBBLEGUM_MODES as readonly string[]).includes(gg)) {
        return NextResponse.json({ error: 'Invalid bo6GobbleGumMode' }, { status: 400 });
      }
      if (!(BO6_SUPPORT_MODES as readonly string[]).includes(sup)) {
        return NextResponse.json({ error: 'Invalid bo6SupportMode' }, { status: 400 });
      }
    }

    if (isBo7) {
      const sup = body.bo7SupportMode ?? BO7_SUPPORT_DEFAULT;
      if (!(BO7_SUPPORT_MODES as readonly string[]).includes(sup)) {
        return NextResponse.json({ error: 'Invalid bo7SupportMode' }, { status: 400 });
      }
      if (body.bo7IsCursedRun && Array.isArray(body.bo7RelicsUsed)) {
        const invalid = (body.bo7RelicsUsed as unknown[]).find((r) => !(BO7_RELICS as readonly string[]).includes(r as string));
        if (invalid) return NextResponse.json({ error: `Invalid relic: ${invalid}` }, { status: 400 });
      }
    }

    const useFortuneCards = isIw ? Boolean(body.useFortuneCards) : undefined;
    const useDirectorsCut = isIw ? Boolean(body.useDirectorsCut ?? false) : undefined;
    const bo3GobbleGumMode = isBo3 ? (body.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT) : undefined;
    const bo3AatUsed = isBo3 && body.bo3AatUsed !== undefined ? Boolean(body.bo3AatUsed) : undefined;
    const bo4ElixirMode = isBo4 ? (body.bo4ElixirMode ?? undefined) : undefined;
    const bocwSupportMode = isBocw ? (body.bocwSupportMode ?? BOCW_SUPPORT_DEFAULT) : undefined;
    const bo6GobbleGumMode = isBo6 ? (body.bo6GobbleGumMode ?? BO6_GOBBLEGUM_DEFAULT) : undefined;
    const bo6SupportMode = isBo6 ? (body.bo6SupportMode ?? BO6_SUPPORT_DEFAULT) : undefined;
    const bo7SupportMode = isBo7 ? (body.bo7SupportMode ?? BO7_SUPPORT_DEFAULT) : undefined;
    const bo7IsCursedRun = isBo7 ? Boolean(body.bo7IsCursedRun ?? false) : undefined;
    const bo7RelicsUsed = isBo7
      ? bo7IsCursedRun && Array.isArray(body.bo7RelicsUsed)
        ? (body.bo7RelicsUsed as string[]).filter((r) => (BO7_RELICS as readonly string[]).includes(r))
        : []
      : undefined;

    const wawNoJug = isWaw ? Boolean(body.wawNoJug ?? false) : undefined;
    const wawFixedWunderwaffe = isWaw ? Boolean(body.wawFixedWunderwaffe ?? false) : undefined;

    const isBo2 = map?.game?.shortName === 'BO2';
    const bo2HasBank = isBo2 && map ? getBo2MapConfig(map.slug)?.hasBank : false;
    const bo2BankUsed = bo2HasBank && body.bo2BankUsed !== undefined ? Boolean(body.bo2BankUsed) : undefined;

    const rampageInducerUsed = (isBocw || isBo6 || isBo7) && body.rampageInducerUsed !== undefined ? Boolean(body.rampageInducerUsed) : undefined;

    const isSpeedrunChal = challenge && isSpeedrunChallengeType(challenge.type);
    const isNoMansLandChal = challenge?.type === 'NO_MANS_LAND';
    const isRushChal = challenge?.type === 'RUSH';
    const previousRound = previousBest && 'roundReached' in previousBest ? previousBest.roundReached ?? 0 : 0;
    const previousKills = previousBest && 'killsReached' in previousBest ? previousBest.killsReached ?? 0 : 0;
    const previousScore = previousBest && 'scoreReached' in previousBest ? previousBest.scoreReached ?? 0 : 0;
    const previousTime = previousBest && 'completionTimeSeconds' in previousBest ? previousBest.completionTimeSeconds : null;
    const isImprovement = isSpeedrunChal
      ? (completionTimeSeconds != null && (previousTime == null || completionTimeSeconds < previousTime))
      : isNoMansLandChal
        ? (killsReached != null && killsReached > previousKills)
        : isRushChal
          ? (scoreReached != null && scoreReached > previousScore)
          : roundReached > previousRound;

    const effectiveRoundReached = challenge.type === 'RUSH' ? 1 : roundReached;
    const log = await prisma.challengeLog.create({
      data: {
        userId: user.id,
        challengeId,
        mapId,
        roundReached: effectiveRoundReached,
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
        ...(bo3GobbleGumMode != null && { bo3GobbleGumMode }),
        ...(bo3AatUsed != null && { bo3AatUsed }),
        ...(bo4ElixirMode != null && { bo4ElixirMode }),
        ...(bocwSupportMode != null && { bocwSupportMode }),
        ...(bo6GobbleGumMode != null && { bo6GobbleGumMode }),
        ...(bo6SupportMode != null && { bo6SupportMode }),
        ...(bo7SupportMode != null && { bo7SupportMode }),
        ...(bo7IsCursedRun != null && { bo7IsCursedRun }),
        ...(bo7RelicsUsed != null && { bo7RelicsUsed }),
        ...(wawNoJug != null && { wawNoJug }),
        ...(wawFixedWunderwaffe != null && { wawFixedWunderwaffe }),
        ...(bo2BankUsed != null && { bo2BankUsed }),
        ...(rampageInducerUsed != null && { rampageInducerUsed }),
        ...(killsReached != null && killsReached > 0 && { killsReached }),
        ...(scoreReached != null && scoreReached > 0 && { scoreReached }),
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
