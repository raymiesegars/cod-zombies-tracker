/**
 * WW2 Zombies map configuration: challenge types, WRs.
 * Consumables filter applies to all challenges (With vs No Consumables).
 */

import type { ChallengeType } from '@prisma/client';

function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export type Ww2MapSlug =
  | 'prologue'
  | 'the-final-reich'
  | 'groesten-haus'
  | 'the-darkest-shore'
  | 'the-shadowed-throne'
  | 'bodega-cervantes'
  | 'uss-mount-olympus'
  | 'altar-of-blood'
  | 'the-frozen-dawn';

export type Ww2MapConfig = {
  challengeTypes: ChallengeType[];
  hasNoPower: boolean;
  hasFirstRoom: boolean;
  speedrunWRs: {
    r10?: number;
    r30: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
  } | null;
  super30WR?: number; // Only The Final Reich (multi-map run)
  eeSpeedrunWR?: number;
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR?: number;
  noPowerWR?: number;
  noArmorWR: number;
  noBlitzWR: number;
};

export const WW2_MAP_CONFIG: Record<Ww2MapSlug, Ww2MapConfig> = {
  'prologue': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'ROUND_30_SPEEDRUN', 'STARTING_ROOM', 'NO_ARMOR', 'NO_BLITZ',
    ],
    hasNoPower: false,
    hasFirstRoom: true,
    speedrunWRs: { r30: min(40) + 1 },
    highRoundWR: 53,
    noDownsWR: 45,
    firstRoomWR: 42,
    noArmorWR: 33,
    noBlitzWR: 54,
  },
  'the-final-reich': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_POWER', 'NO_ARMOR', 'NO_BLITZ', 'STARTING_ROOM',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_10_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'SUPER_30_SPEEDRUN', 'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r10: min(7) + 48,
      r30: min(28) + 27,
      r50: min(54) + 51,
      r70: hms(1, 45, 40),
      r100: hms(3, 50, 40),
      r200: hms(22, 30, 20),
    },
    super30WR: hms(2, 30, 30),
    eeSpeedrunWR: min(23),
    highRoundWR: 255,
    noDownsWR: 237,
    firstRoomWR: 34,
    noPowerWR: 188,
    noArmorWR: 127,
    noBlitzWR: 93,
  },
  'groesten-haus': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_ARMOR', 'NO_BLITZ', 'STARTING_ROOM',
      'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
    ],
    hasNoPower: false,
    hasFirstRoom: true,
    speedrunWRs: {
      r30: min(23) + 33,
      r50: min(53) + 15,
      r70: hms(2, 43, 40),
    },
    highRoundWR: 154,
    noDownsWR: 152,
    firstRoomWR: 83,
    noArmorWR: 64,
    noBlitzWR: 54,
  },
  'the-darkest-shore': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_POWER', 'NO_ARMOR', 'NO_BLITZ', 'STARTING_ROOM',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_10_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r10: min(8) + 6,
      r30: min(23) + 20,
      r50: min(50),
      r70: hms(1, 41, 40),
      r100: h(4),
      r200: hms(17, 30, 40),
    },
    eeSpeedrunWR: min(30),
    highRoundWR: 433,
    noDownsWR: 251,
    firstRoomWR: 53,
    noPowerWR: 101,
    noArmorWR: 66,
    noBlitzWR: 61,
  },
  'the-shadowed-throne': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_POWER', 'NO_ARMOR', 'NO_BLITZ', 'STARTING_ROOM',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_10_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    hasFirstRoom: true,
    speedrunWRs: {
      r10: min(8),
      r30: min(30),
      r50: h(1),
      r70: h(2),
      r100: hms(4, 20, 30),
      r200: hms(18, 30, 40),
    },
    eeSpeedrunWR: min(30),
    highRoundWR: 341,
    noDownsWR: 256,
    firstRoomWR: 72,
    noPowerWR: 161,
    noArmorWR: 137,
    noBlitzWR: 79,
  },
  'bodega-cervantes': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_ARMOR', 'NO_BLITZ',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
    ],
    hasNoPower: false,
    hasFirstRoom: false,
    speedrunWRs: {
      r30: min(26) + 30,
      r50: min(50),
      r70: hms(1, 21, 30),
      r100: hms(3, 22, 20),
      r200: h(15),
    },
    highRoundWR: 320,
    noDownsWR: 320,
    noArmorWR: 112,
    noBlitzWR: 112,
  },
  'uss-mount-olympus': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_ARMOR', 'NO_BLITZ',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
    ],
    hasNoPower: false,
    hasFirstRoom: false,
    speedrunWRs: {
      r30: min(28),
      r50: min(58),
      r70: hms(1, 56, 40),
      r100: hms(4, 56, 40),
      r200: h(26),
    },
    highRoundWR: 444,
    noDownsWR: 444,
    noArmorWR: 151,
    noBlitzWR: 151,
  },
  'altar-of-blood': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_ARMOR', 'NO_BLITZ',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
    ],
    hasNoPower: false,
    hasFirstRoom: false,
    speedrunWRs: {
      r30: min(28),
      r50: min(56) + 30,
      r70: hms(1, 56, 40),
      r100: h(5),
      r200: hms(21, 30, 40),
    },
    highRoundWR: 451,
    noDownsWR: 81,
    noArmorWR: 90,
    noBlitzWR: 70,
  },
  'the-frozen-dawn': {
    challengeTypes: [
      'HIGHEST_ROUND', 'NO_DOWNS', 'NO_ARMOR', 'NO_BLITZ', 'STARTING_ROOM',
      'ROUND_5_SPEEDRUN', 'ROUND_15_SPEEDRUN', 'ROUND_10_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: false,
    hasFirstRoom: true,
    speedrunWRs: {
      r10: min(1) + 25,
      r30: min(24),
      r50: min(56),
      r70: hms(1, 46, 40),
      r100: hms(4, 8, 40),
      r200: h(23),
    },
    eeSpeedrunWR: min(20),
    highRoundWR: 440,
    noDownsWR: 426,
    firstRoomWR: 76,
    noArmorWR: 244,
    noBlitzWR: 244,
  },
};

const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50, 20: 90, 30: 150, 50: 320, 70: 580, 100: 1000,
};

function buildWrBasedRounds(wr: number, tierCount = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries = (BASE_REQUIRED_ROUNDS as readonly number[]).filter((r) => r <= wr).map((r) => ({ round: r, xp: BASE_XP_BY_ROUND[r] ?? 50 }));
  const minRound = Math.min(20, Math.floor(wr * 0.02));
  const rounds: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    const ratio = (i + 1) / (tierCount + 1);
    rounds.push(Math.min(Math.round(minRound + (wr - minRound) * Math.pow(ratio, 1.2)), wr));
  }
  const wrBased = Array.from(new Set(rounds)).sort((a, b) => a - b);
  const wrEntries = wrBased.filter((r) => r > 100).map((round) => {
    const ratio = round / wr;
    const xp = Math.round(50 + 2450 * Math.pow(ratio, 2));
    return { round, xp: Math.min(xp, 2500) };
  });
  const combined = [...baseEntries, ...wrEntries].sort((a, b) => a.round - b.round);
  return combined;
}

export function getWw2RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

export function getWw2MapConfig(slug: string): Ww2MapConfig | null {
  return (WW2_MAP_CONFIG as Record<string, Ww2MapConfig>)[slug] ?? null;
}

export function getWw2ChallengeTypeLabel(type: string): string {
  switch (type) {
    case 'HIGHEST_ROUND': return 'Highest Round';
    case 'NO_DOWNS': return 'No Downs';
    case 'NO_POWER': return 'No Power';
    case 'NO_ARMOR': return 'No Armor';
    case 'NO_BLITZ': return 'No Blitz';
    case 'STARTING_ROOM': return 'Starting Room Only';
    case 'ROUND_10_SPEEDRUN': return 'Round 10 Speedrun';
    case 'ROUND_30_SPEEDRUN': return 'Round 30 Speedrun';
    case 'ROUND_50_SPEEDRUN': return 'Round 50 Speedrun';
    case 'ROUND_70_SPEEDRUN': return 'Round 70 Speedrun';
    case 'ROUND_100_SPEEDRUN': return 'Round 100 Speedrun';
    case 'ROUND_200_SPEEDRUN': return 'Round 200 Speedrun';
    case 'SUPER_30_SPEEDRUN': return 'Super 30 Speedrun';
    case 'EASTER_EGG_SPEEDRUN': return 'Easter Egg Speedrun';
    default: return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
