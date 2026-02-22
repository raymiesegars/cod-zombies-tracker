import {
  BASE_ROUNDS,
  BASE_XP,
  EASTER_EGG_BASE_XP,
  getMilestonesForChallengeType,
  getCapXp,
} from './milestones';

const MIN_ACHIEVEMENT_XP = 50;
import {
  getRoundConfigForMap,
  getXpForRoundFromMilestones,
} from './map-round-config';
import { getWaWMapConfig, getWaWRoundMilestones, getWaWChallengeTypeLabel } from '@/lib/waw/waw-map-config';
import { getBo1MapConfig, getBo1RoundMilestones, getBo1ChallengeTypeLabel } from '@/lib/bo1/bo1-map-config';
import { isBo4Game, BO4_DIFFICULTIES, BO4_DIFFICULTY_XP_MULTIPLIER, type Bo4DifficultyType } from '../bo4';
import { IW_ZIS_SPEEDRUN_TIERS, IW_RAVE_SPEEDRUN_TIERS, IW_SHAOLIN_SPEEDRUN_TIERS, IW_AOTRT_SPEEDRUN_TIERS, IW_BEAST_SPEEDRUN_TIERS, WAW_SPEEDRUN_TIERS_BY_MAP, BO1_SPEEDRUN_TIERS_BY_MAP, BO1_COTD_STAND_IN_EE_TIERS, BO1_COTD_ENSEMBLE_CAST_EE_TIERS, formatSpeedrunTime, type SpeedrunTiersByType } from './speedrun-tiers';

const CHALLENGE_TYPES = [
  'HIGHEST_ROUND',
  'NO_DOWNS',
  'NO_PERKS',
  'NO_PACK',
  'STARTING_ROOM',
  'ONE_BOX',
  'PISTOL_ONLY',
  'NO_POWER',
] as const;

/** IW Zombies in Spaceland: custom rounds per challenge (WR-based). */
const IW_ZIS_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 40, 50, 70, 100], // WR 100
  STARTING_ROOM: [10, 15, 20, 30, 40, 50, 54], // WR 54
  ONE_BOX: [30], // WR 30
  PISTOL_ONLY: [5, 10, 15, 20, 25, 30, 40, 50, 60], // WR 60
  NO_POWER: [10, 15, 20, 30, 50, 75, 100, 125, 150], // WR 150
};

/** IW Rave in the Redwoods: custom rounds per challenge (WR-based). */
const IW_RAVE_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 70, 100, 150, 190], // WR 190
  NO_PACK: [10, 20, 30, 40, 50], // WR 50
  STARTING_ROOM: [10, 15, 20, 25, 30, 37], // WR 37
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 60, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 75, 100, 125, 170], // WR 170
};

/** IW Shaolin Shuffle: custom rounds per challenge (WR-based). */
const IW_SHAOLIN_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 83], // WR 83
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  STARTING_ROOM: [10, 15, 20, 30, 40, 51], // WR 51
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 71], // WR 71
};

/** IW Attack of the Radioactive Thing: custom rounds per challenge (WR-based). */
const IW_AOTRT_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 70, 90], // WR 90
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  STARTING_ROOM: [10, 15, 20, 24], // WR 24
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 75, 100, 125, 170], // WR 170
};

/** IW The Beast From Beyond: no Starting Room on this map. */
const IW_BEAST_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 52], // WR 52
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 40], // WR 40
};

export type AchievementSeedRow = {
  slug: string;
  name: string;
  type: 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE';
  criteria: {
    round?: number;
    challengeType?: string;
    isCap?: boolean;
    difficulty?: Bo4DifficultyType;
    /** Speedrun tier: qualify if completionTimeSeconds <= this */
    maxTimeSeconds?: number;
  };
  xpReward: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  challengeId?: string;
  easterEggId?: string;
  /** For EE speedrun achievements: resolve slug to easterEggId when creating (e.g. Call of the Dead Stand-in vs Ensemble Cast) */
  easterEggSlug?: string;
  /** BO4 only: which difficulty this achievement is for */
  difficulty?: Bo4DifficultyType;
};

function rarityForRound(round: number, maxRound: number): AchievementSeedRow['rarity'] {
  if (maxRound <= 0) return 'COMMON';
  const ratio = round / maxRound;
  if (ratio >= 0.9) return 'LEGENDARY';
  if (ratio >= 0.6) return 'EPIC';
  if (ratio >= 0.35) return 'RARE';
  if (ratio >= 0.15) return 'UNCOMMON';
  return 'COMMON';
}

/** For BO4 maps: expand one row into four (one per difficulty) with scaled XP and criteria. */
function expandBo4Difficulties(row: AchievementSeedRow): AchievementSeedRow[] {
  return BO4_DIFFICULTIES.map((d) => ({
    ...row,
    name: `${row.name} (${d.charAt(0) + d.slice(1).toLowerCase()})`,
    xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(row.xpReward * BO4_DIFFICULTY_XP_MULTIPLIER[d])),
    criteria: { ...row.criteria, difficulty: d },
    difficulty: d,
  }));
}

export function getMapAchievementDefinitions(
  mapSlug: string,
  roundCap: number | null | undefined,
  gameShortName?: string
): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];

  // WAW: per-map config with WR-based achievements, speedruns, and challenge availability
  if (gameShortName === 'WAW') {
    const wawCfg = getWaWMapConfig(mapSlug);
    if (wawCfg) {
      const milestones = getWaWRoundMilestones(wawCfg.highRoundWR);
      const maxRound = wawCfg.highRoundWR;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      if (wawCfg.noDownsAvailable) {
        for (const { round, xp } of milestones) {
          rows.push({
            slug: `no-downs-${round}`,
            name: `No Downs Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_DOWNS' },
            xpReward: xp,
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
      for (const cType of wawCfg.challengeTypes) {
        if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
        const wr = (cType as string) === 'STARTING_ROOM' ? wawCfg.firstRoomWR
          : (cType as string) === 'STARTING_ROOM_JUG_SIDE' ? wawCfg.firstRoomJugWR
          : (cType as string) === 'STARTING_ROOM_QUICK_SIDE' ? wawCfg.firstRoomQuickWR
          : (cType as string) === 'NO_POWER' ? wawCfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? wawCfg.noPerksWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getWaWRoundMilestones(wr);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getWaWChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (wawCfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (wawCfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getWaWRoundMilestones(Math.min(pistolWR, 100), 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolWR),
          });
        }
      }
      return rows;
    }
  }

  // BO1: per-map config with WR-based achievements
  if (gameShortName === 'BO1') {
    const bo1Cfg = getBo1MapConfig(mapSlug);
    if (bo1Cfg) {
      const milestones = getBo1RoundMilestones(bo1Cfg.highRoundWR);
      const maxRound = bo1Cfg.highRoundWR;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      if (bo1Cfg.noDownsAvailable) {
        for (const { round, xp } of milestones) {
          rows.push({
            slug: `no-downs-${round}`,
            name: `No Downs Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_DOWNS' },
            xpReward: xp,
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
      for (const cType of bo1Cfg.challengeTypes) {
        if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
        const wr = (cType as string) === 'STARTING_ROOM' ? bo1Cfg.firstRoomWR
          : (cType as string) === 'STARTING_ROOM_JUG_SIDE' ? bo1Cfg.firstRoomJugWR
          : (cType as string) === 'STARTING_ROOM_QUICK_SIDE' ? bo1Cfg.firstRoomQuickWR
          : (cType as string) === 'NO_POWER' ? bo1Cfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? bo1Cfg.noPerksWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo1RoundMilestones(wr);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo1ChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (bo1Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo1Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getBo1RoundMilestones(Math.min(pistolWR, 100), 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolWR),
          });
        }
      }
      return rows;
    }
  }

  const mapConfig = gameShortName ? getRoundConfigForMap(mapSlug, gameShortName) : null;
  const maxRound =
    mapConfig?.roundCap ??
    (mapConfig?.roundMilestones.length
      ? Math.max(...mapConfig.roundMilestones.map((m) => m.round))
      : null) ??
    roundCap ??
    (BASE_ROUNDS as readonly number[])[BASE_ROUNDS.length - 1]!;

  if (mapConfig) {
    // HR custom milestones
    for (let i = 0; i < mapConfig.roundMilestones.length; i++) {
      const { round, xp } = mapConfig.roundMilestones[i]!;
      const isCap = mapConfig.roundCap != null && round === mapConfig.roundCap;
      rows.push({
        slug: isCap ? 'round-cap' : `round-${round}`,
        name: isCap ? `Round ${round} (Cap)` : `Round ${round}`,
        type: 'ROUND_MILESTONE',
        criteria: { round, challengeType: 'HIGHEST_ROUND', ...(isCap ? { isCap: true } : {}) },
        xpReward: xp,
        rarity: isCap ? 'LEGENDARY' : rarityForRound(round, maxRound),
      });
    }
    // No Downs – same tiers
    for (let i = 0; i < mapConfig.roundMilestones.length; i++) {
      const { round, xp } = mapConfig.roundMilestones[i]!;
      const isCap = mapConfig.roundCap != null && round === mapConfig.roundCap;
      rows.push({
        slug: isCap ? 'no-downs-cap' : `no-downs-${round}`,
        name: isCap ? `No Downs Round ${round} (Cap)` : `No Downs Round ${round}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { round, challengeType: 'NO_DOWNS', ...(isCap ? { isCap: true } : {}) },
        xpReward: xp,
        rarity: isCap ? 'LEGENDARY' : rarityForRound(round, maxRound),
      });
    }
    // Other types: rounds <= maxRound, XP from map milestones × multiplier
    const isIwZis = mapSlug === 'zombies-in-spaceland' && gameShortName === 'IW';
    const isIwRave = mapSlug === 'rave-in-the-redwoods' && gameShortName === 'IW';
    const isIwShaolin = mapSlug === 'shaolin-shuffle' && gameShortName === 'IW';
    const isIwAotrt = mapSlug === 'attack-of-the-radioactive-thing' && gameShortName === 'IW';
    const isIwBeast = mapSlug === 'the-beast-from-beyond' && gameShortName === 'IW';
    const iwOverrideRounds = isIwZis ? IW_ZIS_CHALLENGE_ROUNDS : isIwRave ? IW_RAVE_CHALLENGE_ROUNDS : isIwShaolin ? IW_SHAOLIN_CHALLENGE_ROUNDS : isIwAotrt ? IW_AOTRT_CHALLENGE_ROUNDS : isIwBeast ? IW_BEAST_CHALLENGE_ROUNDS : undefined;
    for (const cType of CHALLENGE_TYPES) {
      if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
      if (cType === 'STARTING_ROOM' && isIwBeast) continue; // Beast From Beyond has no starting room challenge
      const defaultConfig = getMilestonesForChallengeType(cType as any);
      if (!defaultConfig) continue;
      const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
      const overrideRounds = iwOverrideRounds?.[cType];
      const effectiveRounds = overrideRounds ?? (defaultConfig.rounds as number[]);
      const effectiveMax = overrideRounds ? Math.max(...overrideRounds) : maxRound;
      const rounds =
        defaultConfig.flatXp != null
          ? (effectiveRounds[0]! <= effectiveMax ? [effectiveRounds[0]!] : [])
          : effectiveRounds.filter((r) => r <= effectiveMax);
      for (const round of rounds) {
        let xp: number;
        if (defaultConfig.flatXp != null) {
          xp = defaultConfig.flatXp;
        } else {
          const tierXp = getXpForRoundFromMilestones(round, mapConfig.roundMilestones);
          xp = Math.floor(tierXp * defaultConfig.multiplier);
        }
        rows.push({
          slug: `${slugPrefix}-${round}`,
          name: `${cType.replace(/_/g, ' ')} Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: cType },
          xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
          rarity: rarityForRound(round, maxRound),
        });
      }
    }
    if (isBo4Game(gameShortName)) {
      return rows.flatMap((r) => expandBo4Difficulties(r));
    }
    return rows;
  }

  // BASE_ROUNDS + optional cap
  for (let i = 0; i < BASE_ROUNDS.length; i++) {
    const round = BASE_ROUNDS[i]!;
    const xp = BASE_XP[i]!;
    rows.push({
      slug: `round-${round}`,
      name: `Round ${round}`,
      type: 'ROUND_MILESTONE',
      criteria: { round, challengeType: 'HIGHEST_ROUND' },
      xpReward: xp,
      rarity: round >= 70 ? 'EPIC' : round >= 40 ? 'RARE' : round >= 20 ? 'UNCOMMON' : 'COMMON',
    });
  }
  if (roundCap != null) {
    rows.push({
      slug: 'round-cap',
      name: `Round ${roundCap} (Cap)`,
      type: 'ROUND_MILESTONE',
      criteria: { round: roundCap, challengeType: 'HIGHEST_ROUND', isCap: true },
      xpReward: getCapXp(),
      rarity: 'LEGENDARY',
    });
  }

  for (let i = 0; i < BASE_ROUNDS.length; i++) {
    const round = BASE_ROUNDS[i]!;
    const xp = BASE_XP[i]!;
    rows.push({
      slug: `no-downs-${round}`,
      name: `No Downs Round ${round}`,
      type: 'CHALLENGE_COMPLETE',
      criteria: { round, challengeType: 'NO_DOWNS' },
      xpReward: xp,
      rarity: round >= 70 ? 'EPIC' : round >= 40 ? 'RARE' : 'UNCOMMON',
    });
  }
  if (roundCap != null) {
    rows.push({
      slug: 'no-downs-cap',
      name: `No Downs Round ${roundCap} (Cap)`,
      type: 'CHALLENGE_COMPLETE',
      criteria: { round: roundCap, challengeType: 'NO_DOWNS', isCap: true },
      xpReward: getCapXp(),
      rarity: 'LEGENDARY',
    });
  }

  const effectiveMax = roundCap ?? 100;
  for (const cType of CHALLENGE_TYPES) {
    if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
    const config = getMilestonesForChallengeType(cType as any);
    if (!config) continue;
    const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
    const rounds = (config.rounds as number[]).filter((r) => r <= effectiveMax);
    for (const round of rounds) {
      let xp: number;
      if (config.flatXp != null) {
        xp = config.flatXp;
      } else {
        const baseXp = BASE_XP[BASE_ROUNDS.indexOf(round as any)] ?? MIN_ACHIEVEMENT_XP;
        xp = Math.floor(baseXp * config.multiplier);
      }
      rows.push({
        slug: `${slugPrefix}-${round}`,
        name: `${cType.replace(/_/g, ' ')} Round ${round}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { round, challengeType: cType },
        xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
        rarity: round >= 40 ? 'EPIC' : round >= 20 ? 'RARE' : 'UNCOMMON',
      });
    }
  }

  if (isBo4Game(gameShortName)) {
    return rows.flatMap((r) => expandBo4Difficulties(r));
  }
  return rows;
}

const SPEEDRUN_TYPE_LABELS: Record<string, string> = {
  ROUND_30_SPEEDRUN: 'Round 30',
  ROUND_50_SPEEDRUN: 'Round 50',
  ROUND_70_SPEEDRUN: 'Round 70',
  ROUND_100_SPEEDRUN: 'Round 100',
  ROUND_200_SPEEDRUN: 'Round 200',
  EASTER_EGG_SPEEDRUN: 'Easter Egg',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
  CRYPTID_FIGHT: 'Cryptid Fight',
  MEPHISTOPHELES: 'Mephistopheles',
};

const IW_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'zombies-in-spaceland': IW_ZIS_SPEEDRUN_TIERS,
  'rave-in-the-redwoods': IW_RAVE_SPEEDRUN_TIERS,
  'shaolin-shuffle': IW_SHAOLIN_SPEEDRUN_TIERS,
  'attack-of-the-radioactive-thing': IW_AOTRT_SPEEDRUN_TIERS,
  'the-beast-from-beyond': IW_BEAST_SPEEDRUN_TIERS,
};

/** Speedrun tier achievements for IW, WAW, and BO1 maps. Fastest = most XP. */
export function getSpeedrunAchievementDefinitions(
  mapSlug: string,
  gameShortName: string
): AchievementSeedRow[] {
  const tiersByType = gameShortName === 'IW' ? IW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'WAW' ? WAW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO1' ? BO1_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : undefined;
  if (!tiersByType) return [];
  const rows: AchievementSeedRow[] = [];
  for (const [challengeType, tiers] of Object.entries(tiersByType)) {
    const label = SPEEDRUN_TYPE_LABELS[challengeType] ?? challengeType.replace(/_/g, ' ');
    for (let i = 0; i < tiers.length; i++) {
      const { maxTimeSeconds, xpReward } = tiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `${challengeType.toLowerCase().replace(/_/g, '-')}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === tiers.length - 1 ? 'LEGENDARY' : i >= tiers.length - 2 ? 'EPIC' : i >= tiers.length - 3 ? 'RARE' : 'UNCOMMON';
      rows.push({
        slug,
        name: `${label} in under ${formatSpeedrunTime(maxTimeSeconds)}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { challengeType, maxTimeSeconds },
        xpReward,
        rarity,
      });
    }
  }
  return rows;
}

/** Call of the Dead: two EE speedruns (Stand-in Solo, Ensemble Cast 2+). Balance patch resolves easterEggSlug to easterEggId. */
export function getBo1CallOfTheDeadEeSpeedrunDefinitions(): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];
  for (const [eeSlug, eeLabel, tiers] of [
    ['stand-in', 'Stand-in (Solo)', BO1_COTD_STAND_IN_EE_TIERS],
    ['ensemble-cast', 'Ensemble Cast (2+)', BO1_COTD_ENSEMBLE_CAST_EE_TIERS],
  ] as const) {
    for (let i = 0; i < tiers.length; i++) {
      const { maxTimeSeconds, xpReward } = tiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `easter-egg-speedrun-${eeSlug}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === tiers.length - 1 ? 'LEGENDARY' : i >= tiers.length - 2 ? 'EPIC' : i >= tiers.length - 3 ? 'RARE' : 'UNCOMMON';
      rows.push({
        slug,
        name: `${eeLabel} EE in under ${formatSpeedrunTime(maxTimeSeconds)}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { challengeType: 'EASTER_EGG_SPEEDRUN', maxTimeSeconds },
        xpReward,
        rarity,
        easterEggSlug: eeSlug,
      });
    }
  }
  return rows;
}

export function getEasterEggAchievementDefinition(): Omit<AchievementSeedRow, 'challengeId'> & {
  slug: string;
  easterEggId?: string;
} {
  return {
    slug: 'main-quest',
    name: 'Main Quest',
    type: 'EASTER_EGG_COMPLETE',
    criteria: {},
    xpReward: EASTER_EGG_BASE_XP,
    rarity: 'LEGENDARY',
  };
}
