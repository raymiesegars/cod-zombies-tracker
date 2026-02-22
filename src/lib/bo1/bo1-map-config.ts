/**
 * Black Ops 1 map configuration: which challenges exist per map, achievement rounds, speedrun times.
 * Used by migration script and seed for BO1 balance patch.
 *
 * Notes:
 * - Call of the Dead: Two EE speedruns (Stand-in Solo 4:27, Ensemble Cast 2+ 6:10) - separate leaderboards & XP
 * - BO1 Nacht: No Downs co-op only (no solo), no No Power, No Perks, No Jug
 * - BO1 Verruckt: First Room = Jug Side + Quick Side (both 39)
 * - BO1 Shi No Numa: No No Power
 * - BO1 Der Riese: Fly Trap is main EE with XP
 */

import type { ChallengeType } from '@prisma/client';

export type Bo1MapSlug =
  | 'kino-der-toten'
  | 'five'
  | 'ascension'
  | 'call-of-the-dead'
  | 'shangri-la'
  | 'moon'
  | 'bo1-nacht-der-untoten'
  | 'bo1-verruckt'
  | 'bo1-shi-no-numa'
  | 'bo1-der-riese';

export type Bo1ChallengeConfig = {
  challengeTypes: ChallengeType[];
  noDownsSoloAllowed: boolean;
  noDownsAvailable: boolean;
  hasFixedWunderwaffeTag: boolean;
  highRoundWR: number;
  speedrunWRs: { r30: number; r50: number; r70: number; r100: number; r200?: number } | null;
  eeSpeedrunWR?: number;
  /** Call of the Dead: Stand-in (Solo) WR in seconds */
  eeSpeedrunSoloWR?: number;
  /** Call of the Dead: Ensemble Cast (2+) WR in seconds */
  eeSpeedrunCoopWR?: number;
  firstRoomWR?: number;
  firstRoomJugWR?: number;
  firstRoomQuickWR?: number;
  noPowerWR?: number;
  noPerksWR?: number;
  noJugWR?: number;
};

/** Base rounds for WR-based achievement tiers */
const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50,
  20: 90,
  30: 150,
  50: 320,
  70: 580,
  100: 1000,
};

/** XP formula: base rounds + WR-based tiers. Same logic as WaW. */
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

export function getBo1RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

export const BO1_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STARTING_ROOM: 'First Room',
  STARTING_ROOM_JUG_SIDE: 'First Room (Jug Side)',
  STARTING_ROOM_QUICK_SIDE: 'First Room (Quick Side)',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  NO_POWER: 'No Power',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
};

export function getBo1ChallengeTypeLabel(type: string): string {
  return BO1_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export const BO1_MAP_CONFIG: Record<Bo1MapSlug, Bo1ChallengeConfig> = {
  'kino-der-toten': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 240,
    speedrunWRs: { r30: 28 * 60 + 52, r50: 65 * 60 + 57, r70: 143 * 60 + 8, r100: 6 * 3600 + 33 * 60 + 16, r200: 45 * 3600 + 51 * 60 + 31 },
    firstRoomWR: 60,
    noPowerWR: 76,
    noPerksWR: 160,
    noJugWR: 160,
  },
  five: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 241,
    speedrunWRs: { r30: 28 * 60 + 52, r50: 66 * 60 + 49, r70: 149 * 60 + 12, r100: 6 * 3600 + 19 * 60 + 48, r200: 46 * 3600 + 38 * 60 + 46 },
    firstRoomWR: 47,
    noPowerWR: 58,
    noPerksWR: 78,
    noJugWR: 127,
  },
  ascension: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 244,
    speedrunWRs: { r30: 28 * 60 + 22, r50: 60 * 60 + 43, r70: 121 * 60 + 15, r100: 5 * 3600 + 46 * 60 + 22, r200: 43 * 3600 + 21 * 60 + 52 },
    eeSpeedrunWR: 13 * 60 + 37,
    firstRoomWR: 62,
    noPowerWR: 151,
    noPerksWR: 171,
    noJugWR: 222,
  },
  'call-of-the-dead': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 105,
    speedrunWRs: { r30: 33 * 60 + 48, r50: 81 * 60 + 57, r70: 6 * 3600 + 13 * 60 + 40, r100: 24 * 3600 + 55 * 60 + 40 },
    eeSpeedrunSoloWR: 4 * 60 + 27,
    eeSpeedrunCoopWR: 6 * 60 + 10,
    firstRoomWR: 72,
    noPowerWR: 86,
    noPerksWR: 80,
    noJugWR: 90,
  },
  'shangri-la': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 208,
    speedrunWRs: { r30: 32 * 60 + 42, r50: 70 * 60 + 40, r70: 150 * 60 + 40, r100: 6 * 3600 + 48 * 60 + 40, r200: 50 * 3600 },
    eeSpeedrunWR: 9 * 60 + 38,
    firstRoomWR: 47,
    noPowerWR: 178,
    noPerksWR: 75,
    noJugWR: 111,
  },
  moon: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 252,
    speedrunWRs: { r30: 30 * 60 + 25, r50: 65 * 60 + 55, r70: 132 * 60, r100: 5 * 3600 + 26 * 60, r200: 39 * 3600 + 54 * 60 },
    eeSpeedrunWR: 8 * 60 + 59,
    firstRoomWR: 44,
    noPowerWR: 165,
    noPerksWR: 82,
    noJugWR: 200,
  },
  'bo1-nacht-der-untoten': {
    challengeTypes: ['HIGHEST_ROUND', 'STARTING_ROOM', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN'],
    noDownsSoloAllowed: false,
    noDownsAvailable: false,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 150,
    speedrunWRs: { r30: 40 * 60 + 54, r50: 136 * 60, r70: 486 * 60, r100: 20 * 3600 },
    firstRoomWR: 44,
  },
  'bo1-verruckt': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 227,
    speedrunWRs: { r30: 30 * 60 + 30, r50: 77 * 60 + 40, r70: 208 * 60 + 40, r100: 590 * 60 + 40, r200: 75 * 3600 },
    firstRoomJugWR: 39,
    firstRoomQuickWR: 39,
    noPowerWR: 54,
    noPerksWR: 121,
    noJugWR: 121,
  },
  'bo1-shi-no-numa': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 235,
    speedrunWRs: { r30: 31 * 60 + 18, r50: 75 * 60 + 30, r70: 180 * 60, r100: 480 * 60, r200: 64 * 3600 },
    firstRoomWR: 43,
    noPerksWR: 125,
    noJugWR: 125,
  },
  'bo1-der-riese': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    noDownsSoloAllowed: true,
    noDownsAvailable: true,
    hasFixedWunderwaffeTag: false,
    highRoundWR: 250,
    speedrunWRs: { r30: 28 * 60, r50: 58 * 60, r70: 120 * 60, r100: 5 * 3600 + 28 * 60 + 40, r200: 42 * 3600 },
    eeSpeedrunWR: 3 * 60 + 6,
    firstRoomWR: 52,
    noPowerWR: 68,
    noPerksWR: 92,
    noJugWR: 100,
  },
};

export function getBo1MapConfig(slug: string): Bo1ChallengeConfig | null {
  return (BO1_MAP_CONFIG as Record<string, Bo1ChallengeConfig | undefined>)[slug] ?? null;
}

export function isBo1Map(slug: string): slug is Bo1MapSlug {
  return slug in BO1_MAP_CONFIG;
}
