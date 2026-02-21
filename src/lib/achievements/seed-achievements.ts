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
import { isBo4Game, BO4_DIFFICULTIES, BO4_DIFFICULTY_XP_MULTIPLIER, type Bo4DifficultyType } from '../bo4';
import { IW_ZIS_SPEEDRUN_TIERS, formatSpeedrunTime } from './speedrun-tiers';

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
    for (const cType of CHALLENGE_TYPES) {
      if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
      const defaultConfig = getMilestonesForChallengeType(cType as any);
      if (!defaultConfig) continue;
      const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
      const overrideRounds = isIwZis ? IW_ZIS_CHALLENGE_ROUNDS[cType] : undefined;
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
  EASTER_EGG_SPEEDRUN: 'Easter Egg',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
};

/** Speedrun tier achievements for IW Zombies in Spaceland (and future IW maps). Fastest = most XP. */
export function getSpeedrunAchievementDefinitions(
  mapSlug: string,
  gameShortName: string
): AchievementSeedRow[] {
  if (gameShortName !== 'IW' || mapSlug !== 'zombies-in-spaceland') return [];
  const rows: AchievementSeedRow[] = [];
  for (const [challengeType, tiers] of Object.entries(IW_ZIS_SPEEDRUN_TIERS)) {
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
