import type { RuleItem } from '@/lib/rules/types';

export const BOCW_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'General',
      items: [
        'Reach the highest round you can.',
        'Every round must be played in full.',
        'Loading into Outbreak to acquire extended interaction range is ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'Video Requirements',
      items: [
        'Full gameplay is required.',
        'Twitch: Make sure your footage is highlighted as past broadcasts will not be accepted.',
        'YouTube: Make sure your video is public or unlisted.',
      ],
    },
  ],
  /** Challenge type -> rule description. Missing types show "Official rules coming soon." */
  challengeRulesByType: {
    HIGHEST_ROUND: 'Reach the highest round you can. Every round must be played in full. The use of Support is ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED.',
    NO_DOWNS: 'With Support: Reach the highest round you can without taking a down. Every round must be played in full. The use of Support is ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED. Without Support: Reach the highest round you can without taking a down. Every round must be played in full. The use of Support is NOT ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-Pov is required for co-op.',
    NO_PERKS: 'With Support: Reach the highest round you can without buying perks. Every round must be played in full. The use of Support is ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-Pov is required for co-op. Without Support: Reach the highest round you can without buying perks. Every round must be played in full. The use of Support is NOT ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-Pov is required for co-op.',
    NO_PACK: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Support items are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    STARTING_ROOM: 'With Support: Reach the highest round you can without opening doors. Every round must be played in full. The use of Support is ALLOWED. Loading into Outbreak to acquire extended interaction range is ALLOWED. Glitches or Exploits are NOT ALLOWED. Without Support: Reach the highest round you can without opening doors. Every round must be played in full. Loading into Outbreak to acquire extended interaction range is ALLOWED. The use of Support is NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-Pov is required for co-op.',
    ONE_BOX: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. Traps are NOT ALLOWED. Using the ammo crate is ALLOWED. Use of support is NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    PISTOL_ONLY: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED. Traps are NOT ALLOWED. Pack-a-Punching is ALLOWED. AAT\'s are NOT ALLOWED. Using Support is NOT ALLOWED.',
    NO_POWER: 'Reach the highest round you can without turning the power on. Every round must be played in full. Loading into Outbreak to acquire extended interaction range is ALLOWED. The use of Support is NOT ALLOWED. The abuse of Explosive Weapons+PHD is NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Full gameplay is required. Multi-pov is required for co-op.',
    PURIST: 'Purist: Stricter rules, map-specific. See map-specific challenge rules.',
    NO_JUG: 'Official rules coming soon.',
    NO_ARMOR: 'Official rules coming soon.',
    EXFIL_SPEEDRUN: 'Complete the exfil objective on round 11 as fast as possible. Cold War round-based maps only.',
    EXFIL_R21_SPEEDRUN: 'Complete the exfil objective on round 21 as fast as possible. Cold War round-based maps only.',
    BUILD_EE_SPEEDRUN: 'Complete the wonder weapon / key buildable Easter egg as fast as possible. Map-specific. (Firebase Z, Forsaken.)',
    ROUND_10_SPEEDRUN: 'Reach round 10 as fast as possible. Outbreak only.',
    ROUND_20_SPEEDRUN: 'Reach round 20 as fast as possible. Outbreak only.',
    ROUND_30_SPEEDRUN: 'Reach round 30 as fast as possible. Timed from match start.',
    ROUND_50_SPEEDRUN: 'Reach round 50 as fast as possible. Timed from match start.',
    ROUND_70_SPEEDRUN: 'Reach round 70 as fast as possible. Timed from match start.',
    ROUND_100_SPEEDRUN: 'Reach round 100 as fast as possible. Timed from match start.',
    ROUND_200_SPEEDRUN: 'Reach round 200 as fast as possible. Timed from match start.',
    ROUND_935_SPEEDRUN: 'Reach round 935 as fast as possible. Timed from match start.',
    EASTER_EGG_SPEEDRUN: 'Complete the main Easter egg as fast as possible. Full run from match start.',
  } as Record<string, string>,
};
