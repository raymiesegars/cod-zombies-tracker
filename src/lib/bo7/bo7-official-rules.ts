import type { RuleItem } from '@/lib/rules/types';

type RulesSection = { title: string; items: RuleItem[] };

/** BO7 shared general rules (from home page). */
const BO7_SHARED_GENERAL: RulesSection[] = [
  {
    title: 'General',
    items: [
      'All games must be played on the most recent patch of the game.',
      'As Black Ops 7 is still in its life cycle, updates and patches have proven to introduce changes that affect the competitive balance of the leaderboard. Because of this, leaderboards may be reset or restored at any time. Removed runs will be backed up in case the leaderboard or specific records are reinstated at a later time.',
      'No gum games can NOT submit to both with gum and no gum sub-categories.',
      'No support games can NOT submit to both with support and without support sub-categories.',
      'Saving and quitting and/or force crashing your game to void/save a dying wish use, down, or game over is NOT ALLOWED.',
      'Build% EE runs are ALLOWED to submit to either build% EE or normal EE (box%) but, not both leaderboards.',
    ],
  },
  {
    title: 'Video Requirements',
    items: [
      'Full gameplay is required.',
      'Twitch: Make sure your footage is highlighted as past broadcasts will not be accepted.',
      'YouTube: Make sure your video is public or unlisted.',
      'Multi-pov is required for co-op.',
    ],
  },
];

/** BO7 per-map challenge specifics: Gums ALLOWED, Support ALLOWED, Timed out gobblegum NOT ALLOWED. */
const BO7_MAP_SPECIFICS: string[] = [
  'Reach the highest round you can.',
  'Every round must be played in full.',
  'Gums are ALLOWED.',
  'Using Support is ALLOWED.',
  'Glitches or Exploits are NOT ALLOWED.',
  'Timed out gobblegum is NOT ALLOWED.',
  'Multi-Pov is UNCONDITIONALLY REQUIRED for co-op games.',
];

/** Challenge type -> rule description for BO7. */
const BO7_CHALLENGE_RULES_BY_TYPE: Record<string, string> = {
  HIGHEST_ROUND: 'Reach the highest round you can. Every round must be played in full. Gums and Support allowed. See map-specific rules.',
  NO_DOWNS: 'Reach the highest round you can without taking a down. Every round must be played in full. Multi-pov is required for co-op.',
  NO_PERKS: 'Reach the highest round you can without buying perks. Every round must be played in full. Multi-pov is required for co-op.',
  NO_PACK: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  STARTING_ROOM: 'Reach the highest round you can without opening doors. Every round must be played in full. See map-specific rules. Multi-pov is required for co-op.',
  ONE_BOX: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  PISTOL_ONLY: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  NO_POWER: 'Reach the highest round you can without turning the power on. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Full gameplay is required. Multi-pov is required for co-op. (Not available on all BO7 maps.)',
  NO_JUG: 'Reach the highest round you can without purchasing Juggernog. Every round must be played in full. See map-specific rules. Multi-pov is required for co-op.',
  ROUND_30_SPEEDRUN: 'Reach round 30 as fast as possible. Timed from match start.',
  ROUND_50_SPEEDRUN: 'Reach round 50 as fast as possible. Timed from match start.',
  ROUND_70_SPEEDRUN: 'Reach round 70 as fast as possible. Timed from match start.',
  ROUND_100_SPEEDRUN: 'Reach round 100 as fast as possible. Timed from match start.',
  ROUND_200_SPEEDRUN: 'Reach round 200 as fast as possible. Timed from match start.',
  ROUND_999_SPEEDRUN: 'Reach round 999 as fast as possible. Timed from match start.',
  EXFIL_SPEEDRUN: 'Complete the exfil objective on round 11 as fast as possible.',
  EXFIL_R21_SPEEDRUN: 'Complete the exfil objective on round 21 as fast as possible.',
  EASTER_EGG_SPEEDRUN: 'Complete the main Easter egg as fast as possible. Full run from match start.',
};

/** Get BO7 official rules for a map. Used by edit page. */
export function getBo7OfficialRulesForMap(mapSlug: string): {
  generalRules: RulesSection[];
  challengeRulesByType: Record<string, string>;
} {
  return {
    generalRules: [
      ...BO7_SHARED_GENERAL,
      {
        title: 'Challenge Specifics (this map)',
        items: BO7_MAP_SPECIFICS,
      },
    ],
    challengeRulesByType: BO7_CHALLENGE_RULES_BY_TYPE,
  };
}
