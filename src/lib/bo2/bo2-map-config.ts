/**
 * Black Ops 2 map configuration: challenges, WRs, bank/storage, EE variants.
 * Used by balance patch and leaderboard filters.
 *
 * Bank: Tranzit, Die Rise, Buried have bank. Buried also has weapon storage.
 * EE variants: Tranzit, Die Rise, Buried have Richtofen vs Maxis EE speedruns.
 * NO_MAGIC: Bus Depot, Town, Farm, Nuketown only (BO2 Custom Game: Magic disabled).
 */

import type { ChallengeType } from '@prisma/client';

export type Bo2MapSlug =
  | 'tranzit'
  | 'bus-depot'
  | 'farm'
  | 'town'
  | 'nuketown-zombies'
  | 'die-rise'
  | 'mob-of-the-dead'
  | 'buried'
  | 'origins';

export type Bo2BankMode = 'BANK_OR_STORAGE' | 'NO_BANK_NO_STORAGE';

export type Bo2ChallengeConfig = {
  challengeTypes: ChallengeType[];
  hasBank: boolean;
  /** Buried: bank includes weapon storage; label differs */
  bankIncludesStorage: boolean;
  noDownsSoloAllowed: boolean;
  noDownsAvailable: boolean;
  /** No Power: map has no power (Bus Depot, Town, Farm, Nuketown) */
  hasNoPower: boolean;
  highRoundWR: number;
  speedrunWRs: {
    r30: number;
    r50: number;
    r70: number;
    r100?: number;
    r200?: number;
  } | null;
  /** Bus Depot: no achievements for speedruns past R70 */
  speedrunAchievementCap?: number; // round
  eeSpeedrunWR?: number;
  eeSpeedrunRichtofenWR?: number; // seconds
  eeSpeedrunMaxisWR?: number; // seconds
  firstRoomWR?: number;
  firstRoomProcessingWR?: number; // Buried Processing
  firstRoomQuickWR?: number; // Buried Quick side
  noPowerWR?: number;
  noPerksWR?: number;
  noJugWR?: number;
  noMagicWR?: number;
};

/** Base rounds for WR-based achievement tiers (same as WaW/BO1) */
const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50,
  20: 90,
  30: 150,
  50: 320,
  70: 580,
  100: 1000,
};

function buildWrBasedRounds(wr: number, tierCount: number = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries = BASE_REQUIRED_ROUNDS
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

export function getBo2RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

export const BO2_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STARTING_ROOM: 'First Room',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  NO_POWER: 'No Power',
  NO_MAGIC: 'No Magic',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
};

export function getBo2ChallengeTypeLabel(type: string): string {
  return BO2_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export const BO2_MAP_CONFIG: Record<Bo2MapSlug, Bo2ChallengeConfig> = {
  tranzit: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasBank: true,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: false,
    highRoundWR: 205,
    speedrunWRs: {
      r30: 31 * 60 + 7,
      r50: 1 * 3600 + 7 * 60 + 40,
      r70: 2 * 3600 + 22 * 60 + 40,
      r100: 6 * 3600 + 30 * 60 + 40,
      r200: 80 * 3600,
    },
    eeSpeedrunRichtofenWR: 10 * 60 + 56,
    eeSpeedrunMaxisWR: 6 * 60 + 6,
    firstRoomWR: 46,
    noPowerWR: 77,
    noPerksWR: 116,
    noJugWR: 145,
  },
  'bus-depot': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_MAGIC',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: false,
    noDownsAvailable: false,
    hasNoPower: true,
    highRoundWR: 91,
    speedrunWRs: {
      r30: 35 * 60 + 6,
      r50: 1 * 3600 + 35 * 60 + 40,
      r70: 11 * 3600,
    },
    speedrunAchievementCap: 70,
    firstRoomWR: 53,
    noMagicWR: 48,
  },
  town: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_MAGIC',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: true,
    highRoundWR: 100,
    speedrunWRs: {
      r30: 29 * 60 + 14,
      r50: 1 * 3600 + 7 * 60 + 40,
      r70: 3 * 3600 + 50 * 60 + 40,
      r100: 135 * 3600,
    },
    firstRoomWR: 80,
    noPerksWR: 80,
    noJugWR: 99,
    noMagicWR: 54,
  },
  farm: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_MAGIC',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: true,
    highRoundWR: 96,
    speedrunWRs: {
      r30: 31 * 60,
      r50: 1 * 3600 + 20 * 60,
      r70: 28 * 3600,
    },
    firstRoomWR: 66,
    noPerksWR: 62,
    noJugWR: 73,
    noMagicWR: 48,
  },
  'nuketown-zombies': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_MAGIC',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: true,
    highRoundWR: 97,
    speedrunWRs: {
      r30: 35 * 60,
      r50: 1 * 3600 + 37 * 60,
      r70: 50 * 3600,
    },
    firstRoomWR: 60,
    noPerksWR: 60,
    noJugWR: 69,
    noMagicWR: 40,
  },
  'die-rise': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasBank: true,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: false,
    highRoundWR: 219,
    speedrunWRs: {
      r30: 25 * 60 + 55,
      r50: 50 * 60,
      r70: 1 * 3600 + 20 * 60,
      r100: 2 * 3600 + 32 * 60,
      r200: 84 * 3600,
    },
    eeSpeedrunRichtofenWR: 4 * 60 + 40,
    eeSpeedrunMaxisWR: 6 * 60 + 8,
    firstRoomWR: 67,
    noPowerWR: 219,
    noPerksWR: 108,
    noJugWR: 107,
  },
  'mob-of-the-dead': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: false,
    highRoundWR: 240,
    speedrunWRs: {
      r30: 30 * 60,
      r50: 1 * 3600 + 10 * 60 + 40,
      r70: 2 * 3600 + 40 * 60,
      r100: 7 * 3600,
      r200: 60 * 3600,
    },
    eeSpeedrunWR: 19 * 60,
    firstRoomWR: 40,
    noPowerWR: 193,
    noPerksWR: 193,
    noJugWR: 201,
  },
  buried: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasBank: true,
    bankIncludesStorage: true,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: false,
    highRoundWR: 255,
    speedrunWRs: {
      r30: 28 * 60 + 49,
      r50: 1 * 3600 + 4 * 60,
      r70: 2 * 3600 + 20 * 60 + 40,
      r100: 5 * 3600 + 50 * 60 + 40,
      r200: 43 * 3600,
    },
    eeSpeedrunRichtofenWR: 8 * 60 + 20,
    eeSpeedrunMaxisWR: 12 * 60 + 30,
    firstRoomWR: 39,
    firstRoomProcessingWR: 39,
    firstRoomQuickWR: 39,
    noPowerWR: 255,
    noPerksWR: 177,
    noJugWR: 160,
  },
  origins: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_JUG',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasBank: false,
    bankIncludesStorage: false,
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasNoPower: false,
    highRoundWR: 177,
    speedrunWRs: {
      r30: 30 * 60 + 38,
      r50: 58 * 60 + 31,
      r70: 1 * 3600 + 32 * 60 + 8,
      r100: 3 * 3600 + 10 * 60 + 40,
    },
    eeSpeedrunWR: 36 * 60,
    firstRoomWR: 56,
    noPowerWR: 114,
    noPerksWR: 99,
    noJugWR: 136,
  },
};

export function getBo2MapConfig(slug: string): Bo2ChallengeConfig | null {
  return (BO2_MAP_CONFIG as Record<string, Bo2ChallengeConfig | undefined>)[slug] ?? null;
}

export function isBo2Map(slug: string): slug is Bo2MapSlug {
  return slug in BO2_MAP_CONFIG;
}
