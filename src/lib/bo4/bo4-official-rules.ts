import type { RuleItem } from '@/lib/rules/types';

const PROJECT_BO4_VIDEO = 'https://www.youtube.com/watch?v=oRfdU-bhuz8';
const PS4_PS5_UNLOCK = 'https://github.com/illusion0001/PS4-PS5-Game-Patch/pull/108';

export const BO4_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'General',
      items: [
        'Pregame lobby is unanimously REQUIRED for all games played after 05/04/2022. Please remember to show everyone\'s loadouts/class (elixirs/talismans).',
        'Project-BO4 is ALLOWED.',
        'If players are using the Client (Project BO4), ALL submissions MUST have the host prove default settings have not been altered. This can be done by: Options -> Edit Game Rules -> Reset To Default -> Reset All. If the player(s) are using version 1.0.20.6+, this is not required.',
        'EE Speedruns need to prove that they are not using versions of Project-BO4 that are NOT ALLOWED. If using Battle.net (vanilla): show launch of the game (see video below). If using Project BO4 v1.0.26.0+: showing launch is no longer required as the version number appears in the top-right.',
        { parts: ['EE Speedrun launch verification video: ', { text: 'Watch here', href: PROJECT_BO4_VIDEO }, '.'] },
        'The only thing allowed to be injected into BO4 is FAST RESTARTS. Anything else is NOT ALLOWED.',
        'Speedruns start when Round 1 appears on the screen.',
        'Split-Screen is ALLOWED.',
        'Covering HUD information such as health, points, or directly below the round counter (where you see Player Connect messages) is NOT ALLOWED.',
        'Covering the top-right of the screen is NOT ALLOWED if using the client.',
      ],
    },
    {
      title: 'Allowed',
      items: [
        'All mega elixirs are ALLOWED in the category All Elixirs & Talismans.',
        'All side Easter Eggs while using the Project-BO4 client.',
        { parts: ['The PS4/PS5 Unlock all patch can be used which can be found ', { text: 'here', href: PS4_PS5_UNLOCK }, '. This will require a jailbreak. (Serves as an unlimited elixir/talisman mod.)'] },
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'Duplicating weapons is NOT ALLOWED.',
        'Intentionally going down and being revived by the Scepter of Ra or Ragnarok with the Bandolier Bandit perk to generate ammo is NOT ALLOWED.',
        'Intentionally going down and reviving the player permanently to charge specialist is NOT ALLOWED.',
        'Playing on Custom Mutations is NOT ALLOWED.',
        'Playing with bots is NOT ALLOWED.',
        'Shield Exploit is NOT ALLOWED in NORMAL DIFFICULTY.',
        'Repeatedly using Victorious Tortoise shield explosions (intentionally) to kill full hoards of zombies is NOT ALLOWED.',
        'Camping next to the shield table with Victorious Tortoise is NOT ALLOWED.',
        'Using free doors across all Speedruns is NOT ALLOWED.',
        'Using Electric Burst in the Odin/Tonic perk slot is NOT ALLOWED, except for Speedruns.',
        'No Downs: Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'Rush',
      items: ['Rush: Rules coming soon.'],
    },
    {
      title: 'Instakill Round Speedrun',
      items: ['Instakill Round Speedrun: Rules coming soon. (Available on Blood of the Dead, Dead of the Night, Ancient Evil, Tag der Toten.)'],
    },
    {
      title: 'No Downs',
      items: [
        'Reach the highest round you can without a player going down.',
        'Game must be played on Normal difficulty. Custom Mutations are not allowed.',
        'Every round must be played in full.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'No Perks',
      items: [
        'Reach the highest round that you can without using any perks.',
        'Game must be played without using any Elixirs or Talismans (or Classic/All variants per category).',
        'Game must be played on normal difficulty. Custom Mutations are not allowed.',
        'Every round must be played in full. Multi-pov is required for co-op.',
      ],
    },
    {
      title: 'No Power',
      items: [
        'Reach the highest round possible without turning on the power switch.',
        'Every round must be played in full.',
        'Traps are NOT ALLOWED.',
        'Shield Exploit is NOT ALLOWED in NORMAL DIFFICULTY.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room',
      items: [
        'Reach the highest round you can without opening any doors or barriers.',
        'Game must be played on Normal difficulty. Custom Mutations are not allowed.',
        'Gaining immunity against fire is ALLOWED.',
      ],
    },
    {
      title: 'One Box Challenge',
      items: [
        'Reach the highest round possible by hitting the box one time per player.',
        'Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED.',
        'Buying nades off the wall is NOT ALLOWED. Traps are NOT ALLOWED. AAT\'s are ALLOWED.',
        'Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'Pistol Only',
      items: [
        'Reach the highest round possible only using any pistol on the map.',
        'Hitting the box is ALLOWED. Pack-a-Punching is ALLOWED. AAT\'s are NOT ALLOWED.',
        'Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED.',
        'Traps are NOT ALLOWED. Multi-pov is required for co-ops.',
      ],
    },
  ],
  challengeRules: [
    { name: 'No Downs', desc: 'Reach the highest round possible without a player going down. Every round must be played in full.' },
    { name: 'No Perks', desc: 'Reach the highest round you can without using perks. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.' },
    { name: 'No Power', desc: 'Reach the highest round possible without turning on power. Every round must be played in full. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED.' },
    { name: 'First Room', desc: 'Reach the highest round possible without opening any doors or barriers. Rules vary by elixir mode. Gaining immunity against fire is ALLOWED.' },
    { name: 'No Pack-a-Punch', desc: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED.' },
    { name: 'One Box Challenge', desc: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. AAT\'s are ALLOWED. Traps are NOT ALLOWED.' },
    { name: 'Pistol Only', desc: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Traps are NOT ALLOWED. Pack-a-Punching is ALLOWED. AAT\'s are NOT ALLOWED.' },
    { name: 'Purist', desc: 'Purist: Rules coming soon.' },
    { name: 'Rush', desc: 'Rush: Rules coming soon.' },
    { name: 'Instakill Round Speedrun', desc: 'Instakill Round Speedrun: Rules coming soon.' },
  ],
};
