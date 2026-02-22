/**
 * Speedrun achievement tiers per map. Fastest time = most XP, slower = less XP.
 * Each tier: { maxTimeSeconds, xpReward }. User qualifies if they have a run with completionTimeSeconds <= maxTimeSeconds.
 * World records (solo) used as reference; tiers are spread so best tier is ~at or just above WR.
 *
 * For each new IW map: add a SPEEDRUN_TIERS constant here and extend getSpeedrunAchievementDefinitions()
 * in seed-achievements.ts to return tiers for that map.
 */

export type SpeedrunTier = { maxTimeSeconds: number; xpReward: number };

export type SpeedrunTiersByType = Record<string, SpeedrunTier[]>;

/**
 * Zombies in Spaceland (IW) – WRs: R30 27:18, R50 1:02:45, R70 2:17:18, R100 5:48:59, EE 13:34, G&S 24:54, Aliens 28s.
 * Round 50/70/100 fastest tiers give significantly more XP than Round 30. EE speedrun > main EE (2500). G&S fastest = 3k, Boss a bit more.
 */
export const IW_ZIS_SPEEDRUN_TIERS: SpeedrunTiersByType = {
  ROUND_30_SPEEDRUN: [
    { maxTimeSeconds: 2400, xpReward: 50 },   // 40 min
    { maxTimeSeconds: 2100, xpReward: 125 },  // 35 min
    { maxTimeSeconds: 1800, xpReward: 250 }, // 30 min
    { maxTimeSeconds: 1680, xpReward: 500 }, // 28 min (near WR 27:18)
  ],
  ROUND_50_SPEEDRUN: [
    { maxTimeSeconds: 4500, xpReward: 100 },   // 1:15
    { maxTimeSeconds: 4200, xpReward: 250 },   // 1:10
    { maxTimeSeconds: 3900, xpReward: 500 },   // 1:05
    { maxTimeSeconds: 3780, xpReward: 1200 },  // 1:03 (near WR 1:02:45) – way more than R30
  ],
  ROUND_70_SPEEDRUN: [
    { maxTimeSeconds: 9000, xpReward: 150 },   // 2:30
    { maxTimeSeconds: 8400, xpReward: 400 },   // 2:20
    { maxTimeSeconds: 8300, xpReward: 800 },   // 2:18:20
    { maxTimeSeconds: 8250, xpReward: 2000 }, // near WR 2:17:18 – significantly more than R30/R50
  ],
  ROUND_100_SPEEDRUN: [
    { maxTimeSeconds: 22200, xpReward: 200 },  // 6:10
    { maxTimeSeconds: 21300, xpReward: 500 },  // 5:55
    { maxTimeSeconds: 21000, xpReward: 1200 }, // 5:50
    { maxTimeSeconds: 20960, xpReward: 3000 }, // near WR 5:48:59 – highest round tier
  ],
  EASTER_EGG_SPEEDRUN: [
    { maxTimeSeconds: 1200, xpReward: 200 },   // 20 min
    { maxTimeSeconds: 1000, xpReward: 600 },   // 16:40
    { maxTimeSeconds: 900, xpReward: 1500 },   // 15 min
    { maxTimeSeconds: 850, xpReward: 3200 },   // near WR 13:34 – more than main EE (2500)
  ],
  GHOST_AND_SKULLS: [
    { maxTimeSeconds: 2100, xpReward: 150 },   // 35 min
    { maxTimeSeconds: 1800, xpReward: 500 },   // 30 min
    { maxTimeSeconds: 1600, xpReward: 1200 },  // 26:40
    { maxTimeSeconds: 1520, xpReward: 3000 },  // near WR 24:54 – fastest = 3k XP
  ],
  ALIENS_BOSS_FIGHT: [
    { maxTimeSeconds: 60, xpReward: 200 },    // 1 min
    { maxTimeSeconds: 45, xpReward: 600 },    // 45s
    { maxTimeSeconds: 35, xpReward: 1400 },   // 35s
    { maxTimeSeconds: 30, xpReward: 3500 },   // near WR 28s – a bit more than G&S
  ],
};

/**
 * Rave in the Redwoods (IW) – WRs: R30 25:57, R50 56:35, R70 1:52:19, R100 4:21:30, EE (Locksmith) 17:16, G&S 14:20, Boss (Slasher) 7:14.
 */
export const IW_RAVE_SPEEDRUN_TIERS: SpeedrunTiersByType = {
  ROUND_30_SPEEDRUN: [
    { maxTimeSeconds: 2100, xpReward: 50 },   // 35 min
    { maxTimeSeconds: 1800, xpReward: 125 },  // 30 min
    { maxTimeSeconds: 1650, xpReward: 250 },  // 27:30
    { maxTimeSeconds: 1580, xpReward: 500 },  // near WR 25:57
  ],
  ROUND_50_SPEEDRUN: [
    { maxTimeSeconds: 3900, xpReward: 100 },   // 1:05
    { maxTimeSeconds: 3600, xpReward: 250 },  // 1:00
    { maxTimeSeconds: 3480, xpReward: 500 },  // 58 min
    { maxTimeSeconds: 3420, xpReward: 1200 }, // near WR 56:35
  ],
  ROUND_70_SPEEDRUN: [
    { maxTimeSeconds: 7200, xpReward: 150 },   // 2:00
    { maxTimeSeconds: 6900, xpReward: 400 },   // 1:55
    { maxTimeSeconds: 6800, xpReward: 800 },  // 1:53:20
    { maxTimeSeconds: 6760, xpReward: 2000 }, // near WR 1:52:19
  ],
  ROUND_100_SPEEDRUN: [
    { maxTimeSeconds: 16200, xpReward: 200 },  // 4:30
    { maxTimeSeconds: 15800, xpReward: 500 },  // 4:23
    { maxTimeSeconds: 15720, xpReward: 1200 }, // 4:22
    { maxTimeSeconds: 15690, xpReward: 3000 }, // WR 4:21:30
  ],
  EASTER_EGG_SPEEDRUN: [
    { maxTimeSeconds: 1200, xpReward: 200 },   // 20 min
    { maxTimeSeconds: 1080, xpReward: 600 },   // 18 min
    { maxTimeSeconds: 1050, xpReward: 1500 }, // 17:30
    { maxTimeSeconds: 1040, xpReward: 3200 }, // near WR 17:16 (Locksmith)
  ],
  GHOST_AND_SKULLS: [
    { maxTimeSeconds: 1200, xpReward: 150 },   // 20 min
    { maxTimeSeconds: 900, xpReward: 500 },   // 15 min
    { maxTimeSeconds: 870, xpReward: 1200 },  // 14:30
    { maxTimeSeconds: 861, xpReward: 3000 },  // near WR 14:20
  ],
  ALIENS_BOSS_FIGHT: [
    { maxTimeSeconds: 600, xpReward: 200 },   // 10 min (Slasher boss)
    { maxTimeSeconds: 540, xpReward: 600 },   // 9 min
    { maxTimeSeconds: 480, xpReward: 1400 },  // 8 min
    { maxTimeSeconds: 440, xpReward: 3500 },  // near WR 7:14
  ],
};

/**
 * Shaolin Shuffle (IW) – WRs: R30 26:54, R50 1:04:13, R70 2:14:19, R100 5:43:57, EE (Pest Control) 20:37, G&S 7:16, Boss (Rat King) 2:47.
 */
export const IW_SHAOLIN_SPEEDRUN_TIERS: SpeedrunTiersByType = {
  ROUND_30_SPEEDRUN: [
    { maxTimeSeconds: 2100, xpReward: 50 },
    { maxTimeSeconds: 1800, xpReward: 125 },
    { maxTimeSeconds: 1680, xpReward: 250 },
    { maxTimeSeconds: 1640, xpReward: 500 },  // near WR 26:54
  ],
  ROUND_50_SPEEDRUN: [
    { maxTimeSeconds: 4200, xpReward: 100 },
    { maxTimeSeconds: 3960, xpReward: 250 },
    { maxTimeSeconds: 3900, xpReward: 500 },
    { maxTimeSeconds: 3870, xpReward: 1200 }, // near WR 1:04:13
  ],
  ROUND_70_SPEEDRUN: [
    { maxTimeSeconds: 8400, xpReward: 150 },
    { maxTimeSeconds: 8160, xpReward: 400 },
    { maxTimeSeconds: 8100, xpReward: 800 },
    { maxTimeSeconds: 8070, xpReward: 2000 }, // near WR 2:14:19
  ],
  ROUND_100_SPEEDRUN: [
    { maxTimeSeconds: 21000, xpReward: 200 },
    { maxTimeSeconds: 20700, xpReward: 500 },
    { maxTimeSeconds: 20680, xpReward: 1200 },
    { maxTimeSeconds: 20637, xpReward: 3000 }, // WR 5:43:57
  ],
  EASTER_EGG_SPEEDRUN: [
    { maxTimeSeconds: 1500, xpReward: 200 },
    { maxTimeSeconds: 1320, xpReward: 600 },
    { maxTimeSeconds: 1260, xpReward: 1500 },
    { maxTimeSeconds: 1250, xpReward: 3200 }, // near WR 20:37 (Pest Control)
  ],
  GHOST_AND_SKULLS: [
    { maxTimeSeconds: 600, xpReward: 150 },
    { maxTimeSeconds: 480, xpReward: 500 },
    { maxTimeSeconds: 450, xpReward: 1200 },
    { maxTimeSeconds: 440, xpReward: 3000 },  // near WR 7:16
  ],
  ALIENS_BOSS_FIGHT: [
    { maxTimeSeconds: 240, xpReward: 200 },   // 4 min (Rat King)
    { maxTimeSeconds: 200, xpReward: 600 },
    { maxTimeSeconds: 180, xpReward: 1400 },
    { maxTimeSeconds: 170, xpReward: 3500 }, // near WR 2:47
  ],
};

/**
 * Attack of the Radioactive Thing (IW) – WRs: R30 28:29, R50 1:06:23, R70 2:11:55, R100 5:31:58, EE (Soul-Less) 13:11, G&S 18:44, Boss (Radioactive Thing) 4:13.
 */
export const IW_AOTRT_SPEEDRUN_TIERS: SpeedrunTiersByType = {
  ROUND_30_SPEEDRUN: [
    { maxTimeSeconds: 2400, xpReward: 50 },
    { maxTimeSeconds: 2100, xpReward: 125 },
    { maxTimeSeconds: 1800, xpReward: 250 },
    { maxTimeSeconds: 1730, xpReward: 500 },  // near WR 28:29
  ],
  ROUND_50_SPEEDRUN: [
    { maxTimeSeconds: 4500, xpReward: 100 },
    { maxTimeSeconds: 4200, xpReward: 250 },
    { maxTimeSeconds: 4050, xpReward: 500 },
    { maxTimeSeconds: 3990, xpReward: 1200 },  // near WR 1:06:23
  ],
  ROUND_70_SPEEDRUN: [
    { maxTimeSeconds: 9000, xpReward: 150 },
    { maxTimeSeconds: 8400, xpReward: 400 },
    { maxTimeSeconds: 7980, xpReward: 800 },
    { maxTimeSeconds: 7920, xpReward: 2000 },  // near WR 2:11:55
  ],
  ROUND_100_SPEEDRUN: [
    { maxTimeSeconds: 22200, xpReward: 200 },
    { maxTimeSeconds: 20400, xpReward: 500 },
    { maxTimeSeconds: 20000, xpReward: 1200 },
    { maxTimeSeconds: 19930, xpReward: 3000 },  // near WR 5:31:58
  ],
  EASTER_EGG_SPEEDRUN: [
    { maxTimeSeconds: 1200, xpReward: 200 },
    { maxTimeSeconds: 900, xpReward: 600 },
    { maxTimeSeconds: 840, xpReward: 1500 },
    { maxTimeSeconds: 800, xpReward: 3200 },   // near WR 13:11 (Soul-Less)
  ],
  GHOST_AND_SKULLS: [
    { maxTimeSeconds: 2400, xpReward: 150 },
    { maxTimeSeconds: 2100, xpReward: 500 },
    { maxTimeSeconds: 1200, xpReward: 1200 },
    { maxTimeSeconds: 1130, xpReward: 3000 },  // near WR 18:44
  ],
  ALIENS_BOSS_FIGHT: [
    { maxTimeSeconds: 360, xpReward: 200 },   // 6 min (Radioactive Thing)
    { maxTimeSeconds: 300, xpReward: 600 },
    { maxTimeSeconds: 270, xpReward: 1400 },
    { maxTimeSeconds: 260, xpReward: 3500 },  // near WR 4:13
  ],
};

/**
 * The Beast From Beyond (IW) – WRs: R30 30:08, R50 1:10:18, R70 3:14:17, R100 9:46:29, EE (The End?) 11:17, G&S 10:08, Cryptid Fight 6:15, Mephistopheles 9:47.
 * No Starting Room on this map.
 */
export const IW_BEAST_SPEEDRUN_TIERS: SpeedrunTiersByType = {
  ROUND_30_SPEEDRUN: [
    { maxTimeSeconds: 2400, xpReward: 50 },
    { maxTimeSeconds: 2100, xpReward: 125 },
    { maxTimeSeconds: 1920, xpReward: 250 },
    { maxTimeSeconds: 1810, xpReward: 500 },  // near WR 30:08
  ],
  ROUND_50_SPEEDRUN: [
    { maxTimeSeconds: 4500, xpReward: 100 },
    { maxTimeSeconds: 4320, xpReward: 250 },
    { maxTimeSeconds: 4260, xpReward: 500 },
    { maxTimeSeconds: 4220, xpReward: 1200 },  // near WR 1:10:18
  ],
  ROUND_70_SPEEDRUN: [
    { maxTimeSeconds: 12000, xpReward: 150 },
    { maxTimeSeconds: 11700, xpReward: 400 },
    { maxTimeSeconds: 11680, xpReward: 800 },
    { maxTimeSeconds: 11660, xpReward: 2000 },  // near WR 3:14:17
  ],
  ROUND_100_SPEEDRUN: [
    { maxTimeSeconds: 36000, xpReward: 200 },
    { maxTimeSeconds: 35400, xpReward: 500 },
    { maxTimeSeconds: 35200, xpReward: 1200 },
    { maxTimeSeconds: 35192, xpReward: 3000 },  // near WR 9:46:29
  ],
  EASTER_EGG_SPEEDRUN: [
    { maxTimeSeconds: 900, xpReward: 200 },
    { maxTimeSeconds: 750, xpReward: 600 },
    { maxTimeSeconds: 700, xpReward: 1500 },
    { maxTimeSeconds: 680, xpReward: 3200 },   // near WR 11:17 (The End?)
  ],
  GHOST_AND_SKULLS: [
    { maxTimeSeconds: 900, xpReward: 150 },
    { maxTimeSeconds: 700, xpReward: 500 },
    { maxTimeSeconds: 630, xpReward: 1200 },
    { maxTimeSeconds: 610, xpReward: 3000 },   // near WR 10:08
  ],
  CRYPTID_FIGHT: [
    { maxTimeSeconds: 480, xpReward: 200 },   // 8 min
    { maxTimeSeconds: 420, xpReward: 600 },
    { maxTimeSeconds: 390, xpReward: 1400 },
    { maxTimeSeconds: 376, xpReward: 3500 },   // near WR 6:15
  ],
  MEPHISTOPHELES: [
    { maxTimeSeconds: 720, xpReward: 200 },   // 12 min
    { maxTimeSeconds: 630, xpReward: 600 },
    { maxTimeSeconds: 600, xpReward: 1400 },
    { maxTimeSeconds: 588, xpReward: 3500 },   // near WR 9:47
  ],
};

/** WAW speedrun tiers per map — WR-based, 4 tiers each */
export const WAW_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'nacht-der-untoten': buildWaWSpeedrunTiers(28 * 60 + 38, 46 * 60 + 12, 70 * 60 + 11, 110 * 60 + 3),
  verruckt: buildWaWSpeedrunTiers(26 * 60 + 34, 43 * 60 + 6, 61 * 60 + 44, 87 * 60 + 55),
  'shi-no-numa': buildWaWSpeedrunTiers(23 * 60 + 38, 34 * 60 + 52, 44 * 60 + 59, 59 * 60 + 27),
  'der-riese': {
    ...buildWaWSpeedrunTiers(27 * 60 + 57, 59 * 60 + 41, 138 * 60 + 1, 465 * 60),
    EASTER_EGG_SPEEDRUN: [
      { maxTimeSeconds: 600, xpReward: 150 },
      { maxTimeSeconds: 480, xpReward: 400 },
      { maxTimeSeconds: 440, xpReward: 1000 },
      { maxTimeSeconds: 415, xpReward: 2000 }, // WR 6:50 = 410s
    ],
  },
};

function buildWaWSpeedrunTiers(r30: number, r50: number, r70: number, r100: number): SpeedrunTiersByType {
  const buf = 1.2;
  return {
    ROUND_30_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r30 * buf * 1.5), xpReward: 80 },
      { maxTimeSeconds: Math.round(r30 * buf * 1.2), xpReward: 200 },
      { maxTimeSeconds: Math.round(r30 * buf), xpReward: 500 },
      { maxTimeSeconds: Math.round(r30 * 1.05), xpReward: 1200 },
    ],
    ROUND_50_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r50 * buf * 1.5), xpReward: 120 },
      { maxTimeSeconds: Math.round(r50 * buf * 1.2), xpReward: 300 },
      { maxTimeSeconds: Math.round(r50 * buf), xpReward: 700 },
      { maxTimeSeconds: Math.round(r50 * 1.05), xpReward: 1500 },
    ],
    ROUND_70_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r70 * buf * 1.5), xpReward: 150 },
      { maxTimeSeconds: Math.round(r70 * buf * 1.2), xpReward: 400 },
      { maxTimeSeconds: Math.round(r70 * buf), xpReward: 900 },
      { maxTimeSeconds: Math.round(r70 * 1.05), xpReward: 2000 },
    ],
    ROUND_100_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r100 * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(r100 * buf * 1.2), xpReward: 500 },
      { maxTimeSeconds: Math.round(r100 * buf), xpReward: 1200 },
      { maxTimeSeconds: Math.round(r100 * 1.05), xpReward: 2500 },
    ],
  };
}

/** BO1 speedrun tiers per map — WR-based, 4 tiers each. Includes R200 when applicable. */
function buildBo1SpeedrunTiers(
  r30: number,
  r50: number,
  r70: number,
  r100: number,
  r200?: number
): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {
    ROUND_30_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r30 * buf * 1.5), xpReward: 80 },
      { maxTimeSeconds: Math.round(r30 * buf * 1.2), xpReward: 200 },
      { maxTimeSeconds: Math.round(r30 * buf), xpReward: 500 },
      { maxTimeSeconds: Math.round(r30 * 1.05), xpReward: 1200 },
    ],
    ROUND_50_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r50 * buf * 1.5), xpReward: 120 },
      { maxTimeSeconds: Math.round(r50 * buf * 1.2), xpReward: 300 },
      { maxTimeSeconds: Math.round(r50 * buf), xpReward: 700 },
      { maxTimeSeconds: Math.round(r50 * 1.05), xpReward: 1500 },
    ],
    ROUND_70_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r70 * buf * 1.5), xpReward: 150 },
      { maxTimeSeconds: Math.round(r70 * buf * 1.2), xpReward: 400 },
      { maxTimeSeconds: Math.round(r70 * buf), xpReward: 900 },
      { maxTimeSeconds: Math.round(r70 * 1.05), xpReward: 2000 },
    ],
    ROUND_100_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r100 * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(r100 * buf * 1.2), xpReward: 500 },
      { maxTimeSeconds: Math.round(r100 * buf), xpReward: 1200 },
      { maxTimeSeconds: Math.round(r100 * 1.05), xpReward: 2500 },
    ],
  };
  if (r200 != null) {
    base.ROUND_200_SPEEDRUN = [
      { maxTimeSeconds: Math.round(r200 * buf * 1.5), xpReward: 300 },
      { maxTimeSeconds: Math.round(r200 * buf * 1.2), xpReward: 800 },
      { maxTimeSeconds: Math.round(r200 * buf), xpReward: 1800 },
      { maxTimeSeconds: Math.round(r200 * 1.05), xpReward: 3500 },
    ];
  }
  return base;
}

function addEeTiers(base: SpeedrunTiersByType, wrSeconds: number): SpeedrunTiersByType {
  const buf = 1.2;
  return {
    ...base,
    EASTER_EGG_SPEEDRUN: [
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(wrSeconds * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: 2500 },
    ],
  };
}

export const BO1_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'kino-der-toten': buildBo1SpeedrunTiers(28 * 60 + 52, 65 * 60 + 57, 143 * 60 + 8, 6 * 3600 + 33 * 60 + 16, 45 * 3600 + 51 * 60 + 31),
  five: buildBo1SpeedrunTiers(28 * 60 + 52, 66 * 60 + 49, 149 * 60 + 12, 6 * 3600 + 19 * 60 + 48, 46 * 3600 + 38 * 60 + 46),
  ascension: addEeTiers(buildBo1SpeedrunTiers(28 * 60 + 22, 60 * 60 + 43, 121 * 60 + 15, 5 * 3600 + 46 * 60 + 22, 43 * 3600 + 21 * 60 + 52), 13 * 60 + 37),
  'call-of-the-dead': buildBo1SpeedrunTiers(33 * 60 + 48, 81 * 60 + 57, 6 * 3600 + 13 * 60 + 40, 24 * 3600 + 55 * 60 + 40),
  'shangri-la': addEeTiers(buildBo1SpeedrunTiers(32 * 60 + 42, 70 * 60 + 40, 150 * 60 + 40, 6 * 3600 + 48 * 60 + 40, 50 * 3600), 9 * 60 + 38),
  moon: addEeTiers(buildBo1SpeedrunTiers(30 * 60 + 25, 65 * 60 + 55, 132 * 60, 5 * 3600 + 26 * 60, 39 * 3600 + 54 * 60), 8 * 60 + 59),
  'bo1-nacht-der-untoten': buildBo1SpeedrunTiers(40 * 60 + 54, 136 * 60, 486 * 60, 20 * 3600),
  'bo1-verruckt': buildBo1SpeedrunTiers(30 * 60 + 30, 77 * 60 + 40, 208 * 60 + 40, 590 * 60 + 40, 75 * 3600),
  'bo1-shi-no-numa': buildBo1SpeedrunTiers(31 * 60 + 18, 75 * 60 + 30, 180 * 60, 480 * 60, 64 * 3600),
  'bo1-der-riese': addEeTiers(buildBo1SpeedrunTiers(28 * 60, 58 * 60, 120 * 60, 5 * 3600 + 28 * 60 + 40, 42 * 3600), 3 * 60 + 6),
};

/** BO2 round speedrun tiers — WR-based. EE speedruns handled via getBo2EeSpeedrunDefinitions (per Easter Egg). */
function buildBo2SpeedrunTiers(
  r30: number,
  r50: number,
  r70: number,
  r100?: number,
  r200?: number
): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {
    ROUND_30_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r30 * buf * 1.5), xpReward: 80 },
      { maxTimeSeconds: Math.round(r30 * buf * 1.2), xpReward: 200 },
      { maxTimeSeconds: Math.round(r30 * buf), xpReward: 500 },
      { maxTimeSeconds: Math.round(r30 * 1.05), xpReward: 1200 },
    ],
    ROUND_50_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r50 * buf * 1.5), xpReward: 120 },
      { maxTimeSeconds: Math.round(r50 * buf * 1.2), xpReward: 300 },
      { maxTimeSeconds: Math.round(r50 * buf), xpReward: 700 },
      { maxTimeSeconds: Math.round(r50 * 1.05), xpReward: 1500 },
    ],
    ROUND_70_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r70 * buf * 1.5), xpReward: 150 },
      { maxTimeSeconds: Math.round(r70 * buf * 1.2), xpReward: 400 },
      { maxTimeSeconds: Math.round(r70 * buf), xpReward: 900 },
      { maxTimeSeconds: Math.round(r70 * 1.05), xpReward: 2000 },
    ],
  };
  if (r100 != null) {
    base.ROUND_100_SPEEDRUN = [
      { maxTimeSeconds: Math.round(r100 * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(r100 * buf * 1.2), xpReward: 500 },
      { maxTimeSeconds: Math.round(r100 * buf), xpReward: 1200 },
      { maxTimeSeconds: Math.round(r100 * 1.05), xpReward: 2500 },
    ];
  }
  if (r200 != null) {
    base.ROUND_200_SPEEDRUN = [
      { maxTimeSeconds: Math.round(r200 * buf * 1.5), xpReward: 300 },
      { maxTimeSeconds: Math.round(r200 * buf * 1.2), xpReward: 800 },
      { maxTimeSeconds: Math.round(r200 * buf), xpReward: 1800 },
      { maxTimeSeconds: Math.round(r200 * 1.05), xpReward: 3500 },
    ];
  }
  return base;
}

function addBo2EeTiers(base: SpeedrunTiersByType, wrSeconds: number): SpeedrunTiersByType {
  const buf = 1.2;
  return {
    ...base,
    EASTER_EGG_SPEEDRUN: [
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(wrSeconds * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: 2500 },
    ],
  };
}

export const BO2_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  tranzit: buildBo2SpeedrunTiers(31 * 60 + 7, 67 * 60 + 40, 142 * 60 + 40, 6 * 3600 + 30 * 60 + 40, 80 * 3600),
  'bus-depot': buildBo2SpeedrunTiers(35 * 60 + 6, 95 * 60 + 40, 11 * 3600),
  town: buildBo2SpeedrunTiers(29 * 60 + 14, 67 * 60 + 40, 230 * 60 + 40, 135 * 3600),
  farm: buildBo2SpeedrunTiers(31 * 60, 80 * 60, 28 * 3600),
  'nuketown-zombies': buildBo2SpeedrunTiers(35 * 60, 97 * 60, 50 * 3600),
  'die-rise': buildBo2SpeedrunTiers(25 * 60 + 55, 50 * 60, 80 * 60, 152 * 60, 84 * 3600),
  'mob-of-the-dead': addBo2EeTiers(buildBo2SpeedrunTiers(30 * 60, 70 * 60 + 40, 160 * 60, 7 * 3600, 60 * 3600), 19 * 60),
  buried: buildBo2SpeedrunTiers(28 * 60 + 49, 64 * 60, 140 * 60 + 40, 350 * 60 + 40, 43 * 3600),
  origins: addBo2EeTiers(buildBo2SpeedrunTiers(30 * 60 + 38, 58 * 60 + 31, 92 * 60 + 8, 190 * 60 + 40), 36 * 60),
};

/** BO3 round speedrun tiers — WR-based. Same pattern as BO2, plus ROUND_255_SPEEDRUN where applicable. */
function buildBo3SpeedrunTiers(
  r30: number,
  r50: number,
  r70: number,
  r100?: number,
  r255?: number
): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {
    ROUND_30_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r30 * buf * 1.5), xpReward: 80 },
      { maxTimeSeconds: Math.round(r30 * buf * 1.2), xpReward: 200 },
      { maxTimeSeconds: Math.round(r30 * buf), xpReward: 500 },
      { maxTimeSeconds: Math.round(r30 * 1.05), xpReward: 1200 },
    ],
    ROUND_50_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r50 * buf * 1.5), xpReward: 120 },
      { maxTimeSeconds: Math.round(r50 * buf * 1.2), xpReward: 300 },
      { maxTimeSeconds: Math.round(r50 * buf), xpReward: 700 },
      { maxTimeSeconds: Math.round(r50 * 1.05), xpReward: 1500 },
    ],
    ROUND_70_SPEEDRUN: [
      { maxTimeSeconds: Math.round(r70 * buf * 1.5), xpReward: 150 },
      { maxTimeSeconds: Math.round(r70 * buf * 1.2), xpReward: 400 },
      { maxTimeSeconds: Math.round(r70 * buf), xpReward: 900 },
      { maxTimeSeconds: Math.round(r70 * 1.05), xpReward: 2000 },
    ],
  };
  if (r100 != null) {
    base.ROUND_100_SPEEDRUN = [
      { maxTimeSeconds: Math.round(r100 * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(r100 * buf * 1.2), xpReward: 500 },
      { maxTimeSeconds: Math.round(r100 * buf), xpReward: 1200 },
      { maxTimeSeconds: Math.round(r100 * 1.05), xpReward: 2500 },
    ];
  }
  if (r255 != null) {
    base.ROUND_255_SPEEDRUN = [
      { maxTimeSeconds: Math.round(r255 * buf * 1.5), xpReward: 300 },
      { maxTimeSeconds: Math.round(r255 * buf * 1.2), xpReward: 800 },
      { maxTimeSeconds: Math.round(r255 * buf), xpReward: 1800 },
      { maxTimeSeconds: Math.round(r255 * 1.05), xpReward: 3500 },
    ];
  }
  return base;
}

function addBo3EeTiers(base: SpeedrunTiersByType, wrSeconds: number): SpeedrunTiersByType {
  const buf = 1.2;
  return {
    ...base,
    EASTER_EGG_SPEEDRUN: [
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(wrSeconds * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(wrSeconds * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: 2500 },
    ],
  };
}

/** BO3 speedrun tiers per map — uses BO3_MAP_CONFIG speedrunWRs. */
export const BO3_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'shadows-of-evil': addBo3EeTiers(
    buildBo3SpeedrunTiers(27 * 60 + 55, 54 * 60, 85 * 60, 170 * 60 + 40, 45 * 3600),
    19 * 60 + 39
  ),
  'the-giant': addBo3EeTiers(
    buildBo3SpeedrunTiers(27 * 60 + 55, 52 * 60, 95 * 60 + 40, 222 * 60 + 40, 55 * 3600),
    65 * 60
  ),
  'der-eisendrache': addBo3EeTiers(
    buildBo3SpeedrunTiers(29 * 60, 56 * 60, 94 * 60 + 40, 200 * 60, 47 * 3600),
    26 * 60
  ),
  'zetsubou-no-shima': addBo3EeTiers(
    buildBo3SpeedrunTiers(28 * 60, 62 * 60 + 40, 106 * 60 + 40, 230 * 60 + 40, 51 * 3600),
    20 * 60 + 6
  ),
  'gorod-krovi': addBo3EeTiers(
    buildBo3SpeedrunTiers(31 * 60, 66 * 60 + 40, 155 * 60 + 40, 5 * 3600, 70 * 3600),
    31 * 60
  ),
  revelations: addBo3EeTiers(
    buildBo3SpeedrunTiers(30 * 60, 56 * 60, 90 * 60 + 40, 167 * 60 + 40, 32 * 3600),
    23 * 60 + 4
  ),
  'bo3-nacht-der-untoten': buildBo3SpeedrunTiers(
    38 * 60,
    95 * 60 + 40,
    230 * 60 + 40,
    13 * 3600,
    300 * 3600
  ),
  'bo3-verruckt': buildBo3SpeedrunTiers(
    29 * 60,
    95 * 60 + 40,
    100 * 60 + 40,
    340 * 60 + 40,
    110 * 3600
  ),
  'bo3-shi-no-numa': buildBo3SpeedrunTiers(
    30 * 60,
    60,
    117 * 60 + 40,
    345 * 60 + 40
  ),
  'bo3-kino-der-toten': buildBo3SpeedrunTiers(
    28 * 60,
    53 * 60,
    90 * 60 + 40,
    200 * 60 + 40,
    66 * 3600
  ),
  'bo3-ascension': addBo3EeTiers(
    buildBo3SpeedrunTiers(28 * 60, 52 * 60, 84 * 60 + 40, 163 * 60 + 20, 50 * 3600),
    6 * 60 + 40
  ),
  'bo3-shangri-la': addBo3EeTiers(
    buildBo3SpeedrunTiers(31 * 60, 64 * 60 + 40, 111 * 60 + 40, 249 * 60 + 40),
    8 * 60
  ),
  'bo3-moon': addBo3EeTiers(
    buildBo3SpeedrunTiers(27 * 60, 47 * 60, 75 * 60 + 40, 153 * 60 + 40, 38 * 3600),
    19 * 60 + 20
  ),
  'bo3-origins': addBo3EeTiers(
    buildBo3SpeedrunTiers(31 * 60, 62 * 60 + 40, 100 * 60 + 40, 195 * 60 + 40, 87 * 3600),
    32 * 60
  ),
};

/** BO2 EE speedrun tiers per Easter Egg (Richtofen / Maxis variants). WRs in seconds. */
export const BO2_TRANZIT_RICHTOFEN_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 780, xpReward: 200 },
  { maxTimeSeconds: 700, xpReward: 600 },
  { maxTimeSeconds: 670, xpReward: 1500 },
  { maxTimeSeconds: 656, xpReward: 2500 },  // WR 10:56
];
export const BO2_TRANZIT_MAXIS_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 420, xpReward: 200 },
  { maxTimeSeconds: 380, xpReward: 600 },
  { maxTimeSeconds: 370, xpReward: 1500 },
  { maxTimeSeconds: 366, xpReward: 2500 },  // WR 6:06
];
export const BO2_DIE_RISE_RICHTOFEN_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 360, xpReward: 200 },
  { maxTimeSeconds: 300, xpReward: 600 },
  { maxTimeSeconds: 290, xpReward: 1500 },
  { maxTimeSeconds: 280, xpReward: 2500 },  // WR 4:40
];
export const BO2_DIE_RISE_MAXIS_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 420, xpReward: 200 },
  { maxTimeSeconds: 380, xpReward: 600 },
  { maxTimeSeconds: 372, xpReward: 1500 },
  { maxTimeSeconds: 368, xpReward: 2500 },  // WR 6:08
];
export const BO2_BURIED_RICHTOFEN_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 600, xpReward: 200 },
  { maxTimeSeconds: 520, xpReward: 600 },
  { maxTimeSeconds: 510, xpReward: 1500 },
  { maxTimeSeconds: 500, xpReward: 2500 },  // WR 8:20
];
export const BO2_BURIED_MAXIS_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 900, xpReward: 200 },
  { maxTimeSeconds: 800, xpReward: 600 },
  { maxTimeSeconds: 760, xpReward: 1500 },
  { maxTimeSeconds: 750, xpReward: 2500 },  // WR 12:30
];

/** Call of the Dead: EE speedrun tiers per EE. Stand-in (Solo) WR 4:27, Ensemble Cast (2+) WR 6:10. */
export const BO1_COTD_STAND_IN_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 360, xpReward: 200 },
  { maxTimeSeconds: 300, xpReward: 600 },
  { maxTimeSeconds: 280, xpReward: 1500 },
  { maxTimeSeconds: 267, xpReward: 2500 }, // WR 4:27
];
export const BO1_COTD_ENSEMBLE_CAST_EE_TIERS: SpeedrunTier[] = [
  { maxTimeSeconds: 450, xpReward: 200 },
  { maxTimeSeconds: 400, xpReward: 600 },
  { maxTimeSeconds: 380, xpReward: 1500 },
  { maxTimeSeconds: 370, xpReward: 2500 }, // WR 6:10
];

export function formatSpeedrunTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return `${m}:${s.toString().padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
