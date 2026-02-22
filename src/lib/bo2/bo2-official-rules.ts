import type { RuleItem } from '@/lib/rules/types';

const T6_EE_TIMER = 'https://github.com/HuthTV/T6-EE-Timer';
const BO2EESR_RESOURCES = 'https://github.com/VincentFarris/BO2EESR_Resources';
const FIRST_ROOM_VOTE = 'https://docs.google.com/spreadsheets/d/1kt0iidCuWV-LuSLUY9nHPH_hTt7sGhCU-KSucIs_zIc/edit#gid=815385145';
const T6_FIRST_ROOM_FIX = 'https://github.com/Zi0MIX/T6-FIRST-ROOM-FIX/releases';
const T6_B2OP_PATCH = 'https://github.com/Zi0MIX/T6-B2OP-PATCH/releases';

/** Reusable disclaimer for First Room maps: only "here" (x2) are clickable */
const FIRST_ROOM_DISCLAIMER: RuleItem = {
  parts: [
    'DISCLAIMER: The game client Plutonium has fixed backspeed by default. As per the recent vote of the First Room community seen ',
    { text: 'here', href: FIRST_ROOM_VOTE },
    '; this is NOT ALLOWED. Please either refer to the patch created by Zi0 ',
    { text: 'here', href: T6_FIRST_ROOM_FIX },
    '; or use an alternative client such as Redacted.',
  ],
};

/** Reusable for No Power maps: "here" links to B2OP patch */
const NO_POWER_PATCH: RuleItem = {
  parts: [
    'For those unaware or new to the game, a patch is required for PC to ensure the buildables/traps work past R156/R159. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ',
    { text: 'here', href: T6_B2OP_PATCH },
    '.',
  ],
};

export const BO2_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'Plutonium EE Speedrun Requirements',
      items: [
        'All BO2 Easter Egg Speedrun submissions played on the Plutonium client must follow these requirements (all current submissions will be grandfathered in and remain on the leaderboards):',
        'A velocity meter (via LiveSplit or script) is required for any top 10 solo submission',
        'cg_flashscripthashes must be set to 1. Only the host needs to do this on coop submissions',
        'cg_drawidentifier must be set to 1, and must be shown for the entire game',
        'Upon a top five run completion, the player/host should run the command flashscripthashes 1 (Huth\'s EE speedrunning timer script will automatically do this for you. It is NOT required that you use this, but highly suggested.)',
      ],
    },
    {
      title: 'Player Config',
      items: [
        'If a player wishes to play on an FOV value higher than 90, that player MUST use a script to cap the zombie despawning function to 90 FOV.',
        'Graphic content must be ENABLED',
      ],
    },
    {
      title: 'Scripts',
      items: [
        'Using a script to modify your movement speed values (backspeed patch) is NOT ALLOWED',
        'Using a script to prevent players from being pushed off the tank treads on Origins is NOT ALLOWED',
        'Any script used in a submission that is NOT found on the BO2 EE Speedrun verified scripts list must be sent to ZWR staff as a part of the submission before it can be approved.',
      ],
    },
    {
      title: 'Custom Textures',
      items: [
        'HUD texture changes are still allowed, however, you may only change perk and powerup icons, but they must keep the original shape (you can change the color of existing pixels, but you cannot add or remove any).',
      ],
    },
    {
      title: 'Verified EE Patches',
      items: [
        { parts: ['T6-EE-Timer by Huth can be found ', { text: 'here', href: T6_EE_TIMER }, ' and has most of the script functionality built in.'] },
        { parts: ['Separate scripts can be found ', { text: 'here', href: BO2EESR_RESOURCES }, '.'] },
      ],
    },
    {
      title: 'Custom Games',
      items: [
        'The settings on "Custom Games" MUST NOT be changed unless the rules on the specific board say otherwise.',
        'Default custom options - Difficulty: Original | Starting Round: 1 | Magic: Enabled | Headshots Only: Disabled | Hellhounds: Disabled',
      ],
    },
    {
      title: 'Disclaimer',
      items: [
        'Modifying/altering special rounds, or patching the box to always give you a certain gun until a certain round is NOT ALLOWED. Players caught doing this will result in all solo games, and any hosted co-op games removed from their profile and they will be provided with the convicted cheater role.',
      ],
    },
    {
      title: 'Allowed',
      items: [
        'Automatic Equipment Counter is ALLOWED (i.e., Turbines, Trample Steams, etc).',
        'Bank is ALLOWED (with the exception of specific Easter Egg speedrun leaderboards).',
        'Changing FOV is ALLOWED (up to 120 FOV).',
        'Changing FPS is ALLOWED (Any FPS allowed EXCEPT EE Speedruns 250 MAX).',
        'Co-op splitscreen is ALLOWED.',
        'First Box patch is ALLOWED for ROUND SPEEDRUNS ONLY.',
        'Fixed Backspeed is ALLOWED (with the exception of First Rooms - community voted).',
        'In-game timers and round timers are ALLOWED.',
        'Jetgun and Trap fix is ALLOWED.',
        'Perma-Perks patch is ALLOWED in local play.',
        'Perma-Perks are ALLOWED (with the exception of disconnecting and reconnecting in co-ops - see below).',
        'Playing solo in a co-op game is ALLOWED.',
        'Raygun wall-buy is ALLOWED ONLY FOR EASTER EGG SPEEDRUNS AND BURIED FIRST ROOM (community voted).',
        'Redacted, Redacted Nightly, and Plutonium (Ancient and Current) are ALLOWED.',
        'Reset Trackers are ALLOWED.',
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'Any commands that require sv_cheats 1 is NOT ALLOWED.',
        'Automatic trap timer is NOT ALLOWED.',
        'Bypassing the 25-day freeze/error is NOT ALLOWED.',
        'Custom corpse count is NOT ALLOWED.',
        'Fast Ray is NOT ALLOWED.',
        'God Mode for sleepers is NOT ALLOWED.',
        'Health Bar is NOT ALLOWED.',
        'High Contrast Camos (example: white, green, pink, purple.. zombies to allow for better visibility) are NOT ALLOWED.',
        'No Fog is NOT ALLOWED.',
        'Players are NOT ALLOWED to manipulate the following by disconnecting and reconnecting in co-ops:',
        'You are NOT ALLOWED to gain perma-perks back after R15 (as you will have perma-jug permanently despite downing).',
        'You are NOT ALLOWED to change the weapon in the fridge OR get more ammo each round after disconnecting.',
        'You are NOT ALLOWED to disconnect to change how the game runs, i.e., removing the QR elevator permanently, disabling QR on Die Rise, or retrieving the Acid Gat to ensure fewer entities.',
        'Substituting a player during a co-op is NOT ALLOWED.',
        'Transparent textures are NOT ALLOWED.',
        'Virtual Machines and Emulators are NOT ALLOWED.',
        'Zombie Counter is NOT ALLOWED.',
        'Theatre mods are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room General Rules',
      items: [
        'Fixed Backspeed is NOT ALLOWED.',
        'Fast Ray is NOT ALLOWED.',
        'Fast Nades are NOT ALLOWED.',
        'Raygun wall-buy is NOT ALLOWED with the exception of Buried.',
        'RNG Manipulation is NOT ALLOWED.',
        'Use of the LSAT is NOT ALLOWED.',
        'Use of the Turbine is NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Tranzit',
      items: [
        'Reach the highest round you can without opening doors or barriers. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'The Spawn Control strategy is NOT ALLOWED.',
        'Use of the Raygun wallbuy is NOT ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Bus Depot',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Playing with DEFAULT settings is ALLOWED.',
        'Starting on Round 10 is ALLOWED.',
        'Hellhounds enabled is NOT ALLOWED.',
        'The Spawn Control strategy is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Town Normal',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Hellhounds enabled is ALLOWED.',
        'Playing with DEFAULT settings is ALLOWED.',
        'Starting on Round 10 is ALLOWED.',
        'First Box patch is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Town Semtex Area',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Starting on Round 10 is REQUIRED.',
        'Magic MUST be DISABLED.',
        'Players MUST stay at the Olympia area at all times.',
        'Changing custom game settings other than what is listed above is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Farm Without Box',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Hellhounds enabled is ALLOWED.',
        'Playing with DEFAULT settings is ALLOWED.',
        'Starting on Round 10 is ALLOWED.',
        'Hitting the Mystery Box is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Farm With Box',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Hellhounds enabled is ALLOWED.',
        'Playing with DEFAULT settings is ALLOWED.',
        'Starting on Round 10 is ALLOWED.',
        'Hitting the Mystery Box is ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Nuketown',
      items: [
        'Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Hellhounds enabled is ALLOWED.',
        'Playing with DEFAULT settings is ALLOWED.',
        'Starting on Round 10 is ALLOWED.',
        'Buying Juggernog is NOT ALLOWED.',
        'Patching perk locations is NOT ALLOWED.',
        'Spawn control strategy is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Die Rise',
      items: [
        'Reach the highest round you can without opening doors or barriers. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Changing custom game settings is NOT ALLOWED.',
        'Patching the order of your perks is NOT ALLOWED.',
        'Use of the Raygun wallbuy is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Mob of the Dead',
      items: [
        'Reach the highest round you can without opening doors or barriers. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Cancelling the M14 spawn is ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Buried Processing',
      items: [
        'Reach the highest round you can without opening doors or barriers. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Changing custom game settings is NOT ALLOWED.',
        'Players are NOT ALLOWED to fall through the floor.',
        'Use of the Raygun wallbuy is NOT ALLOWED.',
        'Using the LSAT is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Buried Quick Side',
      items: [
        'No doors or barriers are allowed to be opened. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Players MUST fall through the floor by Round 5.',
        'Changing custom game settings is NOT ALLOWED.',
        'Use of the Raygun wallbuy is NOT ALLOWED.',
        'Using the LSAT is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'First Room - Origins',
      items: [
        'Reach the highest round you can without opening doors or barriers. Every round must be played in full.',
        FIRST_ROOM_DISCLAIMER,
        'Getting weapons back after reconnecting whenever it is available is ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Getting Double Tap back after reconnecting is NOT ALLOWED.',
        'Patching weapons from the reward box is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
        'Blocking spawns using generator 1 strategy is NOT ALLOWED.',
      ],
    },
    {
      title: 'No Power - Tranzit',
      items: [
        'Reach the highest round you can without turning the power on. Every round must be played in full.',
        { parts: ['For those unaware or new to the game, a patch is required for PC to ensure the Jetgun works past R156. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ', { text: 'here', href: T6_B2OP_PATCH }, '.'] },
        'The Jetgun fix is ALLOWED and REQUIRED for PC players if they want to advance past R156.',
        'Infinite Jetgun is ALLOWED.',
        'Using the Jet Gun ammo counter is ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Unlimited turbine and trap is NOT ALLOWED.',
        'Use of a First Box patch is NOT ALLOWED.',
        'Using the Turbine as a form of power is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'No Power - Die Rise',
      items: [
        'Reach the highest round you can without turning the power on. Every round must be played in full.',
        { parts: ['For those unaware or new to the game, a patch is required for PC to ensure the buildables work past R159. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ', { text: 'here', href: T6_B2OP_PATCH }, '.'] },
        'The buildable fix is ALLOWED and REQUIRED for PC players if they want to advance past R159.',
        'Manipulating the Spawn Elevator (using the Trample Steam to send the Elevator down) is ALLOWED.',
        'One Window Strategy is ALLOWED.',
        'Players are ALLOWED to use Jumping Jacks to take a break in co-op.',
        'Players are ALLOWED to use the "Elevator Glitch" to travel around the map for SOLO ONLY.',
        'Unpatching the Sliquifier is ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Manipulating the Elevator\'s Position (QR elevator) in co-op is NOT ALLOWED.',
        'Use of a First Box patch is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'No Power - Mob of the Dead',
      items: [
        'Reach the highest round you can without using afterlife to activate power. Every round must be played in full.',
        { parts: ['For those unaware or new to the game, a patch is required for PC to ensure the traps work past R159. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ', { text: 'here', href: T6_B2OP_PATCH }, '.'] },
        'The trap fix is ALLOWED and REQUIRED for PC players if they want to advance past R159.',
        'Duplicating Brutus is an unknown glitch that can happen at any time for any reason, therefore it is ALLOWED.',
        'One Bullet Trick with the Acid Gat is ALLOWED.',
        'Players are ALLOWED to use an Out of Bounds (OoB) glitch to take a break in co-op.',
        'Use of a patch to guarantee the Key and Box spawn at the Cafeteria is ALLOWED.',
        'Use of the Free Door glitch is ALLOWED.',
        'Playing a Custom Game in Solo is NOT ALLOWED.',
        'Use of a First Box patch is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'No Power - Buried',
      items: [
        'Reach the highest round you can without turning the power on AND without using the turbines. Every round must be played in full.',
        { parts: ['For those unaware or new to the game, a patch is required for PC to ensure the buildables work past R159. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ', { text: 'here', href: T6_B2OP_PATCH }, '.'] },
        'The buildable fix is ALLOWED and REQUIRED for PC players if they want to advance past R159.',
        'Players are ALLOWED to use the Tree Glitch to take a break in co-op.',
        'Using the Tombstone perma-perk to activate perks is ALLOWED.',
        'Changing custom game settings is NOT ALLOWED.',
        'Duplicating the Paralyzer in co-op is NOT ALLOWED.',
        'Use of a First Box patch is NOT ALLOWED.',
        'Using Leroy to remove the cooldown and keep a powerup on the map is NOT ALLOWED.',
        'Using the Witches to remove the cooldown and keep a powerup on the map is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
      ],
    },
    {
      title: 'No Power - Origins',
      items: [
        'Reach the highest round you can without using the generators to activate power. Every round must be played in full.',
        { parts: ['For those unaware or new to the game, a patch is required for PC to ensure the buildables work past R159. Zi0 created an official patch which provides players with a safe and rule-compliant patch for future submissions. The patch can be downloaded ', { text: 'here', href: T6_B2OP_PATCH }, '.'] },
        'Disconnecting and reconnecting in co-op and getting the rewards from the chest is NOT ALLOWED.',
        'Duplicating staffs is NOT ALLOWED.',
        'Elemental Knife exploit is NOT ALLOWED.',
        'Getting 3 drops from 3 panzers is NOT ALLOWED.',
        'Playing a Custom Game for Solo to get 3 panzers instead of 1 is NOT ALLOWED.',
        'Use of a First Box patch is NOT ALLOWED.',
        'Glitches or Exploits are NOT ALLOWED.',
        'Blocking spawns using generator 1 strategy is NOT ALLOWED.',
      ],
    },
  ],
  challengeRules: [
    { name: 'No Downs', desc: 'Reach the highest round possible without a player going down. Every round must be played in full.' },
    { name: 'No Perks', desc: 'Reach the highest round you can without using perks. Every round must be played in full. Perma Perks are ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.' },
    { name: 'No Pack-a-Punch', desc: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Use of buildables on any map is NOT ALLOWED including staffs. Generator Despawn strat with the generators on Origins is NOT ALLOWED. Gen strat and traps are NOT ALLOWED. Multi-pov is required for co-op.' },
    { name: 'One Box Challenge', desc: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. The use of buildables is NOT ALLOWED including staffs. Generator Despawn strat with the generators on Origins is NOT ALLOWED. Gen strat and traps are NOT ALLOWED. Buying nades off the wall is NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.' },
    { name: 'Pistol Only', desc: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED. The use of buildables is NOT ALLOWED including staffs. Generator Despawn strat with the generators on Origins is NOT ALLOWED. Gen strat and traps are NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.' },
  ],
};
