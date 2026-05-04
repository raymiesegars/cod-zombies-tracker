import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import type { ChallengeType, Prisma } from '@prisma/client';
import type {
  MapCloneCreatePayload,
  MapClonePreview,
} from '@/lib/admin/map-clone-types';

type JsonObject = Record<string, unknown>;

export function sanitizeSlug(input: string, fallbackFromName?: string): string {
  const fromInput = slugify(input ?? '');
  if (fromInput) return fromInput;
  return slugify(fallbackFromName ?? '');
}

function toJsonObject(value: Prisma.JsonValue | null | undefined): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

export async function buildMapClonePreview(input: {
  gameId: string;
  mapName: string;
  mapSlug?: string;
}): Promise<MapClonePreview> {
  const gameId = input.gameId.trim();
  const mapName = input.mapName.trim();
  if (!gameId || !mapName) throw new Error('gameId and mapName are required');

  const sourceMap = await prisma.map.findFirst({
    where: { gameId },
    orderBy: [{ order: 'desc' }, { name: 'desc' }],
    include: {
      game: { select: { id: true, shortName: true, name: true } },
      challenges: { orderBy: [{ type: 'asc' }, { slug: 'asc' }] },
      easterEggs: {
        include: { steps: { orderBy: { order: 'asc' } } },
        orderBy: [{ type: 'asc' }, { slug: 'asc' }],
      },
    },
  });

  if (!sourceMap) throw new Error('No source map found for this game');

  const achievements = await prisma.achievement.findMany({
    where: {
      OR: [{ mapId: sourceMap.id }, { easterEgg: { mapId: sourceMap.id } }],
    },
    include: {
      challenge: { select: { slug: true } },
      easterEgg: { select: { slug: true } },
    },
    orderBy: [{ type: 'asc' }, { slug: 'asc' }, { id: 'asc' }],
  });

  const sanitizedSlug = sanitizeSlug(input.mapSlug ?? '', mapName);
  if (!sanitizedSlug) throw new Error('Invalid map slug');

  return {
    game: sourceMap.game,
    sourceMap: {
      id: sourceMap.id,
      name: sourceMap.name,
      slug: sourceMap.slug,
      order: sourceMap.order,
    },
    map: {
      name: mapName,
      slug: sanitizedSlug,
      description: sourceMap.description ?? null,
      imageUrl: sourceMap.imageUrl ?? null,
      isDlc: sourceMap.isDlc,
      isCustom: sourceMap.isCustom,
      steamWorkshopUrl: sourceMap.steamWorkshopUrl ?? null,
      releaseDate: sourceMap.releaseDate?.toISOString() ?? null,
      roundCap: sourceMap.roundCap ?? null,
      order: sourceMap.order + 1,
    },
    expectedChallengeTypes: sourceMap.challenges.map((challenge) => challenge.type),
    challenges: sourceMap.challenges.map((challenge) => ({
      sourceSlug: challenge.slug,
      name: challenge.name,
      slug: challenge.slug,
      description: challenge.description ?? null,
      type: challenge.type,
      roundTarget: challenge.roundTarget ?? null,
      xpReward: challenge.xpReward,
      isActive: challenge.isActive,
    })),
    easterEggs: sourceMap.easterEggs.map((egg) => ({
      sourceSlug: egg.slug,
      name: egg.name,
      slug: egg.slug,
      description: egg.description ?? null,
      type: egg.type,
      optimalRound: egg.optimalRound ?? null,
      xpReward: egg.xpReward,
      playerCountRequirement: egg.playerCountRequirement ?? null,
      rewardsDescription: egg.rewardsDescription ?? null,
      videoEmbedUrl: egg.videoEmbedUrl ?? null,
      variantTag: egg.variantTag ?? null,
      categoryTag: egg.categoryTag ?? null,
      isActive: egg.isActive,
      steps: egg.steps.map((step) => ({
        order: step.order,
        label: step.label,
        imageUrl: step.imageUrl ?? null,
        buildableReferenceSlug: step.buildableReferenceSlug ?? null,
      })),
    })),
    achievements: achievements.map((achievement) => ({
      sourceSlug: achievement.slug,
      name: achievement.name,
      slug: achievement.slug,
      description: achievement.description ?? null,
      iconUrl: achievement.iconUrl ?? null,
      type: achievement.type,
      criteria: toJsonObject(achievement.criteria),
      xpReward: achievement.xpReward,
      rarity: achievement.rarity,
      isActive: achievement.isActive,
      difficulty: achievement.difficulty ?? null,
      mapScoped: Boolean(achievement.mapId),
      challengeSourceSlug: achievement.challenge?.slug ?? null,
      easterEggSourceSlug: achievement.easterEgg?.slug ?? null,
    })),
  };
}

export function validateMapCloneCreatePayload(payload: MapCloneCreatePayload): string | null {
  if (!payload.gameId?.trim()) return 'gameId is required';
  if (!payload.sourceMapId?.trim()) return 'sourceMapId is required';
  if (!payload.map?.name?.trim()) return 'map.name is required';
  if (!payload.map?.slug?.trim()) return 'map.slug is required';
  if (!Array.isArray(payload.challenges) || payload.challenges.length === 0) return 'At least one challenge is required';
  if (!Array.isArray(payload.achievements) || payload.achievements.length === 0) return 'At least one achievement is required';

  const requiresEasterEggChallenge = payload.easterEggs.length > 0;
  const expectedTypes = payload.expectedChallengeTypes.filter(
    (type) => requiresEasterEggChallenge || type !== 'EASTER_EGG_SPEEDRUN'
  );

  const missingTypes = expectedTypes.filter(
    (type) => !payload.challenges.some((challenge) => challenge.type === type)
  );
  if (missingTypes.length > 0) return `Missing required challenge types: ${missingTypes.join(', ')}`;

  const challengeSlugs = new Set<string>();
  for (const challenge of payload.challenges) {
    if (!challenge.name?.trim()) return 'Every challenge must have a name';
    if (!challenge.slug?.trim()) return 'Every challenge must have a slug';
    if (challengeSlugs.has(challenge.slug)) return `Duplicate challenge slug: ${challenge.slug}`;
    challengeSlugs.add(challenge.slug);
  }

  const easterEggSlugs = new Set<string>();
  for (const egg of payload.easterEggs) {
    if (!egg.name?.trim()) return 'Every easter egg must have a name';
    if (!egg.slug?.trim()) return 'Every easter egg must have a slug';
    if (easterEggSlugs.has(egg.slug)) return `Duplicate easter egg slug: ${egg.slug}`;
    easterEggSlugs.add(egg.slug);
    if (!Array.isArray(egg.steps)) return `Invalid steps for easter egg ${egg.slug}`;
    for (const step of egg.steps) {
      if (!step.label?.trim()) return `Every easter egg step needs a label (${egg.slug})`;
    }
  }

  for (const achievement of payload.achievements) {
    if (!achievement.name?.trim()) return 'Every achievement must have a name';
    if (!achievement.slug?.trim()) return 'Every achievement must have a slug';
    if (!achievement.criteria || typeof achievement.criteria !== 'object' || Array.isArray(achievement.criteria)) {
      return `Achievement criteria must be an object (${achievement.slug})`;
    }
  }

  return null;
}
