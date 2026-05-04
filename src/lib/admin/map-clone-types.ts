import type {
  AchievementRarity,
  AchievementType,
  Bo4Difficulty,
  ChallengeType,
  EasterEggType,
  PlayerCountRequirement,
} from '@prisma/client';

export type MapCloneMapDraft = {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isDlc: boolean;
  isCustom: boolean;
  steamWorkshopUrl: string | null;
  releaseDate: string | null;
  roundCap: number | null;
  order: number;
};

export type MapCloneChallengeDraft = {
  sourceSlug: string;
  name: string;
  slug: string;
  description: string | null;
  type: ChallengeType;
  roundTarget: number | null;
  xpReward: number;
  isActive: boolean;
};

export type MapCloneEasterEggStepDraft = {
  order: number;
  label: string;
  imageUrl: string | null;
  buildableReferenceSlug: string | null;
};

export type MapCloneEasterEggDraft = {
  sourceSlug: string;
  name: string;
  slug: string;
  description: string | null;
  type: EasterEggType;
  optimalRound: number | null;
  xpReward: number;
  playerCountRequirement: PlayerCountRequirement | null;
  rewardsDescription: string | null;
  videoEmbedUrl: string | null;
  variantTag: string | null;
  categoryTag: string | null;
  isActive: boolean;
  steps: MapCloneEasterEggStepDraft[];
};

export type MapCloneAchievementDraft = {
  sourceSlug: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  type: AchievementType;
  criteria: Record<string, unknown>;
  xpReward: number;
  rarity: AchievementRarity;
  isActive: boolean;
  difficulty: Bo4Difficulty | null;
  mapScoped: boolean;
  challengeSourceSlug: string | null;
  easterEggSourceSlug: string | null;
};

export type MapClonePreview = {
  game: { id: string; shortName: string; name: string };
  sourceMap: { id: string; name: string; slug: string; order: number };
  map: MapCloneMapDraft;
  expectedChallengeTypes: ChallengeType[];
  challenges: MapCloneChallengeDraft[];
  easterEggs: MapCloneEasterEggDraft[];
  achievements: MapCloneAchievementDraft[];
};

export type MapCloneCreatePayload = {
  gameId: string;
  sourceMapId: string;
  map: MapCloneMapDraft;
  expectedChallengeTypes: string[];
  challenges: MapCloneChallengeDraft[];
  easterEggs: MapCloneEasterEggDraft[];
  achievements: MapCloneAchievementDraft[];
};
