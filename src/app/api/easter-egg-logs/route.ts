import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { normalizeProofUrls, validateProofUrl } from '@/lib/utils';
import { createCoOpRunPendingsForEasterEggLog } from '@/lib/coop-pending';
import { isBo4Game, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isBocwGame } from '@/lib/bocw';
import { isBo6Game } from '@/lib/bo6';
import { isBo7Game } from '@/lib/bo7';
import { isWw2Game, WW2_CONSUMABLES_DEFAULT } from '@/lib/ww2';
import type { Bo4Difficulty } from '@prisma/client';

// Log an EE completion (new run each time). Main-quest XP once per user per EE.
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
    const {
      easterEggId,
      mapId,
      roundCompleted,
      playerCount,
      isSolo,
      isNoGuide,
      proofUrl,
      proofUrls: bodyProofUrls,
      screenshotUrl,
      notes,
    } = body;
    const rawProofUrls = Array.isArray(bodyProofUrls)
      ? bodyProofUrls
      : proofUrl != null
        ? [proofUrl]
        : [];
    for (const u of rawProofUrls) {
      const err = validateProofUrl(String(u));
      if (err) return NextResponse.json({ error: `Proof URL: ${err}` }, { status: 400 });
    }
    const proofUrls = normalizeProofUrls(rawProofUrls.map(String));
    const completionTimeSeconds = body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds))
      ? Math.max(0, Math.floor(Number(body.completionTimeSeconds)))
      : null;
    const teammateUserIds = Array.isArray(body.teammateUserIds) ? body.teammateUserIds.filter((id: unknown) => typeof id === 'string').slice(0, 10) : [];
    const teammateNonUserNames = Array.isArray(body.teammateNonUserNames) ? body.teammateNonUserNames.filter((n: unknown) => typeof n === 'string').slice(0, 10) : [];
    const requestVerification = Boolean(body.requestVerification);

    if (!easterEggId || !mapId || !playerCount) {
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

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { game: { select: { shortName: true } } },
    });
    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const rampageInducerUsed =
      (isBocwGame(map.game?.shortName) || isBo6Game(map.game?.shortName) || isBo7Game(map.game?.shortName)) &&
      body.rampageInducerUsed !== undefined
        ? Boolean(body.rampageInducerUsed)
        : undefined;
    const isWw2 = isWw2Game(map.game?.shortName);
    const ww2ConsumablesUsed = isWw2
      ? (body.ww2ConsumablesUsed !== undefined ? Boolean(body.ww2ConsumablesUsed) : WW2_CONSUMABLES_DEFAULT === 'WITH_CONSUMABLES')
      : undefined;

    let difficulty: Bo4Difficulty | undefined;
    if (isBo4Game(map.game?.shortName)) {
      const d = body.difficulty;
      if (!d || !BO4_DIFFICULTIES.includes(d as any)) {
        return NextResponse.json(
          { error: 'BO4 maps require difficulty: CASUAL, NORMAL, HARDCORE, or REALISTIC' },
          { status: 400 }
        );
      }
      difficulty = d as Bo4Difficulty;
    }

    const log = await prisma.easterEggLog.create({
      data: {
        userId: user.id,
        easterEggId,
        mapId,
        roundCompleted,
        playerCount,
        isSolo,
        isNoGuide,
        proofUrls,
        screenshotUrl,
        notes,
        completionTimeSeconds,
        teammateUserIds,
        teammateNonUserNames,
        ...(difficulty != null && { difficulty }),
        ...(rampageInducerUsed != null && { rampageInducerUsed }),
        ...(ww2ConsumablesUsed != null && { ww2ConsumablesUsed }),
        ...(requestVerification && { verificationRequestedAt: new Date() }),
      },
    });

    if (teammateUserIds.length > 0) {
      await createCoOpRunPendingsForEasterEggLog(log.id, user.id, teammateUserIds);
    }

    // Main quest = one-time XP; we track so we don’t double-award
    const newlyUnlocked = await processMapAchievements(user.id, mapId);
    const xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
    const totalXp =
      xpGained > 0
        ? (await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true } }))?.totalXp ?? undefined
        : undefined;

    // Bump level if they crossed a threshold
    if (xpGained > 0) {
      const { getLevelFromXp } = await import('@/lib/ranks');
      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true, level: true } });
      if (updated) {
        const { level } = getLevelFromXp(updated.totalXp);
        if (level !== updated.level) {
          await prisma.user.update({ where: { id: user.id }, data: { level } });
        }
      }
    }

    return NextResponse.json({
      ...log,
      xpGained,
      newlyUnlockedAchievements: newlyUnlocked.length,
      ...(totalXp != null && { totalXp }),
    });
  } catch (error) {
    console.error('Error creating Easter Egg log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// List EE logs. ?userId / ?mapId to filter.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const mapId = searchParams.get('mapId');

  try {
    const logs = await prisma.easterEggLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(mapId && { mapId }),
      },
      include: {
        easterEgg: true,
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
        completedAt: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching Easter Egg logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
