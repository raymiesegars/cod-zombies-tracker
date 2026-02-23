import {
  BASE_ROUNDS,
  BASE_XP,
  EASTER_EGG_BASE_XP,
  getMilestonesForChallengeType,
  getCapXp,
} from './milestones';

const MIN_ACHIEVEMENT_XP = 50;

/** Achievement types that must NEVER be deactivated by balance patches. Main quest completion achievements are created by seed-easter-eggs and are not in getMapAchievementDefinitions. */
export const ACHIEVEMENT_TYPES_NEVER_DEACTIVATE = ['EASTER_EGG_COMPLETE'] as const;
import { formatRushScore } from '@/lib/utils';
import {
  getRoundConfigForMap,
  getXpForRoundFromMilestones,
} from './map-round-config';
import { getWaWMapConfig, getWaWRoundMilestones, getWaWChallengeTypeLabel } from '@/lib/waw/waw-map-config';
import { getBo1MapConfig, getBo1RoundMilestones, getBo1ChallengeTypeLabel } from '@/lib/bo1/bo1-map-config';
import { getBo2MapConfig, getBo2RoundMilestones, getBo2ChallengeTypeLabel } from '@/lib/bo2/bo2-map-config';
import { getBo3MapConfig, getBo3RoundMilestones, getBo3ChallengeTypeLabel } from '@/lib/bo3/bo3-map-config';
import { getBo4MapConfig, getBo4RoundMilestones, getBo4ChallengeTypeLabel } from '@/lib/bo4/bo4-map-config';
import { getBocwMapConfig, getBocwRoundMilestones, getBocwChallengeTypeLabel } from '@/lib/bocw/bocw-map-config';
import { getBo6MapConfig, getBo6RoundMilestones, getBo6ChallengeTypeLabel } from '@/lib/bo6/bo6-map-config';
import { isBo4Game, BO4_DIFFICULTIES, BO4_DIFFICULTY_XP_MULTIPLIER, type Bo4DifficultyType } from '../bo4';
import { isBocwGame } from '../bocw';
import { IW_ZIS_SPEEDRUN_TIERS, IW_RAVE_SPEEDRUN_TIERS, IW_SHAOLIN_SPEEDRUN_TIERS, IW_AOTRT_SPEEDRUN_TIERS, IW_BEAST_SPEEDRUN_TIERS, WAW_SPEEDRUN_TIERS_BY_MAP, BO1_SPEEDRUN_TIERS_BY_MAP, BO2_SPEEDRUN_TIERS_BY_MAP, BO3_SPEEDRUN_TIERS_BY_MAP, BO4_SPEEDRUN_TIERS_BY_MAP, BOCW_SPEEDRUN_TIERS_BY_MAP, BO6_SPEEDRUN_TIERS_BY_MAP, BO1_COTD_STAND_IN_EE_TIERS, BO1_COTD_ENSEMBLE_CAST_EE_TIERS, BO2_TRANZIT_RICHTOFEN_EE_TIERS, BO2_TRANZIT_MAXIS_EE_TIERS, BO2_DIE_RISE_RICHTOFEN_EE_TIERS, BO2_DIE_RISE_MAXIS_EE_TIERS, BO2_BURIED_RICHTOFEN_EE_TIERS, BO2_BURIED_MAXIS_EE_TIERS, formatSpeedrunTime, type SpeedrunTiersByType } from './speedrun-tiers';

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
    kills?: number;
    /** For RUSH challenge: qualify if scoreReached >= this */
    score?: number;
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

  // BO2: per-map config with WR-based achievements, NO_MAGIC, bank, EE variants
  if (gameShortName === 'BO2') {
    const bo2Cfg = getBo2MapConfig(mapSlug);
    if (bo2Cfg) {
      const milestones = getBo2RoundMilestones(bo2Cfg.highRoundWR);
      const maxRound = bo2Cfg.highRoundWR;
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
      if (bo2Cfg.noDownsAvailable) {
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
      for (const cType of bo2Cfg.challengeTypes) {
        if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
        const wr = (cType as string) === 'STARTING_ROOM' ? bo2Cfg.firstRoomWR
          : (cType as string) === 'NO_POWER' ? bo2Cfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? bo2Cfg.noPerksWR
          : (cType as string) === 'NO_MAGIC' ? bo2Cfg.noMagicWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo2RoundMilestones(wr);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo2ChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (bo2Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo2Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getBo2RoundMilestones(Math.min(pistolWR, 100), 5);
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

  // BO3: per-map config with WR-based achievements, NO_JUG, NO_ATS, ROUND_255, First Room variants, No Man's Land
  if (gameShortName === 'BO3') {
    const bo3Cfg = getBo3MapConfig(mapSlug);
    if (bo3Cfg) {
      const milestones = getBo3RoundMilestones(bo3Cfg.highRoundWR);
      const maxRound = bo3Cfg.highRoundWR;
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
      if (bo3Cfg.noDownsWR != null) {
        for (const { round, xp } of milestones) {
          if (round <= bo3Cfg.noDownsWR!) {
            rows.push({
              slug: `no-downs-${round}`,
              name: `No Downs Round ${round}`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS' },
              xpReward: xp,
              rarity: rarityForRound(round, bo3Cfg.noDownsWR!),
            });
          }
        }
      }
      for (const cType of bo3Cfg.challengeTypes) {
        const cTypeStr = cType as string;
        if (cTypeStr === 'HIGHEST_ROUND' || cTypeStr === 'NO_DOWNS' || cTypeStr === 'NO_MANS_LAND') continue;
        const wr =
          cTypeStr === 'STARTING_ROOM' ? bo3Cfg.firstRoomWR
          : cTypeStr === 'STARTING_ROOM_JUG_SIDE' ? bo3Cfg.firstRoomJugWR
          : cTypeStr === 'STARTING_ROOM_QUICK_SIDE' ? bo3Cfg.firstRoomQuickWR
          : cTypeStr === 'NO_POWER' ? bo3Cfg.noPowerWR
          : cTypeStr === 'NO_PERKS' ? bo3Cfg.noPerksWR
          : cTypeStr === 'NO_JUG' ? bo3Cfg.noJugWR
          : cTypeStr === 'NO_ATS' ? (bo3Cfg as { noAtsWR?: number }).noAtsWR ?? bo3Cfg.noJugWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo3RoundMilestones(wr);
        const slugPrefix = cTypeStr.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo3ChallengeTypeLabel(cTypeStr)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (bo3Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo3Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getBo3RoundMilestones(Math.min(pistolWR, 100), 5);
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
      if (bo3Cfg.noMansLandWR != null) {
        const killsMilestones = [100, 200, 300, 400, bo3Cfg.noMansLandWR];
        const killsXp = [100, 300, 600, 1000, 2000];
        for (let i = 0; i < killsMilestones.length; i++) {
          const kills = killsMilestones[i]!;
          const xp = killsXp[i] ?? 2000;
          rows.push({
            slug: `no-mans-land-${kills}`,
            name: `No Man's Land ${kills} kills`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { kills, challengeType: 'NO_MANS_LAND' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: kills >= 400 ? 'LEGENDARY' : kills >= 300 ? 'EPIC' : kills >= 200 ? 'RARE' : 'UNCOMMON',
          });
        }
      }
      return rows;
    }
  }

  // BO4: per-map config with WRs per difficulty, RUSH (score), INSTAKILL_ROUND_SPEEDRUN (speedrun tiers)
  if (gameShortName === 'BO4') {
    const bo4Cfg = getBo4MapConfig(mapSlug);
    if (bo4Cfg) {
      const difficulties = BO4_DIFFICULTIES.filter((d) => bo4Cfg.highRoundWR[d] > 0);
      for (const diff of difficulties) {
        const wr = bo4Cfg.highRoundWR[diff];
        const milestones = getBo4RoundMilestones(wr);
        for (const { round, xp } of milestones) {
          if (round > wr) continue;
          const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
          rows.push({
            slug: `round-${round}-${diff.toLowerCase()}`,
            name: `Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()})`,
            type: 'ROUND_MILESTONE',
            criteria: { round, challengeType: 'HIGHEST_ROUND', difficulty: diff },
            xpReward: baseXp,
            rarity: rarityForRound(round, wr),
            difficulty: diff,
          });
        }
        const ndWr = bo4Cfg.noDownsWR[diff];
        if (ndWr > 0) {
          const ndMilestones = getBo4RoundMilestones(ndWr);
          for (const { round, xp } of ndMilestones) {
            if (round > ndWr) continue;
            const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
            rows.push({
              slug: `no-downs-${round}-${diff.toLowerCase()}`,
              name: `No Downs Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()})`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS', difficulty: diff },
              xpReward: baseXp,
              rarity: rarityForRound(round, ndWr),
              difficulty: diff,
            });
          }
        }
      }
      for (const cType of bo4Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct === 'RUSH' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'INSTAKILL_ROUND_SPEEDRUN') continue;
        const wr = ct === 'STARTING_ROOM' ? bo4Cfg.firstRoomWR
          : ct === 'NO_POWER' ? bo4Cfg.noPowerWR
          : ct === 'NO_PERKS' ? bo4Cfg.noPerksWR
          : ct === 'PURIST' ? bo4Cfg.puristWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo4RoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo4ChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, difficulty: 'NORMAL' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
            difficulty: 'NORMAL',
          });
        }
      }
      if (bo4Cfg.rushWR != null && bo4Cfg.rushWR > 0) {
        const rushWr = bo4Cfg.rushWR;
        const scoreMilestones = [Math.floor(rushWr * 0.1), Math.floor(rushWr * 0.25), Math.floor(rushWr * 0.5), Math.floor(rushWr * 0.75), rushWr];
        const scoreXp = [100, 300, 600, 1000, 2000];
        for (let i = 0; i < scoreMilestones.length; i++) {
          const score = scoreMilestones[i]!;
          const xp = scoreXp[i] ?? 2000;
          rows.push({
            slug: `rush-${score}`,
            name: `Rush ${formatRushScore(score)}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { score, challengeType: 'RUSH', difficulty: 'NORMAL' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: score >= rushWr * 0.75 ? 'LEGENDARY' : score >= rushWr * 0.5 ? 'EPIC' : score >= rushWr * 0.25 ? 'RARE' : 'UNCOMMON',
            difficulty: 'NORMAL',
          });
        }
      }
      return rows;
    }
  }

  // BOCW: per-map config with WRs, Purist, No Armor, No Jug, speedruns, exfil, build% EE
  if (gameShortName === 'BOCW') {
    const bocwCfg = getBocwMapConfig(mapSlug);
    if (bocwCfg) {
      const milestones = getBocwRoundMilestones(bocwCfg.highRoundWR);
      for (const { round, xp } of milestones) {
        if (round > bocwCfg.highRoundWR) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, bocwCfg.highRoundWR),
        });
      }
      const ndMilestones = getBocwRoundMilestones(bocwCfg.noDownsWR);
      for (const { round, xp } of ndMilestones) {
        if (round > bocwCfg.noDownsWR) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, bocwCfg.noDownsWR),
        });
      }
      for (const cType of bocwCfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_SPEEDRUN' || ct === 'EXFIL_R21_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const wr = ct === 'STARTING_ROOM' ? bocwCfg.firstRoomWR
          : ct === 'NO_POWER' ? bocwCfg.noPowerWR
          : ct === 'NO_PERKS' ? bocwCfg.noPerksWR
          : ct === 'PURIST' ? bocwCfg.puristWR
          : ct === 'NO_ARMOR' ? bocwCfg.noArmorWR
          : ct === 'NO_JUG' ? bocwCfg.noJugWR
          : undefined;
        if (wr == null || wr <= 0) continue;
        const cMilestones = getBocwRoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBocwChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      return rows;
    }
  }

  // BO6: per-map config with WRs, First Room, No Perks, No Jug, speedruns, exfil, build% EE
  if (gameShortName === 'BO6') {
    const bo6Cfg = getBo6MapConfig(mapSlug);
    if (bo6Cfg) {
      const milestones = getBo6RoundMilestones(bo6Cfg.highRoundWR);
      for (const { round, xp } of milestones) {
        if (round > bo6Cfg.highRoundWR) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, bo6Cfg.highRoundWR),
        });
      }
      const ndMilestones = getBo6RoundMilestones(bo6Cfg.noDownsWR);
      for (const { round, xp } of ndMilestones) {
        if (round > bo6Cfg.noDownsWR) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, bo6Cfg.noDownsWR),
        });
      }
      for (const cType of bo6Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_SPEEDRUN' || ct === 'EXFIL_R21_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const wr = ct === 'STARTING_ROOM' ? bo6Cfg.firstRoomWR
          : ct === 'NO_PERKS' ? bo6Cfg.noPerksWR
          : ct === 'NO_JUG' ? bo6Cfg.noJugWR
          : undefined;
        if (wr == null || wr <= 0) continue;
        const cMilestones = getBo6RoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo6ChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
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
  ROUND_10_SPEEDRUN: 'Round 10',
  ROUND_20_SPEEDRUN: 'Round 20',
  ROUND_30_SPEEDRUN: 'Round 30',
  ROUND_50_SPEEDRUN: 'Round 50',
  ROUND_70_SPEEDRUN: 'Round 70',
  ROUND_100_SPEEDRUN: 'Round 100',
  ROUND_200_SPEEDRUN: 'Round 200',
  ROUND_255_SPEEDRUN: 'Round 255',
  ROUND_935_SPEEDRUN: 'Round 935',
  ROUND_999_SPEEDRUN: 'Round 999',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  BUILD_EE_SPEEDRUN: 'Build% EE',
  INSTAKILL_ROUND_SPEEDRUN: 'Instakill Round',
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
    : gameShortName === 'BO2' ? BO2_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO3' ? BO3_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO4' ? BO4_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BOCW' ? BOCW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO6' ? BO6_SPEEDRUN_TIERS_BY_MAP[mapSlug]
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
/** BO2 EE speedruns: Tranzit, Die Rise, Buried have Richtofen vs Maxis variants. Balance patch resolves easterEggSlug. */
export function getBo2EeSpeedrunDefinitions(mapSlug: string): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];
  const variants: [string, string, import('./speedrun-tiers').SpeedrunTier[]][] = (() => {
    if (mapSlug === 'tranzit') return [['tower-of-babble-richtofen', 'Richtofen', BO2_TRANZIT_RICHTOFEN_EE_TIERS], ['tower-of-babble-maxis', 'Maxis', BO2_TRANZIT_MAXIS_EE_TIERS]];
    if (mapSlug === 'die-rise') return [['high-maintenance-richtofen', 'Richtofen', BO2_DIE_RISE_RICHTOFEN_EE_TIERS], ['high-maintenance-maxis', 'Maxis', BO2_DIE_RISE_MAXIS_EE_TIERS]];
    if (mapSlug === 'buried') return [['mined-games-richtofen', 'Richtofen', BO2_BURIED_RICHTOFEN_EE_TIERS], ['mined-games-maxis', 'Maxis', BO2_BURIED_MAXIS_EE_TIERS]];
    return [];
  })();
  for (const [eeSlug, variantLabel, tiers] of variants) {
    for (let i = 0; i < tiers.length; i++) {
      const { maxTimeSeconds, xpReward } = tiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `easter-egg-speedrun-${eeSlug}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === tiers.length - 1 ? 'LEGENDARY' : i >= tiers.length - 2 ? 'EPIC' : i >= tiers.length - 3 ? 'RARE' : 'UNCOMMON';
      rows.push({
        slug,
        name: `${variantLabel} EE in under ${formatSpeedrunTime(maxTimeSeconds)}`,
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
