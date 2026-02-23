import type { RuleItem } from '@/lib/rules/types';

const BOIII_SETUP = 'https://zwr.gg/wiki/how-to-setup-the-boiii-client';
const BOIII_COMMUNITY = 'https://gitlab.com/boiii-community/BOIII-Community';
const HIGH_ROUND_PATCH_REQS = 'https://docs.google.com/document/d/1tk3thspXnDUN-8pheo9pP8MKT0fxPHh_zifgXYnx0ms/edit?usp=sharing';
const AESTHETIC_VERIFY = 'https://docs.google.com/document/d/1O8ivozkOyZQlOSvlQjx3HDB7rsFXelOrnQWUNAWXfpI/edit?tab=t.n24y2x6ezcj4';
const EE_SPEEDRUN_VERIFY = 'https://docs.google.com/document/d/1zxkrULGK61aj3CZfVwIsDTT2zt9tR_cqyGqAtp8pPLw/edit?usp=sharing';
const RNG_PATCHES_DOC = 'https://docs.google.com/document/d/1tk3thspXnDUN-8pheo9pP8MKT0fxPHh_zifgXYnx0ms/edit?usp=sharing';
const ASCENDANCE_4MODDERZ = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3006851410';
const PS4_PS5_UNLOCK = 'https://github.com/illusion0001/PS4-PS5-Game-Patch/pull/108';
const DS4C_PATCHED = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3171632315';
const ASCENDANCE_AESTHETIC = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3000417367&searchtext=aesthetic+ojumpy';
const DS4C_AESTHETIC = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3188888921';
const ASCENDANCE_EE = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3020922809';
const PRESET_GUMS = 'https://discord.gg/C76qCdvA';
const AUTOSPLITTER_CAMOS = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3508605873';
const NANITIMER = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3500824441&searchtext=nanitimer';
const EE_TIMERS_ZENITH = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3592963900';
const COMPARATIVE_AUTOSPLITTER = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3627600660';
const ASCENDANCE_FIRST_ROOM = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3086470267';
const DS4C_FIRST_ROOM = 'https://steamcommunity.com/sharedfiles/filedetails/?id=3393297084';

export const BO3_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'PC - BOIII Community Client',
      items: [
        'Starting February 1st, 2026, any world record submissions (if played on PC) must be done on BOIII Community Client version 1.0.8+. This rule has exclusions for easter egg speed runs, community, and customs categories for this game.',
        { parts: ['Learn how to set it up ', { text: 'here', href: BOIII_SETUP }, '.'] },
      ],
    },
    {
      title: 'General',
      items: [
        'ALL COOP GAME SUBMISSIONS MUST SHOW THE PREGAME OR POSTGAME LOBBY. IF NOT, PLAYERS MUST PROVIDE ALL POVS. Failure to do so will result in the submission being denied.',
        'ALL TOP 3 EASTER EGG COOP RECORDS REQUIRES ALL PLAYERS TO HAVE THEIR PROOF OF RESETS AVAILABLE ON REQUEST UNTIL THE RECORD IS APPROVED.',
        'Any high round games played before April 2017 patch will be denied or removed due to either Widows Wine causing an error at high rounds or the Widows Wine causing more grenades to spawn after killing a horde of zombies with blast furnace, any games past this date will be accepted as normal.',
        'For all coop games that have a mod loaded, the host\'s POV must be included in the submission. Failure to do so will result in denial of the record.',
        'Any no gum/classic gum games using Crawl Space for sleepers cannot be submitted megas unless it is ONLY submitted to megas.',
        'A no gums round speedrun may be submitted to classic gum and mega gums as well, but a classic gum round speedrun can only be submitted to classic gum.',
        'As of July 15th 2023, if a player is using a mod that has NOT been verified by ZWR, they MUST provide the patch used to an administrator or higher. Players\' are required to show evidence at the end of the run of them providing the patch to said ZWR staff. If this is not done, the run will be denied until the patch has been provided.',
        'As of July 15th 2023, players\' are required to provide their \'raw footage\' of the run for ROUND and EASTER EGG SPEEDRUNS ONLY if they played offline (off stream). Due to the nature of RNG in these runs, requiring raw footage will allow verifiers to confirm any use of modified RNG through injecting or patching. Raw footage will be all footage recorded in the session you got the final run in.',
        'The last-generation version of the game is not allowed for any records.',
        'Any game submitted MUST be played on the most recent version.',
      ],
    },
    {
      title: 'Allowed',
      items: [
        'AFK Glitches and Crawl Space are ALLOWED for Sleeper and Breaks ONLY.',
        'Automatic timers are ALLOWED.',
        'Automatic trap timers are ALLOWED.',
        { parts: ['BOIII Community Version 1.1.5+ is ALLOWED (EXCLUDING EASTER EGG CATEGORIES), can be downloaded ', { text: 'here', href: BOIII_COMMUNITY }, '. Using older versions of the client will result in your submission being denied.'] },
        'Certain patches are ALLOWED FOR HIGH ROUND CATEGORIES ONLY; further explanation can be seen below. Please be sure to read it thoroughly.',
        'Co-op splitscreen is ALLOWED.',
        'Custom camos and textures are ALLOWED.',
        'Error Trackers are ALLOWED.',
        'Fast Restart Binds and custom Resolutions are ALLOWED.',
        'One window strategies are ALLOWED.',
        'Playing solo in a co-op game is ALLOWED.',
        'Usermaps is ALLOWED to bypass the Tuesday Steam Server Reset.',
        'Usermaps is ALLOWED to give access to the console for PC players.',
        'Using Quote Skips is ALLOWED.',
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'Any other mods that are not specified below are NOT ALLOWED.',
        'Automatic AAT Timers are NOT ALLOWED.',
        'Cancelling Spawns (Including Roof Spawns) is NOT ALLOWED - with the exception of co-ops.',
        'Custom corpse count is NOT ALLOWED.',
        'Duplication of weapons is NOT ALLOWED - with the exception of EE runs.',
        'God mode for sleepers is NOT ALLOWED.',
        'Health Bars are NOT ALLOWED.',
        'Infinite Death Machine is NOT ALLOWED.',
        'Infinite Specialist glitches are NOT ALLOWED.',
        'Loading a mod or using the "MENU GLITCH" to acquire unobtainable attachments such as FMJ is NOT ALLOWED.',
        'Macros are NOT ALLOWED.',
        'Master Spawner is NOT ALLOWED (with the exception of dog rounds).',
        'No fog is NOT ALLOWED.',
        'Prolonging special weapons through the use of glitches is NOT ALLOWED.',
        'Substituting a player during a co-op is NOT ALLOWED.',
        'Transparent textures are NOT ALLOWED (with the exception of weapon camos, EXCLUDING EASTER EGG SPEEDRUNS).',
        'Zombie Counters are NOT ALLOWED.',
        'Injection is NOT ALLOWED (Safety patch by Serious is allowed)',
        'Storing/Stowing gums is NOT ALLOWED.',
      ],
    },
    {
      title: 'Patches',
      items: [
        'DISCLAIMER: Modifying/altering special rounds, or patching the box to always give you a certain gun until 255 is NOT ALLOWED. Players caught doing this will have all solo games, and any hosted co-op games removed from their profile removed and they will be provided with the convicted cheater role.',
        'Box and perk bottle patches are ALLOWED for all main categories EXCEPT FIRST ROOM, ROUND 30/50 AND EE SPEEDRUNS. This includes High Rounds, Flawless, No AATs, No Power, No Perks, and No Jug. This does NOT include community challenges such as Song speedruns, PAP speedruns etc.',
        { parts: ['In order for a High Round patch to be "verifiable", it must be published on the Steam Workshop and provided to a ZWR Staff member for verification prior to the occurrence of the submission run and adhere to the requirements, found ', { text: 'here', href: HIGH_ROUND_PATCH_REQS }, '. (Note: Verification process may take some time.)'] },
        { parts: ['In order for an aesthetic mod to be "verifiable", it must be published on the Steam Workshop and provided to a ZWR Staff member for verification prior to the occurrence of the submission run and adhere to the requirements, found ', { text: 'here', href: AESTHETIC_VERIFY }, '. (Note: Verification process may take some time.)'] },
        { parts: ['In order for a EE Speedrun patch to be "verifiable", it must be shared with a ZWR moderator or higher in the proof of resets or published on the Steam Workshop and provided to a ZWR Staff member for verification prior to the occurrence of the submission run and adhere to the requirements, found ', { text: 'here', href: EE_SPEEDRUN_VERIFY }, '. (Note: Verification process may take some time.)'] },
      ],
    },
    {
      title: 'Verified Patches',
      items: [
        { parts: ['The following RNG patches that are ALLOWED for most Round-Based and 70/100/255 SR submissions can be found ', { text: 'here', href: RNG_PATCHES_DOC }, ', the only round-based exclusion is First Rooms (community-voted).'] },
        'The In-Game Timer and In-Game Round Timer\'s in both Jumpy Patches are allowed for their respective categories that they are allowed in.',
        { parts: ['Ascendance 4Modderz (0.9.7+) by oJumpy can be downloaded ', { text: 'here', href: ASCENDANCE_4MODDERZ }, '.'] },
        'BO3 Practice Tool (FOR EE, SONG, and PAP SPEEDRUNS ONLY) by Scrappy can be downloaded (Steam Workshop).',
        { parts: ['The PS4/PS5 Unlock all patch can be used which can be found ', { text: 'here', href: PS4_PS5_UNLOCK }, '. This will require a jailbreak.'] },
        { parts: ['Ds4c Patched (v0.71+) by Death_Storm4 can be downloaded ', { text: 'here', href: DS4C_PATCHED }, '.'] },
      ],
    },
    {
      title: 'Verified Aesthetic Patches',
      items: [
        { parts: ['Ascendance (0.9.8+) by oJumpy can be downloaded ', { text: 'here', href: ASCENDANCE_AESTHETIC }, '.'] },
        { parts: ['Ds4c (v0.73+) by Death_Storm4 can be downloaded ', { text: 'here', href: DS4C_AESTHETIC }, '.'] },
      ],
    },
    {
      title: 'Verified EE Patches',
      items: [
        { parts: ['Ascendance EE Friendly by oJumpy can be downloaded ', { text: 'here', href: ASCENDANCE_EE }, '.'] },
        { parts: ['Preset Gums can be found in Freckleston\'s Discord ', { text: 'here', href: PRESET_GUMS }, '.'] },
        { parts: ['Autosplitter Mod for Livesplit by Cbrnn and camos by Keep3rs can be downloaded ', { text: 'here', href: AUTOSPLITTER_CAMOS }, '.'] },
        { parts: ['NaniTimer by Nanikos can be downloaded ', { text: 'here', href: NANITIMER }, '.'] },
        { parts: ['In-Game Easter Egg Timers by Zenith can be downloaded ', { text: 'here', href: EE_TIMERS_ZENITH }, '.'] },
        { parts: ['Comparative Autosplitter by Raheem can be downloaded ', { text: 'here', href: COMPARATIVE_AUTOSPLITTER }, '.'] },
      ],
    },
    {
      title: 'Verified First Room Patches',
      items: [
        { parts: ['Ascendance First Room (0.9.7+ FOR ALL First Room\'s except ZNS and MOON) by oJumpy can be downloaded ', { text: 'here', href: ASCENDANCE_FIRST_ROOM }, '.'] },
        { parts: ['Ds4c First Room Patch by Death_Storm4 can be downloaded ', { text: 'here', href: DS4C_FIRST_ROOM }, '.'] },
      ],
    },
    {
      title: 'Zetsubou No Shima',
      items: [
        'Skipping spider rounds with the skull altar is ALLOWED.',
      ],
    },
    {
      title: 'No Downs',
      items: [
        'Reach the highest round possible without a player going down.',
        'Every round must be played in full.',
      ],
    },
    {
      title: 'No Perks',
      items: [
        'Reach the highest round you can without using perks.',
        'Every round must be played in full.',
        'Glitches or Exploits are NOT ALLOWED.',
        'Multi-pov is required for co-op.',
      ],
    },
    {
      title: 'No Pack-a-Punch',
      items: [
        'Reach the highest round possible without pack-a-punching',
        'Every round must be played in full.',
        'Traps are NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
        'Multi-pov is required for co-op.',
      ],
    },
    {
      title: 'One Box Challenge',
      items: [
        'Reach the highest round possible by hitting the box one time per player.',
        'Buying a wall weapon is NOT ALLOWED.',
        'Pack-a-Punching is ALLOWED.',
        'AAT\'s are NOT ALLOWED.',
        'Traps are NOT ALLOWED.',
        'Every round must be played in full.',
        'Glitches or Exploits are NOT ALLOWED.',
        'Multi-pov is required for co-op.',
      ],
    },
    {
      title: 'Pistol Only',
      items: [
        'Reach the highest round possible only using your any pistol on the map.',
        'Hitting the box is ALLOWED.',
        'Picking up weapons other than Pistols is NOT ALLOWED.',
        'Using the Ray Gun is NOT ALLOWED.',
        'Traps are NOT ALLOWED.',
        'Pack-a-Punching is ALLOWED.',
        'Buying nades off the wall is NOT ALLOWED.',
        'Multi-pov is required on co-op.',
      ],
    },
    {
      title: 'No Power',
      items: [
        'Reach the highest round possible without turning on power.',
        'Every round must be played in full.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - General',
      items: [
        'No gums: Reach the highest round possible without opening any doors. Play using no gobblegums. Reach the highest round you can without opening doors. Crawl Space is ALLOWED in co-op games for sleeper purposes.',
        'Classic gums: Reach the highest round possible without opening any doors. Play with only classic gobblegums. Reach the highest round you can without opening doors. Crawl Space is ALLOWED in co-op games for sleeper purposes.',
        'Mega gums: Reach the highest round possible without opening any doors. Play using at least one mega gobblegum. Reach the highest round you can without opening doors. Flavor Hexed, Self Medication, Near Death Experience, Power Vacuum, and Round Robbin are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Shadows of Evil',
      items: [
        'Shooting the Shadowman is NOT ALLOWED.',
        'Patching the locus in pods is ALLOWED.',
        'Patching the drop in the door is ALLOWED.',
        'There is no gobblegum machine in the first room on SOE.',
      ],
    },
    {
      title: 'First Room - Der Eisendrache',
      items: [
        'Patching the ray gun into the Tram is ALLOWED.',
        'Patching All rewards is ALLOWED.',
      ],
    },
    {
      title: 'First Room - Zetsubou No Shima',
      items: [
        'Patching all rewards is ALLOWED.',
      ],
    },
    {
      title: 'First Room - Gorod Krovi',
      items: [
        'Patching your challenges is ALLOWED. You can patch your challenges, not the rewards they give you.',
      ],
    },
    {
      title: 'First Room - Origins',
      items: [
        'Patching the first reward is ALLOWED.',
        'Removing the MP-40 from the chest patchable rewards via a patch, which would give 50% chance for Weevil and 50% chance for ICR-1 is ALLOWED.',
        'Getting Double Tap back after reconnecting is NOT ALLOWED.',
      ],
    },
  ],
  /** Challenge type -> rule description. Missing types show "Official rules coming soon." */
  challengeRulesByType: {
    NO_DOWNS: 'Reach the highest round possible without a player going down. Every round must be played in full.',
    NO_PERKS: 'Reach the highest round you can without using perks. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    NO_PACK: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    ONE_BOX: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. AAT\'s are NOT ALLOWED. Traps are NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    PISTOL_ONLY: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED. Traps are NOT ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED. Multi-pov is required on co-op.',
    NO_POWER: 'Reach the highest round possible without turning on power. Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
    STARTING_ROOM: 'Reach the highest round possible without opening any doors. Rules vary by gums (No gums / Classic gums / Mega gums). Crawl Space is ALLOWED in co-op for sleeper purposes. Map-specific rules apply (see General Rules).',
    STARTING_ROOM_JUG_SIDE: 'Official rules coming soon.',
    STARTING_ROOM_QUICK_SIDE: 'Official rules coming soon.',
    NO_JUG: 'Reach the highest round possible without purchasing Juggernog.',
    NO_ATS: 'Reach the highest round possible without using Alternate Ammo Types (AATs).',
  } as Record<string, string>,
};
