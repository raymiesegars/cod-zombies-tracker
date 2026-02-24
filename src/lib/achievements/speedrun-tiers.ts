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
/** BO4 round speedrun tiers — WR-based. Uses ROUND_200 (no ROUND_255). INSTAKILL_ROUND_SPEEDRUN for Blood, Dead, Ancient, Tag. */
function buildBo4SpeedrunTiers(
  r30: number,
  r50: number,
  r70: number,
  r100?: number,
  r200?: number,
  eeSeconds?: number,
  instakillSeconds?: number
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
  if (eeSeconds != null) {
    base.EASTER_EGG_SPEEDRUN = [
      { maxTimeSeconds: Math.round(eeSeconds * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(eeSeconds * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(eeSeconds * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(eeSeconds * 1.05), xpReward: 2500 },
    ];
  }
  if (instakillSeconds != null) {
    base.INSTAKILL_ROUND_SPEEDRUN = [
      { maxTimeSeconds: Math.round(instakillSeconds * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(instakillSeconds * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(instakillSeconds * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(instakillSeconds * 1.05), xpReward: 2500 },
    ];
  }
  return base;
}

const m = (x: number) => x * 60;
const h = (x: number) => x * 3600;
const hs = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const BO4_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  ix: buildBo4SpeedrunTiers(m(23), m(47), hs(1, 13, 30), hs(2, 20, 40), h(20), m(34)),
  'voyage-of-despair': buildBo4SpeedrunTiers(m(30), m(58), hs(1, 42, 0), hs(3, 40, 40), h(30), m(38)),
  'blood-of-the-dead': buildBo4SpeedrunTiers(hs(0, 26, 30), m(52), hs(1, 21, 40), hs(2, 32, 40), h(21), hs(0, 43, 40), h(24)),
  classified: buildBo4SpeedrunTiers(m(26), m(50), hs(1, 23, 40), hs(2, 51, 0), h(41), hs(0, 7, 30)),
  'dead-of-the-night': buildBo4SpeedrunTiers(m(27), m(55), hs(1, 27, 40), hs(2, 50, 40), hs(18, 25, 40), m(26), h(17)),
  'ancient-evil': buildBo4SpeedrunTiers(m(28), m(54), hs(1, 30, 40), hs(2, 55, 40), h(20), m(25), hs(10, 17, 2)),
  'alpha-omega': buildBo4SpeedrunTiers(m(24), m(52), hs(1, 30, 40), hs(3, 25, 0), h(25), m(33)),
  'tag-der-toten': buildBo4SpeedrunTiers(19 * 60 + 33, m(39), h(1), hs(1, 45, 0), hs(9, 25, 40), m(42), hs(7, 30, 0)),
};

/** BOCW speedrun tiers per map — WR-based. Exfil, Build% EE, ROUND_935, Outbreak R10/R20. */
function buildBocwSpeedrunTiers(cfg: {
  r30?: number; r50?: number; r70?: number; r100?: number; r200?: number; r935?: number;
  exfil?: number; exfilR21?: number; ee?: number; buildEe?: number; r10?: number; r20?: number;
}): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {};
  const tier = (sec: number, wrLabel: string) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: 80 },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: 200 },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: 500 },
    { maxTimeSeconds: Math.round(sec * 1.05), xpReward: 1200 },
  ];
  if (cfg.r30 != null) base.ROUND_30_SPEEDRUN = tier(cfg.r30, 'r30');
  if (cfg.r50 != null) base.ROUND_50_SPEEDRUN = tier(cfg.r50, 'r50');
  if (cfg.r70 != null) base.ROUND_70_SPEEDRUN = tier(cfg.r70, 'r70');
  if (cfg.r100 != null) base.ROUND_100_SPEEDRUN = tier(cfg.r100, 'r100');
  if (cfg.r200 != null) base.ROUND_200_SPEEDRUN = tier(cfg.r200, 'r200');
  if (cfg.r935 != null) base.ROUND_935_SPEEDRUN = [
    { maxTimeSeconds: Math.round(cfg.r935 * buf * 2), xpReward: 500 },
    { maxTimeSeconds: Math.round(cfg.r935 * buf * 1.5), xpReward: 1200 },
    { maxTimeSeconds: Math.round(cfg.r935 * buf), xpReward: 2500 },
    { maxTimeSeconds: Math.round(cfg.r935 * 1.05), xpReward: 5000 },
  ];
  if (cfg.exfil != null) base.EXFIL_SPEEDRUN = tier(cfg.exfil, 'exfil');
  if (cfg.exfilR21 != null) base.EXFIL_R21_SPEEDRUN = tier(cfg.exfilR21, 'exfilR21');
  if (cfg.ee != null) base.EASTER_EGG_SPEEDRUN = tier(cfg.ee, 'ee');
  if (cfg.buildEe != null) base.BUILD_EE_SPEEDRUN = tier(cfg.buildEe, 'buildEe');
  if (cfg.r10 != null) base.ROUND_10_SPEEDRUN = tier(cfg.r10, 'r10');
  if (cfg.r20 != null) base.ROUND_20_SPEEDRUN = tier(cfg.r20, 'r20');
  return base;
}

/** BO6 speedrun tiers — same as BOCW builder but with r999. */
function buildBo6SpeedrunTiers(cfg: {
  r30?: number; r50?: number; r70?: number; r100?: number; r200?: number; r999?: number;
  exfil?: number; exfilR21?: number; ee?: number; buildEe?: number;
}): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {};
  const tier = (sec: number) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: 80 },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: 200 },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: 500 },
    { maxTimeSeconds: Math.round(sec * 1.05), xpReward: 1200 },
  ];
  if (cfg.r30 != null) base.ROUND_30_SPEEDRUN = tier(cfg.r30);
  if (cfg.r50 != null) base.ROUND_50_SPEEDRUN = tier(cfg.r50);
  if (cfg.r70 != null) base.ROUND_70_SPEEDRUN = tier(cfg.r70);
  if (cfg.r100 != null) base.ROUND_100_SPEEDRUN = tier(cfg.r100);
  if (cfg.r200 != null) base.ROUND_200_SPEEDRUN = tier(cfg.r200);
  if (cfg.r999 != null) base.ROUND_999_SPEEDRUN = [
    { maxTimeSeconds: Math.round(cfg.r999 * buf * 2), xpReward: 500 },
    { maxTimeSeconds: Math.round(cfg.r999 * buf * 1.5), xpReward: 1200 },
    { maxTimeSeconds: Math.round(cfg.r999 * buf), xpReward: 2500 },
    { maxTimeSeconds: Math.round(cfg.r999 * 1.05), xpReward: 5000 },
  ];
  if (cfg.exfil != null) base.EXFIL_SPEEDRUN = tier(cfg.exfil);
  if (cfg.exfilR21 != null) base.EXFIL_R21_SPEEDRUN = tier(cfg.exfilR21);
  if (cfg.ee != null) base.EASTER_EGG_SPEEDRUN = tier(cfg.ee);
  if (cfg.buildEe != null) base.BUILD_EE_SPEEDRUN = tier(cfg.buildEe);
  return base;
}

const mBo6 = (x: number) => x * 60;
const hBo6 = (x: number) => x * 3600;
const hsBo6 = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const BO6_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  terminus: buildBo6SpeedrunTiers({
    r30: mBo6(24), r50: mBo6(44), r70: hsBo6(1, 9, 40), r100: hsBo6(1, 50, 40), r200: hsBo6(4, 54, 40), r999: hBo6(107),
    exfil: mBo6(6) + 20, exfilR21: mBo6(13) + 30, ee: mBo6(19), buildEe: mBo6(21),
  }),
  'liberty-falls': buildBo6SpeedrunTiers({
    r30: mBo6(22), r50: mBo6(42), r70: hsBo6(1, 5, 40), r100: hsBo6(1, 40, 40), r200: hsBo6(4, 30, 40), r999: hBo6(171),
    exfil: mBo6(5) + 30, exfilR21: mBo6(12) + 30, ee: mBo6(12), buildEe: mBo6(12),
  }),
  'citadelle-des-morts': buildBo6SpeedrunTiers({
    r30: mBo6(24), r50: mBo6(42) + 30, r70: mBo6(59), r100: hsBo6(1, 32, 40), r200: hsBo6(3, 52, 40), r999: hBo6(94),
    exfil: mBo6(6) + 50, exfilR21: mBo6(16), ee: mBo6(23),
  }),
  'the-tomb': buildBo6SpeedrunTiers({
    r30: mBo6(21), r50: mBo6(38), r70: mBo6(54), r100: hsBo6(1, 21, 40), r200: hsBo6(3, 8, 40), r999: hBo6(55),
    exfil: mBo6(6), exfilR21: mBo6(13) + 37, ee: mBo6(29), buildEe: mBo6(23),
  }),
  'shattered-veil': buildBo6SpeedrunTiers({
    r30: mBo6(20) + 42, r50: mBo6(42), r70: mBo6(59), r100: hsBo6(1, 30, 40), r200: hsBo6(3, 35, 40), r999: hBo6(68),
    exfil: mBo6(6), exfilR21: mBo6(12) + 30, ee: mBo6(35), buildEe: mBo6(22),
  }),
  reckoning: buildBo6SpeedrunTiers({
    r30: mBo6(23), r50: mBo6(47), r70: hsBo6(1, 21, 40), r100: hsBo6(2, 2, 40), r200: hsBo6(4, 42, 40), r999: hBo6(89),
    exfil: mBo6(6) + 20, exfilR21: mBo6(14), ee: mBo6(22),
  }),
};

export const BO7_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'ashes-of-the-damned': buildBo6SpeedrunTiers({
    r30: mBo6(13) + 24, r50: mBo6(24) + 27, r70: mBo6(34) + 49, r100: mBo6(52) + 36, r200: hBo6(4), r999: hBo6(80),
    exfil: mBo6(4) + 20, exfilR21: mBo6(10), ee: mBo6(30),
  }),
  'vandorn-farm': buildBo6SpeedrunTiers({
    r30: mBo6(14) + 50, r50: mBo6(29), r70: mBo6(52), r100: hsBo6(1, 34, 40), r200: hsBo6(7, 45, 20), r999: hBo6(130),
    exfil: mBo6(4) + 20, exfilR21: mBo6(9) + 40,
  }),
  'astra-malorum': buildBo6SpeedrunTiers({
    r30: mBo6(16), r50: mBo6(30), r70: hsBo6(1, 20, 40), r100: hsBo6(2, 10, 40), r200: hBo6(8), r999: hBo6(115),
    exfil: mBo6(4) + 50, exfilR21: mBo6(11), ee: mBo6(30),
  }),
  'exit-115': buildBo6SpeedrunTiers({
    r30: mBo6(15), r50: mBo6(35), r70: mBo6(60), r100: hsBo6(1, 40, 40), r200: hBo6(10), r999: hBo6(130),
    exfil: mBo6(4) + 23, exfilR21: mBo6(9) + 30,
  }),
  'zarya-cosmodrome': buildBo6SpeedrunTiers({
    r30: mBo6(14) + 30, r50: mBo6(34) + 20, r70: mBo6(54), r100: hsBo6(1, 50, 40), r200: hsBo6(8, 30, 0), r999: hBo6(120),
    exfil: mBo6(4), exfilR21: mBo6(9),
  }),
  mars: buildBo6SpeedrunTiers({
    r30: mBo6(14) + 30, r50: mBo6(34) + 20, r70: mBo6(54), r100: hsBo6(1, 50, 40), r200: hsBo6(8, 30, 0), r999: hBo6(120),
    exfil: mBo6(4), exfilR21: mBo6(9),
  }),
};

export const BOCW_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'die-maschine': buildBocwSpeedrunTiers({
    r30: m(21), r50: m(39), r70: m(54), r100: hs(1, 20, 40), r200: hs(3, 11, 40), r935: h(87),
    exfil: m(6) + 40, exfilR21: m(16), ee: m(20) + 22,
  }),
  'firebase-z': buildBocwSpeedrunTiers({
    r30: m(28), r50: m(53), r70: hs(1, 17, 40), r100: h(2), r200: hs(5, 39, 40), r935: h(88),
    exfil: m(7) + 30, exfilR21: m(18), ee: m(20) + 22, buildEe: m(21) + 20,
  }),
  'mauer-der-toten': buildBocwSpeedrunTiers({
    r30: m(22), r50: m(41), r70: m(58) + 30, r100: hs(1, 27, 40), r200: hs(3, 48, 40), r935: h(56),
    exfil: m(7) + 20, exfilR21: m(16) + 30, ee: m(23),
  }),
  outbreak: buildBocwSpeedrunTiers({
    r10: m(32) + 38, r20: hs(1, 9, 18), r30: hs(1, 44, 24), r50: hs(3, 8, 40),
    ee: m(20),
  }),
  forsaken: buildBocwSpeedrunTiers({
    r30: m(16), r50: m(37), r70: m(55), r100: hs(1, 24, 30), r200: h(4), r935: h(102),
    exfil: m(4) + 30, exfilR21: m(10), ee: m(12) + 30, buildEe: m(14) + 30,
  }),
};

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

/** WW2 round speedrun tiers — WR-based. R10, R30, R50, R70, R100, R200, EE, Super 30. */
function buildWw2SpeedrunTiers(cfg: {
  r10?: number;
  r30: number;
  r50?: number;
  r70?: number;
  r100?: number;
  r200?: number;
  ee?: number;
  super30?: number;
}): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {};
  if (cfg.r10 != null) {
    base.ROUND_10_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.r10 * buf * 1.5), xpReward: 60 },
      { maxTimeSeconds: Math.round(cfg.r10 * buf * 1.2), xpReward: 150 },
      { maxTimeSeconds: Math.round(cfg.r10 * buf), xpReward: 400 },
      { maxTimeSeconds: Math.round(cfg.r10 * 1.05), xpReward: 1000 },
    ];
  }
  base.ROUND_30_SPEEDRUN = [
    { maxTimeSeconds: Math.round(cfg.r30 * buf * 1.5), xpReward: 80 },
    { maxTimeSeconds: Math.round(cfg.r30 * buf * 1.2), xpReward: 200 },
    { maxTimeSeconds: Math.round(cfg.r30 * buf), xpReward: 500 },
    { maxTimeSeconds: Math.round(cfg.r30 * 1.05), xpReward: 1200 },
  ];
  if (cfg.r50 != null) {
    base.ROUND_50_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.r50 * buf * 1.5), xpReward: 120 },
      { maxTimeSeconds: Math.round(cfg.r50 * buf * 1.2), xpReward: 300 },
      { maxTimeSeconds: Math.round(cfg.r50 * buf), xpReward: 700 },
      { maxTimeSeconds: Math.round(cfg.r50 * 1.05), xpReward: 1500 },
    ];
  }
  if (cfg.r70 != null) {
    base.ROUND_70_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.r70 * buf * 1.5), xpReward: 150 },
      { maxTimeSeconds: Math.round(cfg.r70 * buf * 1.2), xpReward: 400 },
      { maxTimeSeconds: Math.round(cfg.r70 * buf), xpReward: 900 },
      { maxTimeSeconds: Math.round(cfg.r70 * 1.05), xpReward: 2000 },
    ];
  }
  if (cfg.r100 != null) {
    base.ROUND_100_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.r100 * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(cfg.r100 * buf * 1.2), xpReward: 500 },
      { maxTimeSeconds: Math.round(cfg.r100 * buf), xpReward: 1200 },
      { maxTimeSeconds: Math.round(cfg.r100 * 1.05), xpReward: 2500 },
    ];
  }
  if (cfg.r200 != null) {
    base.ROUND_200_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.r200 * buf * 1.5), xpReward: 300 },
      { maxTimeSeconds: Math.round(cfg.r200 * buf * 1.2), xpReward: 800 },
      { maxTimeSeconds: Math.round(cfg.r200 * buf), xpReward: 1800 },
      { maxTimeSeconds: Math.round(cfg.r200 * 1.05), xpReward: 3500 },
    ];
  }
  if (cfg.ee != null) {
    base.EASTER_EGG_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.ee * buf * 1.5), xpReward: 200 },
      { maxTimeSeconds: Math.round(cfg.ee * buf * 1.2), xpReward: 600 },
      { maxTimeSeconds: Math.round(cfg.ee * buf), xpReward: 1500 },
      { maxTimeSeconds: Math.round(cfg.ee * 1.05), xpReward: 2500 },
    ];
  }
  if (cfg.super30 != null) {
    base.SUPER_30_SPEEDRUN = [
      { maxTimeSeconds: Math.round(cfg.super30 * buf * 1.5), xpReward: 300 },
      { maxTimeSeconds: Math.round(cfg.super30 * buf * 1.2), xpReward: 800 },
      { maxTimeSeconds: Math.round(cfg.super30 * buf), xpReward: 1800 },
      { maxTimeSeconds: Math.round(cfg.super30 * 1.05), xpReward: 3500 },
    ];
  }
  return base;
}

export const WW2_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  prologue: buildWw2SpeedrunTiers({ r30: m(40) + 1 }),
  'the-final-reich': buildWw2SpeedrunTiers({
    r10: m(7) + 48,
    r30: m(28) + 27,
    r50: m(54) + 51,
    r70: hs(1, 45, 40),
    r100: hs(3, 50, 40),
    r200: hs(22, 30, 20),
    ee: m(23),
    super30: hs(2, 30, 30),
  }),
  'groesten-haus': buildWw2SpeedrunTiers({
    r30: m(23) + 33,
    r50: m(53) + 15,
    r70: hs(2, 43, 40),
  }),
  'the-darkest-shore': buildWw2SpeedrunTiers({
    r10: m(8) + 6,
    r30: m(23) + 20,
    r50: m(50),
    r70: hs(1, 41, 40),
    r100: h(4),
    r200: hs(17, 30, 40),
    ee: m(30),
  }),
  'the-shadowed-throne': buildWw2SpeedrunTiers({
    r10: m(8),
    r30: m(30),
    r50: h(1),
    r70: h(2),
    r100: hs(4, 20, 30),
    r200: hs(18, 30, 40),
    ee: m(30),
  }),
  'bodega-cervantes': buildWw2SpeedrunTiers({
    r30: m(26) + 30,
    r50: m(50),
    r70: hs(1, 21, 30),
    r100: hs(3, 22, 20),
    r200: h(15),
  }),
  'uss-mount-olympus': buildWw2SpeedrunTiers({
    r30: m(28),
    r50: m(58),
    r70: hs(1, 56, 40),
    r100: hs(4, 56, 40),
    r200: h(26),
  }),
  'altar-of-blood': buildWw2SpeedrunTiers({
    r30: m(28),
    r50: m(56) + 30,
    r70: hs(1, 56, 40),
    r100: h(5),
    r200: hs(21, 30, 40),
  }),
  'the-frozen-dawn': buildWw2SpeedrunTiers({
    r10: m(1) + 25,
    r30: m(24),
    r50: m(56),
    r70: hs(1, 46, 40),
    r100: hs(4, 8, 40),
    r200: h(23),
    ee: m(20),
  }),
};

/** Vanguard speedrun tiers — exfilR5, exfilR10, exfilR20, r10/r20/r30/r50/r70/r100/r200, ee, buildEe. */
function buildVanguardSpeedrunTiers(cfg: {
  r10?: number; r20?: number; r30?: number; r50?: number; r70?: number; r100?: number; r200?: number;
  exfilR5?: number; exfilR10?: number; exfilR20?: number; ee?: number; buildEe?: number;
}): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {};
  const tier = (sec: number) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: 80 },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: 200 },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: 500 },
    { maxTimeSeconds: Math.round(sec * 1.05), xpReward: 1200 },
  ];
  if (cfg.r10 != null) base.ROUND_10_SPEEDRUN = tier(cfg.r10);
  if (cfg.r20 != null) base.ROUND_20_SPEEDRUN = tier(cfg.r20);
  if (cfg.r30 != null) base.ROUND_30_SPEEDRUN = tier(cfg.r30);
  if (cfg.r50 != null) base.ROUND_50_SPEEDRUN = tier(cfg.r50);
  if (cfg.r70 != null) base.ROUND_70_SPEEDRUN = tier(cfg.r70);
  if (cfg.r100 != null) base.ROUND_100_SPEEDRUN = tier(cfg.r100);
  if (cfg.r200 != null) base.ROUND_200_SPEEDRUN = tier(cfg.r200);
  if (cfg.exfilR5 != null) base.EXFIL_R5_SPEEDRUN = tier(cfg.exfilR5);
  if (cfg.exfilR10 != null) base.EXFIL_R10_SPEEDRUN = tier(cfg.exfilR10);
  if (cfg.exfilR20 != null) base.EXFIL_R20_SPEEDRUN = tier(cfg.exfilR20);
  if (cfg.ee != null) base.EASTER_EGG_SPEEDRUN = tier(cfg.ee);
  if (cfg.buildEe != null) base.BUILD_EE_SPEEDRUN = tier(cfg.buildEe);
  return base;
}

export const VANGUARD_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'der-anfang': buildVanguardSpeedrunTiers({
    r10: m(21) + 30, r30: m(50), exfilR5: m(8) + 40, exfilR10: m(12) + 40, ee: m(9),
  }),
  'terra-maledicta': buildVanguardSpeedrunTiers({
    r10: m(21), r20: m(50), exfilR5: m(9), exfilR10: m(20), ee: m(21),
  }),
  'shi-no-numa-reborn': buildVanguardSpeedrunTiers({
    r30: m(16) + 30, r50: m(38), r70: hs(1, 2, 48), r100: h(2), r200: h(6),
    exfilR10: m(4) + 30, exfilR20: m(9) + 30, ee: m(16) + 30, buildEe: m(24) + 30,
  }),
  'the-archon': buildVanguardSpeedrunTiers({
    r30: m(15) + 42, r50: m(34), r70: m(49), r100: hs(1, 35, 40), r200: hs(3, 20, 40),
    exfilR10: m(4) + 20, exfilR20: m(9) + 40, ee: m(24),
  }),
};

/** AW Exo Zombies speedrun tiers — R30/R50/R70/R100, EE. Based on user WRs. */
function buildAwSpeedrunTiers(cfg: {
  r30?: number; r50?: number; r70?: number; r100?: number; ee?: number;
}): SpeedrunTiersByType {
  const buf = 1.2;
  const base: SpeedrunTiersByType = {};
  const tier = (sec: number) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: 80 },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: 200 },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: 500 },
    { maxTimeSeconds: Math.round(sec * 1.05), xpReward: 1200 },
  ];
  if (cfg.r30 != null) base.ROUND_30_SPEEDRUN = tier(cfg.r30);
  if (cfg.r50 != null) base.ROUND_50_SPEEDRUN = tier(cfg.r50);
  if (cfg.r70 != null) base.ROUND_70_SPEEDRUN = tier(cfg.r70);
  if (cfg.r100 != null) base.ROUND_100_SPEEDRUN = tier(cfg.r100);
  if (cfg.ee != null) base.EASTER_EGG_SPEEDRUN = tier(cfg.ee);
  return base;
}

const mAw = (x: number) => x * 60;
const hAw = (x: number) => x * 3600;
const hsAw = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const AW_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'aw-outbreak': buildAwSpeedrunTiers({
    r30: mAw(27) + 48, r50: hsAw(1, 7, 33), r70: hAw(3), r100: hAw(9), ee: mAw(9),
  }),
  'aw-infection': buildAwSpeedrunTiers({
    r30: mAw(34), r50: hsAw(1, 41, 40), r70: hsAw(4, 24, 40), r100: hsAw(12, 30, 40), ee: mAw(12) + 40,
  }),
  'aw-carrier': buildAwSpeedrunTiers({
    r30: mAw(29), r50: hsAw(1, 23, 40), r70: hAw(5), r100: hsAw(14, 20, 20), ee: mAw(26),
  }),
  'aw-descent': buildAwSpeedrunTiers({
    r30: mAw(35) + 40, r50: hsAw(1, 20, 40), r70: hsAw(4, 50, 40), r100: hsAw(25, 20, 40), ee: mAw(43) + 21,
  }),
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
