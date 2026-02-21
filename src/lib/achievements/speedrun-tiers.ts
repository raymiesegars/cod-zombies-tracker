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

export function formatSpeedrunTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return `${m}:${s.toString().padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
