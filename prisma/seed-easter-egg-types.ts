/**
 * Shared types for Easter Egg seed data (base + in-progress).
 * Used by seed-easter-eggs-base.ts, seed-easter-eggs-in-progress.ts, and seed-easter-eggs.ts.
 */

export type EasterEggType = 'MAIN_QUEST' | 'SIDE_QUEST' | 'MUSICAL' | 'BUILDABLE';

export type PlayerCountRequirement = 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD';

export interface SpecificEasterEgg {
  gameShortName: string;
  mapSlug: string;
  name: string;
  slug: string;
  type: EasterEggType;
  description?: string;
  /** XP awarded when user completes all steps (main quest only). Side/musical use 0. */
  xpReward?: number;
  /** If set, show "Solo only", "2+ players", etc. on the EE card. */
  playerCountRequirement?: PlayerCountRequirement;
  /** Optional rewards section shown at end of EE card. */
  rewardsDescription?: string;
  /** Optional YouTube embed URL for main quest guide. */
  videoEmbedUrl?: string;
  /** BO2 main quest variant tag (e.g. "Dr. Maxis", "Richtofen"). */
  variantTag?: string;
  /** Optional category tag for filtering (e.g. "Cipher"). */
  categoryTag?: string;
  steps: { order: number; label: string; imageUrl?: string; buildableReferenceSlug?: string }[];
}
