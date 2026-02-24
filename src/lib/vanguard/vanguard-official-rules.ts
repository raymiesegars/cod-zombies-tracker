import type { RuleItem } from '@/lib/rules/types';

/**
 * Vanguard Zombies official rules (Der Anfang / Terra Maledicta / Shi No Numa Reborn / The Archon).
 */

export const VANGUARD_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'General',
      items: [
        'All games must be played on the most recent patch of the game.',
        'All coop games must be played online.',
        'All solo games played on Der Anfang or Terra Maledicta (OFFLINE) must show you doing this here to make Zabella spawn offline.',
        'In 3p and 4p only, the Brimstone covenant is banned if all players are camping in a climb-up location. All players are required to provide their POV if they are camping in that specific location.',
        'Please note that games played prior to 9/28/2022 are not valid due to significant changes in an update that patched how players achieved high rounds.',
      ],
    },
    {
      title: 'Video Requirements',
      items: [
        'Full gameplay is required.',
        'Twitch: Make sure your footage is highlighted as past broadcasts will not be accepted.',
        'YouTube: Make sure your video is public or unlisted.',
        'Multi-POV is unconditionally required for co-op games.',
      ],
    },
  ],
  challengeRulesByType: {
    HIGHEST_ROUND: 'Reach the highest round you can. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    NO_DOWNS: 'Reach the highest round you can without going down. Every round must be played in full. Glitches or exploits are NOT ALLOWED. Multi-POV is required for co-op.',
    NO_PERKS: 'Reach the highest round you can without purchasing any perks. Every round must be played in full. Glitches or exploits are NOT ALLOWED. Multi-POV is required for co-op.',
    NO_JUG: 'Reach the highest round you can without purchasing Juggernog. Every round must be played in full. The use of armour is ALLOWED. Glitches or exploits are NOT ALLOWED.',
    NO_ARMOR: 'Reach the highest round you can without purchasing armour. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    STARTING_ROOM: 'Stay in the starting room only. Every round must be played in full. Glitches or exploits are NOT ALLOWED. Multi-POV is required for co-op.',
    ROUND_10_SPEEDRUN: 'Reach round 10 as fast as possible. Timed from match start.',
    ROUND_20_SPEEDRUN: 'Reach round 20 as fast as possible. Timed from match start.',
    ROUND_30_SPEEDRUN: 'Reach round 30 as fast as possible. Timed from match start.',
    ROUND_50_SPEEDRUN: 'Reach round 50 as fast as possible. Timed from match start.',
    ROUND_70_SPEEDRUN: 'Reach round 70 as fast as possible. Timed from match start.',
    ROUND_100_SPEEDRUN: 'Reach round 100 as fast as possible. Timed from match start.',
    ROUND_200_SPEEDRUN: 'Reach round 200 as fast as possible. Timed from match start.',
    EXFIL_R5_SPEEDRUN: 'Exfil at round 5 as fast as possible. Der Anfang and Terra Maledicta only.',
    EXFIL_R10_SPEEDRUN: 'Exfil at round 10 as fast as possible.',
    EXFIL_R20_SPEEDRUN: 'Exfil at round 20 as fast as possible. Shi No Numa Reborn and The Archon only.',
    EASTER_EGG_SPEEDRUN: 'Complete the main Easter egg as fast as possible. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    BUILD_EE_SPEEDRUN: 'Complete the Build% Easter egg as fast as possible. Shi No Numa Reborn only.',
  } as Record<string, string>,
};
