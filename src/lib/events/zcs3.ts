/** ZCS-3: Shattered Universe — shared event constants */

export const ZCS3_SLUG = 'zcs3';

export const ZCS3_TWITCH_CHANNEL = 'xdflamer99';
export const ZCS3_TWITCH_URL = `https://www.twitch.tv/${ZCS3_TWITCH_CHANNEL}`;

/** Enlistment Google Form (resolved from t.co short link). */
export const ZCS3_ENLIST_URL = 'https://forms.gle/Jk9joq35QAdQ1yjs5';

export const ZCS3_REVEAL_TWEET_URL = 'https://x.com/XDflamer99/status/2081177910841352642';

export const ZCS3_CHARITY_NAME = 'Gamers Outreach';
export const ZCS3_CHARITY_TAGLINE = 'Helping others level up.';
export const ZCS3_CHARITY_URL = 'https://gamersoutreach.org/';

export const ZCS3_LOGO_PATH = '/images/events/zcs3-shattered-universe.png';

/**
 * Homepage media block: "video" = announcement YouTube, "stream" = Twitch live cast.
 * Flip to "stream" closer to event day to restore the embed.
 */
export type Zcs3MediaMode = 'video' | 'stream';
export const ZCS3_MEDIA_MODE: Zcs3MediaMode = 'video';

export const ZCS3_ANNOUNCEMENT_YOUTUBE_ID = 'jJ03n7xs7OM';
export const ZCS3_ANNOUNCEMENT_YOUTUBE_URL = `https://www.youtube.com/watch?v=${ZCS3_ANNOUNCEMENT_YOUTUBE_ID}`;

export type Zcs3ChallengeMap = {
  map: string;
  title: string;
  rules: string;
};

export type Zcs3ChallengeSlide = {
  id: string;
  label: string;
  shortLabel: string;
  src: string;
  maps: Zcs3ChallengeMap[];
};

/** Games featured on challenge reveal art. Default selection is BO3 (see DEFAULT_INDEX). */
export const ZCS3_CHALLENGE_SLIDES: Zcs3ChallengeSlide[] = [
  {
    id: 'bo2',
    label: 'Black Ops 2',
    shortLabel: 'BO2',
    src: '/images/events/zcs3-challenges/bo2.png',
    maps: [
      {
        map: 'Tranzit',
        title: 'Full Loadout Challenge',
        rules:
          'All players must speedrun their own 4 perks and 2 Pack-a-Punched weapons. No bank or fridge.',
      },
      {
        map: 'Mob of the Dead',
        title: 'Main Quest Speedrun',
        rules: 'Beat the main quest as fast as possible.',
      },
      {
        map: 'Buried',
        title: 'Round 25 Speedrun',
        rules: 'Reach round 25 without using the bank or fridge.',
      },
    ],
  },
  {
    id: 'bo3',
    label: 'Black Ops 3',
    shortLabel: 'BO3',
    src: '/images/events/zcs3-challenges/bo3.png',
    maps: [
      {
        map: 'Shadows of Evil',
        title: 'Round 25 Speedrun',
        rules: 'Finish round 25 as fast as possible. Classic / Whimsical GobbleGums only.',
      },
      {
        map: 'Zetsubou No Shima',
        title: 'Main Quest Speedrun',
        rules:
          'Finish the main quest as fast as possible. Banned GobbleGums: Round Robbin, Power Vacuum, Flavour Hexed.',
      },
      {
        map: 'Moon',
        title: 'The Moon Gauntlet',
        rules:
          "Complete Samantha's Hide and Seek EE, the Space Dog EE, and Richtofen's Grand Scheme EE. Banned GobbleGums: Round Robbin, Power Vacuum, Flavour Hexed.",
      },
      {
        map: 'Origins',
        title: 'Remember Forever Challenge',
        rules:
          'All upgraded staffs. Grab perks only in the way of a rainbow. Iron Fist, golden shovel / golden helmet, free Pack-a-Punched MG08. Finish in the Crazy Place with the Samantha doll EE. No GobbleGums allowed.',
      },
    ],
  },
  {
    id: 'iw',
    label: 'Infinite Warfare',
    shortLabel: 'IW',
    src: '/images/events/zcs3-challenges/iw.png',
    maps: [
      {
        map: 'Rave in the Redwoods',
        title: 'Memory Charm Speedrun',
        rules:
          'Collect all memory charms. No Director\'s Cut mode. Fate Cards only.',
      },
      {
        map: 'Beast from Beyond',
        title: 'Mammoth and Mephistopheles',
        rules:
          'Beat both bosses as fast as possible. Director\'s Cut and Fate / Fortune Cards allowed.',
      },
    ],
  },
  {
    id: 'ww2',
    label: 'WW2',
    shortLabel: 'WW2',
    src: '/images/events/zcs3-challenges/ww2.png',
    maps: [
      {
        map: 'The Final Reich',
        title: 'Casual Main Quest Speedrun',
        rules:
          'Beat the Panzermörder as fast as possible. Consumables and loadouts allowed.',
      },
      {
        map: 'The Darkest Shore',
        title: 'Round 25 Speedrun',
        rules: 'Finish round 25 as fast as possible. No consumables. All loadouts allowed.',
      },
      {
        map: 'The Frozen Dawn',
        title: 'Main Quest Speedrun',
        rules: 'Beat the God King as fast as possible. No consumables. All loadouts allowed.',
      },
    ],
  },
];

/** Index of Black Ops 3 in ZCS3_CHALLENGE_SLIDES (default on page load). */
export const ZCS3_CHALLENGE_DEFAULT_INDEX = ZCS3_CHALLENGE_SLIDES.findIndex((s) => s.id === 'bo3');

export const ZCS3_GAMES = [
  'Black Ops 2',
  'Black Ops 3',
  'Infinite Warfare',
  'WW2',
] as const;
