import type { RuleItem } from '@/lib/rules/types';

/**
 * Official rules for World at War Zombies leaderboard submissions.
 * Displayed in the Official Rules modal on map edit pages.
 */

export const WAW_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'Patches & Platform',
      items: [
        'Verified Patches ARE ALLOWED',
        { parts: ['A community patch for Plutonium can be found ', { text: 'here', href: 'https://gitlab.com/EvelynYuki/WAW-Community-Patch/' }, '.'] },
        'Please ensure you are on v2.0+ as this version will auto-enable the required commands "cg_flashScriptHashes 1" and "cg_drawIdentifier 1"',
        { parts: ['A community patch for EE Speedruns can be found ', { text: 'here', href: 'https://gitlab.com/EvelynYuki/WAW-EE-Timer' }, '.'] },
        'Playing on Plutonium is ALLOWED',
        'Submissions must show the following:',
        'For solo, "cg_flashScriptHashes 1" must be set at least at the start of each match. For co-op, only the host must do this.',
        'For solo and co-op alike, "cg_drawIdentifier 1" is required during the entirety of the game.',
      ],
    },
    {
      title: 'General',
      items: [
        'Campaign difficulty MUST be set to Regular.',
        'Full gameplay is required.',
      ],
    },
    {
      title: 'Allowed',
      items: [
        'An automatic indicator for insta-kill rounds is ALLOWED only for Nacht der Untoten and Verruckt.',
        'Automatic timers are ALLOWED.',
        { parts: ['Bypassing the 25-day freeze/error is ALLOWED only via the BIOS. Any other method is NOT ALLOWED. See ', { text: 'here', href: 'https://zwr.gg/wiki/how-to-bypass-the-25-day-freeze-black-screen' }, ' for methods.'] },
        'Camos and Textures are ALLOWED.',
        'Co-op Split Screen is ALLOWED.',
        'Disconnecting and reconnecting in co-op is ALLOWED.',
        'Fast knife exploit is ALLOWED.',
        'Fixed Backspeed is ALLOWED for ALL categories, including First Room.',
        'FOV changes are ALLOWED (cap of 120 FOV).',
        'FPS changes are ALLOWED (cap of 250 FPS).',
        'Removing the stun by damaging yourself with a grenade is ALLOWED.',
        'Perk animation canceling is ALLOWED as long as ONE full perk animation is shown.',
        'Players MUST show their reset screen if reached.',
        'Plutonium is ALLOWED.',
        'Solo-op is ALLOWED. This includes using bots as players.',
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'An automatic "end of spawns" indicator (shows when zombies are done spawning for the round) is NOT ALLOWED.',
        'Automatic trap timer is NOT ALLOWED.',
        'Config changes are NOT ALLOWED except for FOV, FPS, Fast Restart bind, Hostname, and HUD graphic changes.',
        'Custom Corpses are NOT ALLOWED.',
        'Duplication of weapons is NOT ALLOWED.',
        'Fast Ray is NOT ALLOWED.',
        'Fog removal is NOT ALLOWED.',
        'Patches are NOT ALLOWED with the exception of verified patches.',
        'Pre-patch flamethrower is NOT ALLOWED except in the Pre-Patch category.',
        'Removal of foliage, smoke effect, and flames is NOT ALLOWED with the exception of foliage removal using grenades.',
        'Transparent and high visibility textures (i.e., pink zombies) are NOT ALLOWED.',
        'Virtual Machines and Emulators are NOT ALLOWED.',
        'Zombie Counter is NOT ALLOWED.',
        'Leaving and rejoining after dying to disable "ghost spawns" is NOT ALLOWED.',
      ],
    },
  ],
  challengeRules: [
    {
      name: 'No Downs',
      desc: 'Reach the highest round possible without a player going down. Every round must be played in full.',
    },
    {
      name: 'No Perks',
      desc: 'Reach the highest round you can without using perks. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    },
    {
      name: 'No Pack-a-Punch',
      desc: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    },
    {
      name: 'First Room',
      desc: 'Reach the highest round possible without opening any doors. Fixed backspeed is ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
    },
    {
      name: 'One Box Challenge',
      desc: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. If you get a wall weapon out of the box purchasing ammo off the wall is ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
    },
    {
      name: 'Pistol Only',
      desc: 'Reach the highest round possible only using your any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Using the Ray Gun is NOT ALLOWED. Pack-a-Punching is ALLOWED. Buying nades off the wall is NOT ALLOWED.',
    },
    {
      name: 'No Power',
      desc: 'Reach the highest round possible without turning on power. Every round must be played in full. Glitches or Exploits are NOT ALLOWED.',
    },
  ],
};
