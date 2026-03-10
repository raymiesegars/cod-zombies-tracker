import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { reapplyMapAchievements } from '@/lib/achievements/reapply';
import { BO3_CUSTOM_CHALLENGE_TYPES, BO3_CUSTOM_DEFAULT_ROUNDS, buildBo3CustomSpeedrunTiers } from '@/lib/bo3-custom';
import { getBo3RoundMilestones } from '@/lib/bo3/bo3-map-config';
import { slugify } from '@/lib/utils';
import type { ChallengeType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const CHALLENGE_NAMES: Record<string, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  NO_ATS: 'No AATs',
  ROUND_5_SPEEDRUN: 'Round 5 Speedrun',
  ROUND_15_SPEEDRUN: 'Round 15 Speedrun',
  ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
  ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
  ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
  ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
  ROUND_255_SPEEDRUN: 'Round 255 Speedrun',
  EASTER_EGG_SPEEDRUN: 'Easter Egg Speedrun',
};

async function requireAdmin() {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const, user: null };
  const me = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true, isAdmin: true },
  });
  if (!me || !me.isAdmin) return { error: 'Forbidden' as const, status: 403 as const, user: null };
  return { user: me, error: null, status: null };
}

/** POST: Approve a map submission. Creates Map, Challenges, Achievements, optional EasterEgg. Body may include { suggestedAchievements?, suggestedEasterEgg? } to override submission data. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let bodyOverrides: { suggestedAchievements?: Record<string, number>; suggestedEasterEgg?: { name?: string; steps?: string[]; xpReward?: number } } = {};
  try {
    const raw = await request.text();
    if (raw) bodyOverrides = JSON.parse(raw) as typeof bodyOverrides;
  } catch {
    // ignore parse errors, use submission data
  }

  const { id } = await params;
  const submission = await prisma.mapSubmission.findUnique({
    where: { id },
    include: { game: { select: { id: true, shortName: true } } },
  });

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  if (submission.status !== 'PENDING') {
    return NextResponse.json({ error: `Submission already ${submission.status}` }, { status: 400 });
  }
  if (submission.game.shortName !== 'BO3_CUSTOM') {
    return NextResponse.json({ error: 'Only BO3 Custom Zombies submissions supported' }, { status: 400 });
  }

  const suggested =
    bodyOverrides.suggestedAchievements != null
      ? bodyOverrides.suggestedAchievements
      : ((submission.suggestedAchievements as Record<string, number>) ?? {});
  let baseSlug = slugify(submission.mapName);
  if (!baseSlug) baseSlug = `custom-map-${submission.id.slice(0, 8)}`;

  const existingWithSlug = await prisma.map.findFirst({
    where: { gameId: submission.gameId, slug: baseSlug },
  });
  const mapSlug = existingWithSlug ? `${baseSlug}-${submission.id.slice(0, 6)}` : baseSlug;

  const maxOrder = await prisma.map.aggregate({
    where: { gameId: submission.gameId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const map = await prisma.map.create({
    data: {
      gameId: submission.gameId,
      name: submission.mapName,
      slug: mapSlug,
      isCustom: true,
      isDlc: true,
      steamWorkshopUrl: submission.steamWorkshopUrl,
      imageUrl: submission.thumbnailImageUrl ?? submission.mapPageImageUrl,
      order,
    },
  });

  const typesToCreate = BO3_CUSTOM_CHALLENGE_TYPES.filter(
    (t) =>
      t !== 'BUYABLE_ENDING_SPEEDRUN' || (suggested[t] != null && suggested[t]! > 0)
  );
  const challengeIds: string[] = [];
  for (const cType of typesToCreate) {
    const round = suggested[cType] ?? BO3_CUSTOM_DEFAULT_ROUNDS[cType] ?? (cType.includes('SPEEDRUN') ? 1800 : 30);
    const slug = (cType as string).toLowerCase().replace(/_/g, '-');
    const name = CHALLENGE_NAMES[cType] ?? (cType as string).replace(/_/g, ' ');
    const challenge = await prisma.challenge.create({
      data: {
        mapId: map.id,
        name,
        slug,
        type: cType as ChallengeType,
        roundTarget: cType.includes('SPEEDRUN') ? null : round,
        xpReward: 100,
        isActive: true,
      },
    });
    challengeIds.push(challenge.id);
  }

  const challengeById = await prisma.challenge.findMany({
    where: { mapId: map.id },
    select: { id: true, type: true },
  });
  const challengeByType = new Map(challengeById.map((c) => [c.type, c.id]));

  const CHALLENGE_MULTIPLIERS: Record<string, number> = {
    NO_DOWNS: 1,
    NO_PERKS: 2,
    NO_PACK: 2,
    STARTING_ROOM: 3,
    NO_POWER: 3,
    NO_ATS: 3,
    PISTOL_ONLY: 3,
  };

  for (const cType of typesToCreate) {
    const capRound = suggested[cType] ?? BO3_CUSTOM_DEFAULT_ROUNDS[cType] ?? (cType.includes('SPEEDRUN') ? 1800 : 30);
    const challengeId = challengeByType.get(cType) ?? null;

    if (cType === 'HIGHEST_ROUND') {
      const milestones = getBo3RoundMilestones(Math.max(50, capRound), 8);
      for (const { round, xp } of milestones) {
        if (round > capRound) continue;
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            name: `Round ${round}`,
            slug: `round-${round}`,
            type: 'ROUND_MILESTONE',
            criteria: { round, challengeType: 'HIGHEST_ROUND' },
            xpReward: Math.max(50, xp),
            rarity: 'COMMON',
            isActive: true,
          },
        });
      }
      continue;
    }

    if (cType.includes('SPEEDRUN')) {
      const wrSeconds = Math.max(60, capRound);
      const tiers = buildBo3CustomSpeedrunTiers(wrSeconds, cType);
      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i]!;
        const mins = Math.floor(tier.maxTimeSeconds / 60);
        const secs = tier.maxTimeSeconds % 60;
        const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            challengeId: challengeId!,
            name: `${CHALLENGE_NAMES[cType] ?? cType} (≤${timeStr})`,
            slug: `${(cType as string).toLowerCase().replace(/_/g, '-')}-${tier.maxTimeSeconds}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { challengeType: cType, maxTimeSeconds: tier.maxTimeSeconds },
            xpReward: tier.xpReward,
            rarity: 'COMMON',
            isActive: true,
          },
        });
      }
      continue;
    }

    if (cType === 'ONE_BOX') {
      const targetRound = Math.min(capRound, 30);
      if (challengeId) {
        await prisma.achievement.create({
          data: {
            mapId: map.id,
            challengeId,
            name: `${CHALLENGE_NAMES[cType] ?? cType} Round ${targetRound}`,
            slug: `${(cType as string).toLowerCase().replace(/_/g, '-')}-${targetRound}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { challengeType: cType, round: targetRound },
            xpReward: 600,
            rarity: 'COMMON',
            isActive: true,
          },
        });
      }
      continue;
    }

    const multiplier = CHALLENGE_MULTIPLIERS[cType] ?? 1;
    const milestones = getBo3RoundMilestones(Math.max(20, capRound), 8);
    for (const { round, xp } of milestones) {
      if (round > capRound || !challengeId) continue;
      const scaledXp = Math.max(50, Math.floor(xp * multiplier));
      await prisma.achievement.create({
        data: {
          mapId: map.id,
          challengeId,
          name: `${CHALLENGE_NAMES[cType] ?? cType} Round ${round}`,
          slug: `${(cType as string).toLowerCase().replace(/_/g, '-')}-${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { challengeType: cType, round },
          xpReward: scaledXp,
          rarity: 'COMMON',
          isActive: true,
        },
      });
    }
  }

  let easterEggId: string | null = null;
  const hasEeOverride = bodyOverrides.suggestedEasterEgg !== undefined;
  const eeFromOverride =
    bodyOverrides.suggestedEasterEgg &&
    typeof (bodyOverrides.suggestedEasterEgg as { name?: string })?.name === 'string' &&
    (bodyOverrides.suggestedEasterEgg as { name: string }).name.trim();
  const ee = hasEeOverride
    ? eeFromOverride
      ? (bodyOverrides.suggestedEasterEgg as { name: string; steps?: string[]; xpReward?: number })
      : null
    : (submission.suggestedEasterEgg as { name?: string; steps?: string[]; xpReward?: number } | null);
  if (ee?.name && typeof ee.name === 'string') {
    const eeSlug = slugify(ee.name) || 'main-quest';
    const eeXp = typeof ee.xpReward === 'number' ? Math.max(0, Math.floor(ee.xpReward)) : 250;
    const createdEe = await prisma.easterEgg.create({
      data: {
        mapId: map.id,
        name: ee.name.trim(),
        slug: eeSlug,
        type: 'MAIN_QUEST',
        xpReward: eeXp,
      },
    });
    easterEggId = createdEe.id;

    const steps = Array.isArray(ee.steps) ? ee.steps : [];
    for (let i = 0; i < steps.length; i++) {
      const label = typeof steps[i] === 'string' ? steps[i] : `Step ${i + 1}`;
      await prisma.easterEggStep.create({
        data: {
          easterEggId: createdEe.id,
          order: i + 1,
          label: label.trim() || `Step ${i + 1}`,
        },
      });
    }

    await prisma.achievement.create({
      data: {
        mapId: map.id,
        easterEggId: createdEe.id,
        name: `Complete ${ee.name.trim()}`,
        slug: `ee-${eeSlug}`,
        type: 'EASTER_EGG_COMPLETE',
        criteria: {},
        xpReward: eeXp,
        rarity: 'UNCOMMON',
        isActive: true,
      },
    });
  }

  await prisma.mapSubmission.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedById: auth.user!.id,
      reviewedAt: new Date(),
      approvedMapId: map.id,
      rejectionReason: null,
    },
  });

  try {
    await reapplyMapAchievements(map.id);
  } catch {
    // Non-fatal
  }

  revalidatePath('/maps');
  revalidatePath(`/maps/${map.slug}`);

  return NextResponse.json({
    map: { id: map.id, slug: map.slug, name: map.name },
    challengesCreated: challengeIds.length,
    easterEggId,
  });
}
