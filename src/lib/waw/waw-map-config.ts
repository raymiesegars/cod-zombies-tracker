/**
 * World at War map configuration: which challenges exist per map, achievement rounds, speedrun times.
 * Used by migration script and seed for WaW balance patch.
 *
 * Rules:
 * - All WaW maps: No Solo No Downs (no quick revive)
 * - Nacht: Remove No Perks, No Pack-a-Punch, No Power (map doesn't have them)
 * - Verruckt: Remove No Pack-a-Punch; First Room = Jug Side + Quick Side (replace generic STARTING_ROOM)
 * - Shi No Numa: Remove No Pack-a-Punch, No Power
 * - Der Riese: Has Fixed Wunderwaffe tag (no achievements for that tag)
 */

import type { ChallengeType } from '@prisma/client';

export type WaWMapSlug = 'nacht-der-untoten' | 'verruckt' | 'shi-no-numa' | 'der-riese';

export type WaWChallengeConfig = {
  /** Challenge types available on this map. Omit = not available. */
  challengeTypes: ChallengeType[];
  /** No Downs: solo not available (no quick revive). Co-op only for achievements. */
  noDownsSoloAllowed: boolean;
  /** No Downs: Verruckt removes entirely (duo+ only, no duo+ achievements) */
  noDownsAvailable: boolean;
  /** Has Fixed Wunderwaffe tag (Der Riese only) */
  hasFixedWunderwaffeTag: boolean;
  /** World record for highest round (used for achievement scaling) */
  highRoundWR: number;
  /** Speedrun world records in seconds: R30, R50, R70, R100. null = not applicable */
  speedrunWRs: { r30: number; r50: number; r70: number; r100: number } | null;
  /** EE speedrun WR in seconds (Der Riese only) */
  eeSpeedrunWR?: number;
  /** Challenge-specific WRs for achievement tiers */
  firstRoomWR?: number;
  firstRoomJugWR?: number;
  firstRoomQuickWR?: number;
  noPowerWR?: number; // null = can't be done
  noPerksWR?: number;
  noJugWR?: number; // Tag only, no achievements
};

/** Base rounds that every map must have (with appropriate XP) */
const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50,
  20: 90,
  30: 150,
  50: 320,
  70: 580,
  100: 1000,
};

/** XP formula: base rounds 10/20/30/50/70/100 always included; WR-based tiers for higher rounds. */
function buildWrBasedRounds(wr: number, tierCount: number = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries: { round: number; xp: number }[] = BASE_REQUIRED_ROUNDS
    .filter((r) => r <= wr)
    .map((r) => ({ round: r, xp: BASE_XP_BY_ROUND[r] ?? 50 }));

  const minRound = Math.min(20, Math.floor(wr * 0.02));
  const rounds: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    const ratio = (i + 1) / (tierCount + 1);
    const round = Math.round(minRound + (wr - minRound) * Math.pow(ratio, 1.2));
    rounds.push(Math.min(round, wr));
  }
  const wrBased = Array.from(new Set(rounds)).sort((a, b) => a - b);
  const baseXp = 50;
  const maxXp = 2500;
  const wrEntries = wrBased
    .filter((r) => r > 100)
    .map((round) => {
      const ratio = round / wr;
      const xp = Math.round(baseXp + (maxXp - baseXp) * Math.pow(ratio, 2));
      return { round, xp: Math.min(xp, maxXp) };
    });

  const combined = [...baseEntries, ...wrEntries];
  combined.sort((a, b) => a.round - b.round);
  return combined;
}

export const WAW_MAP_CONFIG: Record<WaWMapSlug, WaWChallengeConfig> = {
  'nacht-der-untoten': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY'],
    noDownsSoloAllowed: false,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 8817,
    speedrunWRs: { r30: 28 * 60 + 38, r50: 46 * 60 + 12, r70: 70 * 60 + 11, r100: 110 * 60 + 3 },
    firstRoomWR: 361,
    noPowerWR: undefined, // Can't be done
    noPerksWR: undefined, // Not on map
  },
  verruckt: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_PERKS', 'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER'],
    noDownsSoloAllowed: false,
    noDownsAvailable: false, // Duo+ only, no duo+ achievements — remove category
    hasFixedWunderwaffeTag: false,
    highRoundWR: 5679,
    speedrunWRs: { r30: 26 * 60 + 34, r50: 43 * 60 + 6, r70: 61 * 60 + 44, r100: 87 * 60 + 55 },
    firstRoomJugWR: 40,
    firstRoomQuickWR: 37,
    noPowerWR: 139,
    noPerksWR: 419,
    noJugWR: 419,
  },
  'shi-no-numa': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY'],
    noDownsSoloAllowed: false,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 11843,
    speedrunWRs: { r30: 23 * 60 + 38, r50: 34 * 60 + 52, r70: 44 * 60 + 59, r100: 59 * 60 + 27 },
    firstRoomWR: 168,
    noPowerWR: undefined,
    noPerksWR: 5749,
    noJugWR: 5749,
  },
  'der-riese': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER'],
    noDownsSoloAllowed: false,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: true, // WR 87, no achievements
    highRoundWR: 194,
    speedrunWRs: { r30: 27 * 60 + 57, r50: 59 * 60 + 41, r70: 138 * 60 + 1, r100: 465 * 60 },
    eeSpeedrunWR: 6 * 60 + 50,
    firstRoomWR: 46,
    noPowerWR: 46,
    noPerksWR: 91,
    noJugWR: 91,
  },
};

export function getWaWMapConfig(slug: string): WaWChallengeConfig | null {
  return (WAW_MAP_CONFIG as Record<string, WaWChallengeConfig | undefined>)[slug] ?? null;
}

export function isWaWMap(slug: string): slug is WaWMapSlug {
  return slug in WAW_MAP_CONFIG;
}

/** Display name for challenge type in achievements/UI */
export const WAW_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STARTING_ROOM: 'First Room',
  STARTING_ROOM_JUG_SIDE: 'First Room (Jug Side)',
  STARTING_ROOM_QUICK_SIDE: 'First Room (Quick Side)',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  NO_POWER: 'No Power',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
};

export function getWaWChallengeTypeLabel(type: string): string {
  return WAW_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

/** Build achievement round tiers from WR. Non-linear: final tier gives significantly more XP. */
export function getWaWRoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

