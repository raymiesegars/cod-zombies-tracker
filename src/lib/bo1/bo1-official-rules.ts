import type { RuleItem } from '@/lib/rules/types';

/**
 * Official rules for Black Ops 1 Zombies leaderboard submissions.
 * Displayed in the Official Rules modal on map edit pages.
 */

const CONFIGS_URL = 'https://docs.google.com/document/d/14q0aJJ4kUxw-bNLLX_z1x965U7in_a9GwJur1VBK-oo/edit?usp=sharing';
const COMPETITIVE_T5_URL = 'https://gitlab.com/EvelynYuki/Competitive-T5';
const RULES_RESULTS_URL = 'https://docs.google.com/spreadsheets/d/10Bw3oamGfKkUCAx7xVMR6VSoU9_8B0CqdZ1OFrKlbK4/edit?gid=308442124#gid=308442124';
const COOP_DOC_URL = RULES_RESULTS_URL; // Co-op community standards in rules results
const BYPASS_25DAY_URL = 'https://zwr.gg/wiki/how-to-bypass-the-25-day-freeze-black-screen';

export const BO1_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'PC - Plutonium',
      items: [
        'ALL Black Ops 1 (PC - Plutonium) submissions must show the following:',
        'For solo, "cg_flashScriptHashes 1" must be set at least at the start of each match. For co-op, only the host must do this.',
        'For solo and co-op alike, "cg_drawIdentifier 1" is required during the entirety of the game.',
        { parts: ['Configs that run all of the desired commands can be found ', { text: 'here', href: CONFIGS_URL }, '.'] },
        { parts: ['The Competitive-T5 mod is ALLOWED, and can be found ', { text: 'here', href: COMPETITIVE_T5_URL }, '.'] },
        { parts: ['Please refer to this document on how to play co-op within the community standards found ', { text: 'here', href: COOP_DOC_URL }, '.'] },
        { parts: ['The following rules were finalized on May 3rd, 2025. Results can be viewed ', { text: 'here', href: RULES_RESULTS_URL }, '.'] },
      ],
    },
    {
      title: 'PC - Steam',
      items: [
        'ALL Black Ops 1 (PC - Steam) submissions must show the following:',
        'The recording must include the game being launched via the executable (Bgamert5 or Blackops.exe). The executable must not be launched via a shortcut.',
        'Please ensure all HIDDEN files are shown. Showing the contents of your zone folder is also recommended.',
        'Using shortcuts or Steam to launch the game is NOT ALLOWED.',
        'DISCLAIMER: All co-ops MUST stream their sleepers/breaks to prove the FPS has not been altered on Steam. Altering the FPS will cause the reset to slow down and therefore is NOT ALLOWED. HOST POV IS REQUIRED.',
        'ALL Coop games that are within the Top 3 leaderboard positions MUST provide the Host\'s POV.',
      ],
    },
    {
      title: 'Allowed',
      items: [
        'Audio is REQUIRED for the setup at the very minimum as of January 12th, 2023.',
        'Automatic timers (hooked timers) are ALLOWED.',
        'Automatic trap timers are ALLOWED using Tim.',
        'BGamer is ALLOWED.',
        'Binding keyboard interaction key to controller buttons to hit the box faster is ALLOWED.',
        'Changing FOV is ALLOWED.',
        'Changing FPS is ALLOWED (up to 250 FPS).',
        'Co-op pause is ALLOWED.',
        'Fast Restart Binds, Custom Resolutions are ALLOWED.',
        'Fixed backspeed is ALLOWED by opening Dead Ops Arcade.',
        'Fixed backspeed on co-op is ALLOWED using TIM and Config Binds.',
        'Free sallies on "Five" are ALLOWED.',
        'HUD Changes that do not affect gameplay are ALLOWED.',
        'Immunity to Georges\' lightning on Call of the Dead is ALLOWED.',
        'Co-op splitscreen is ALLOWED.',
        'Custom camos and textures are ALLOWED.',
        'Disabling graphic content is ALLOWED.',
        'Fast knife exploit is ALLOWED.',
        'Muted voice lines are ALLOWED.',
        'Out of Bounds (OoB) sleeper glitches are ALLOWED on co-op.',
        'Perk animation canceling is ONLY allowed if at least one full perk animation is shown.',
        'Plutonium is ALLOWED.',
        'Reduced graphic content in co-op is ALLOWED.',
        'Reset Tracker is ALLOWED.',
        'TIM and MUT are ALLOWED.',
        'Tracking Box hits is ALLOWED.',
        { parts: ['Bypassing the 25 day Black Screen is ALLOWED, but must be done via the Config/Command/BIOS. You can find how to do those methods ', { text: 'here', href: BYPASS_25DAY_URL }, '.'] },
        'Roof spawn canceling is ALLOWED.',
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'Changing Campaign Difficulty for Zombies is NOT ALLOWED.',
        'Changing Graphic Content mid-game is NOT ALLOWED.',
        'All binds unless specified (i.e., FPS, FOV, etc.) are NOT ALLOWED.',
        'Cancelling spawns NOT INCLUDING roof spawns is NOT ALLOWED.',
        'Changing FPS for sleepers in co-op is NOT ALLOWED.',
        'Cheat engine is NOT ALLOWED.',
        'Custom .ff patches are NOT ALLOWED.',
        'Custom corpse count is NOT ALLOWED.',
        'Disabling ragdolls is NOT ALLOWED.',
        'Dog tracker is NOT ALLOWED.',
        'Duplication of weapons is NOT ALLOWED.',
        'Fast Ray is NOT ALLOWED.',
        'Foliage, smoke effect removal, and transparent textures are NOT ALLOWED.',
        'Fullbright is NOT ALLOWED.',
        'Glitching the nova spawn on Kino Der Toten (cancelling the crawl down wall animation to where they drop straight down) is NOT ALLOWED.',
        'God mode and no clip are NOT ALLOWED (this includes sleepers on co-ops).',
        'Health bar is NOT ALLOWED.',
        'Increasing the Damage Icon Duration is NOT ALLOWED.',
        'In-game timer patches are NOT ALLOWED (with the exception of Song Speedruns).',
        'Multiple actions bound on a single key/button (macros) is NOT ALLOWED.',
        'No Fog is NOT ALLOWED.',
        'Removing Mule Kick in co-op is NOT ALLOWED.',
        'Round skipping is NOT ALLOWED.',
        'The use of filmtweaks on Ascension is NOT ALLOWED due to significant changes in vision.',
        'Using the console command to enable Mule Kick while playing offline is NOT ALLOWED.',
        'Virtual Machines and Emulators are NOT ALLOWED.',
        'Zolfernos and other trainers are NOT ALLOWED.',
        'Zombie Counter is NOT ALLOWED.',
      ],
    },
    {
      title: 'Map Specific',
      items: [
        'Nacht der Untoten & Verruckt: Players are ALLOWED to use Monkey Bombs after reconnecting in co-op games.',
        'Moon: Players are ALLOWED to give the hacking device to off-host players in order to obtain longer reset times.',
        'Moon: Glitching the Astronaut in biodome is NOT ALLOWED.',
        'Moon: It is NOT ALLOWED to shorten the rounds down to 24 zombies per round using the teleporter.',
      ],
    },
  ],
  /** Challenge type -> rule description. Missing types show "Official rules coming soon." */
  challengeRulesByType: {
    NO_DOWNS: 'Reach the highest round possible without a player going down. Every round must be played in full.',
    NO_PERKS: 'Reach the highest round you can without using perks. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    NO_PACK: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    STARTING_ROOM: 'Reach the highest round possible without opening any doors. Fixed backspeed is ALLOWED for SOLO ONLY on PC. Restricted Graphic Content is ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
    STARTING_ROOM_JUG_SIDE: 'Official rules coming soon.',
    STARTING_ROOM_QUICK_SIDE: 'Official rules coming soon.',
    ONE_BOX: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED. Traps are NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    PISTOL_ONLY: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED. Traps are NOT ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED.',
    NO_POWER: 'Reach the highest round possible without turning on power. Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
  } as Record<string, string>,
};
