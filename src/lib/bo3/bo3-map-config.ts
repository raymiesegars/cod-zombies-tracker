/**
 * BO3 map configuration: challenge types, WRs, First Room variants, AAT toggle.
 * Used for leaderboard filters, achievement seed, and map-specific rules.
 */

import type { ChallengeType } from '@prisma/client';

export type Bo3MapSlug =
  | 'shadows-of-evil'
  | 'the-giant'
  | 'der-eisendrache'
  | 'zetsubou-no-shima'
  | 'gorod-krovi'
  | 'revelations'
  | 'bo3-nacht-der-untoten'
  | 'bo3-verruckt'
  | 'bo3-shi-no-numa'
  | 'bo3-kino-der-toten'
  | 'bo3-ascension'
  | 'bo3-shangri-la'
  | 'bo3-moon'
  | 'bo3-origins';

export type Bo3MapConfig = {
  challengeTypes: ChallengeType[];
  /** Whether this map has No Power (Nacht has no power) */
  hasNoPower: boolean;
  /** First room variants: single STARTING_ROOM or JUG/QUICK for Verruckt */
  firstRoomVariants: 'SINGLE' | 'JUG_QUICK';
  /** WRs in seconds for speedruns */
  speedrunWRs: {
    r30: number;
    r50: number;
    r70: number;
    r100?: number;
    r255?: number;
  } | null;
  eeSpeedrunWR?: number; // seconds
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR: number;
  firstRoomJugWR?: number;
  firstRoomQuickWR?: number;
  noPowerWR?: number;
  noPerksWR: number;
  noJugWR: number;
  /** No Man's Land (Moon only): WR kills */
  noMansLandWR?: number;
};

// Convert times to seconds: Xmin -> X*60, X:YY -> X*60+YY, Xh -> X*3600
function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export const BO3_MAP_CONFIG: Record<Bo3MapSlug, Bo3MapConfig> = {
  'shadows-of-evil': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(27) + 55,
      r50: min(54),
      r70: hms(1, 25, 0),
      r100: hms(2, 50, 40),
      r255: h(45),
    },
    eeSpeedrunWR: min(19) + 39, // solo
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 43,
    noPowerWR: 195,
    noPerksWR: 199,
    noJugWR: 255,
  },
  'the-giant': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(27) + 55,
      r50: min(52),
      r70: hms(1, 35, 40),
      r100: hms(3, 42, 40),
      r255: h(55),
    },
    eeSpeedrunWR: min(65), // 1:05
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 54,
    noPowerWR: 84,
    noPerksWR: 124,
    noJugWR: 207,
  },
  'der-eisendrache': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(29),
      r50: min(56),
      r70: hms(1, 34, 40),
      r100: hms(3, 20, 0),
      r255: h(47),
    },
    eeSpeedrunWR: min(26),
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 56,
    noPowerWR: 65,
    noPerksWR: 163,
    noJugWR: 205,
  },
  'zetsubou-no-shima': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(28),
      r50: hms(1, 2, 40),
      r70: hms(1, 46, 40),
      r100: hms(3, 50, 40),
      r255: h(51),
    },
    eeSpeedrunWR: min(20) + 6,
    highRoundWR: 255,
    noDownsWR: 215,
    firstRoomWR: 51,
    noPowerWR: 55,
    noPerksWR: 127,
    noJugWR: 246,
  },
  'gorod-krovi': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(31),
      r50: hms(1, 6, 40),
      r70: hms(2, 35, 40),
      r100: h(5),
      r255: h(70),
    },
    eeSpeedrunWR: min(31),
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 57,
    noPowerWR: 162,
    noPerksWR: 113,
    noJugWR: 133,
  },
  revelations: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(30),
      r50: min(56),
      r70: hms(1, 30, 40),
      r100: hms(2, 47, 40),
      r255: h(32),
    },
    eeSpeedrunWR: min(23) + 4,
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 46,
    noPowerWR: 180,
    noPerksWR: 216,
    noJugWR: 255,
  },
  'bo3-nacht-der-untoten': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
    ],
    hasNoPower: false, // no power on Nacht
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(38),
      r50: hms(1, 35, 40),
      r70: hms(3, 50, 40),
      r100: h(13),
      r255: h(300),
    },
    highRoundWR: 255,
    noDownsWR: 220,
    firstRoomWR: 47,
    noPerksWR: 106,
    noJugWR: 128,
  },
  'bo3-verruckt': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'STARTING_ROOM_JUG_SIDE',
      'STARTING_ROOM_QUICK_SIDE',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'JUG_QUICK',
    speedrunWRs: {
      r30: min(29),
      r50: hms(1, 35, 40),
      r70: hms(1, 40, 40),
      r100: hms(5, 40, 40),
      r255: h(110),
    },
    highRoundWR: 255,
    noDownsWR: 178,
    firstRoomWR: 36, // quick side higher
    firstRoomJugWR: 29,
    firstRoomQuickWR: 36,
    noPowerWR: 90,
    noPerksWR: 72,
    noJugWR: 134,
  },
  'bo3-shi-no-numa': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
    ],
    hasNoPower: false, // Shi No Numa has no power
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(30),
      r50: h(1),
      r70: hms(1, 57, 40),
      r100: hms(5, 45, 40),
    },
    highRoundWR: 202,
    noDownsWR: 128,
    firstRoomWR: 46,
    noPerksWR: 87,
    noJugWR: 134,
  },
  'bo3-kino-der-toten': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(28),
      r50: min(53),
      r70: hms(1, 30, 40),
      r100: hms(3, 20, 40),
      r255: h(66),
    },
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 58,
    noPowerWR: 98,
    noPerksWR: 125,
    noJugWR: 211,
  },
  'bo3-ascension': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(28),
      r50: min(52),
      r70: hms(1, 24, 40),
      r100: hms(2, 43, 20),
      r255: h(50),
    },
    eeSpeedrunWR: min(6) + 40,
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 62,
    noPowerWR: 142,
    noPerksWR: 175,
    noJugWR: 255,
  },
  'bo3-shangri-la': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(31),
      r50: hms(1, 4, 40),
      r70: hms(1, 51, 40),
      r100: hms(4, 9, 40),
    },
    eeSpeedrunWR: min(8),
    highRoundWR: 248,
    noDownsWR: 243,
    firstRoomWR: 59,
    noPowerWR: 93,
    noPerksWR: 80,
    noJugWR: 214,
  },
  'bo3-moon': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'NO_MANS_LAND',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(27),
      r50: min(47),
      r70: hms(1, 15, 40),
      r100: hms(2, 33, 40),
      r255: h(38),
    },
    eeSpeedrunWR: min(19) + 20,
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 107,
    noPowerWR: 255,
    noPerksWR: 179,
    noJugWR: 255,
    noMansLandWR: 472,
  },
  'bo3-origins': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'NO_JUG',
      'NO_ATS',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_255_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    hasNoPower: true,
    firstRoomVariants: 'SINGLE',
    speedrunWRs: {
      r30: min(31),
      r50: hms(1, 2, 40),
      r70: hms(1, 40, 40),
      r100: hms(3, 15, 40),
      r255: h(87),
    },
    eeSpeedrunWR: min(32),
    highRoundWR: 255,
    noDownsWR: 255,
    firstRoomWR: 64,
    noPowerWR: 130,
    noPerksWR: 129,
    noJugWR: 175,
  },
};

/** WR-based round milestones (same pattern as BO2). Used for achievement tiers. */
const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50,
  20: 90,
  30: 150,
  50: 320,
  70: 580,
  100: 1000,
};

function buildWrBasedRounds(wr: number, tierCount = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries = (BASE_REQUIRED_ROUNDS as readonly number[])
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

export function getBo3RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}

export const BO3_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STARTING_ROOM: 'First Room',
  STARTING_ROOM_JUG_SIDE: 'First Room (Jug Side)',
  STARTING_ROOM_QUICK_SIDE: 'First Room (Quick Side)',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  NO_POWER: 'No Power',
  NO_JUG: 'No Jug',
  NO_ATS: 'No AATs',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
  NO_MANS_LAND: "No Man's Land",
};

export function getBo3ChallengeTypeLabel(type: string): string {
  return BO3_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getBo3MapConfig(slug: string): Bo3MapConfig | null {
  return (BO3_MAP_CONFIG as Record<string, Bo3MapConfig | undefined>)[slug] ?? null;
}

export function isBo3Map(slug: string): slug is Bo3MapSlug {
  return slug in BO3_MAP_CONFIG;
}
