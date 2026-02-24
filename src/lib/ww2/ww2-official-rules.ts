/**
 * WW2 Zombies official rules (Prologue / The Final Reich / Groesten Haus / etc.).
 * See Home Page RULES for full details.
 */

export const WW2_OFFICIAL_RULES = {
  generalRules: [
    {
      title: 'General',
      items: [
        'Each gameplay/submission is only to be accepted into 1 category: With Consumables OR No Consumables.',
        'The start position for speedruns is when "Wave 1" appears on screen, except on The Darkest Shore (when screen fades in).',
        'Sleeper spots/strategies are ALLOWED for co-op. Players are NOT ALLOWED to kill zombies during this time.',
        'Fast Restarts are ALLOWED.',
      ],
    },
    {
      title: 'Not Allowed',
      items: [
        'Abusing insta-kill melee weapons (e.g. locking a melee key and going AFK for hours) is NOT ALLOWED.',
        'Any gameplay from Prologue is NOT ALLOWED on Groesten Haus leaderboards and vice versa.',
        'Fast Melee is NOT ALLOWED.',
        'Lowering the anchors on The Shadowed Throne through an out-of-bounds glitch is NOT ALLOWED.',
        'Players intentionally downing themselves to create a barrier that stops zombies from entering certain areas is NOT ALLOWED.',
        'Playing a 2-player co-op game by yourself is NOT ALLOWED.',
      ],
    },
    {
      title: 'Video Requirements',
      items: [
        'Full gameplay is required.',
        'Twitch: Make sure your footage is highlighted (past broadcasts will not be accepted).',
        'YouTube: Make sure your video is public or unlisted.',
      ],
    },
  ],
  challengeRulesByType: {
    HIGHEST_ROUND: 'Reach the highest round you can. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    NO_DOWNS: 'Reach the highest round possible without going down. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    ROUND_10_SPEEDRUN: 'Reach round 10 as fast as possible. Start when Wave 1 appears (except Darkest Shore: screen fade-in).',
    ROUND_30_SPEEDRUN: 'Reach round 30 as fast as possible. Start when Wave 1 appears (except Darkest Shore: screen fade-in).',
    ROUND_50_SPEEDRUN: 'Reach round 50 as fast as possible.',
    ROUND_70_SPEEDRUN: 'Reach round 70 as fast as possible.',
    ROUND_100_SPEEDRUN: 'Reach round 100 as fast as possible.',
    ROUND_200_SPEEDRUN: 'Reach round 200 as fast as possible.',
    SUPER_30_SPEEDRUN: 'Multi-map run: Final Reich → Groesten Haus → Darkest Shore → Shadowed Throne → Frozen Dawn. Reach Wave 30 on each map. No consumables allowed. Timer pauses after each Wave 30; unpauses when Wave 1 appears. See Home Page for full Super 30 rules.',
    EASTER_EGG_SPEEDRUN: 'Complete the main Easter Egg as fast as possible. Every round must be played in full. Glitches or exploits are NOT ALLOWED.',
    STARTING_ROOM: 'Stay in the starting room only. Every round must be played in full.',
    NO_POWER: 'Never turn on power. Every round must be played in full.',
    NO_ARMOR: 'Complete without purchasing armor. Every round must be played in full.',
    NO_BLITZ: 'Complete without purchasing any Blitz (perks). Every round must be played in full.',
  },
};
