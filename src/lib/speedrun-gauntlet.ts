/**
 * Speedrun Gauntlet event catalog.
 * Each entry is a discrete competition with its own map, relics, date window, and rules.
 */

export const GAUNTLET_PRIZE_POOL_TOTAL = 2000;

export const GAUNTLET_PRIZE_BREAKDOWN = [
  { place: 1, amount: 1000, note: '+ featured video with Kingman' },
  { place: 2, amount: 500 },
  { place: 3, amount: 250 },
  { place: 4, amount: 150 },
  { place: 5, amount: 100 },
] as const;

export type SpeedrunGauntletConfig = {
  slug: string;
  name: string;
  shortLabel: string;
  mapSlug: string;
  mapDisplayName: string;
  /** Boss / timer end condition for display */
  timerEndCondition: string;
  startsAt: string;
  endsAt: string;
  requiredRelics: readonly string[];
  requiredRelicLabels: readonly string[];
  bannedItems: readonly string[];
  coreRestrictions: readonly string[];
  sideQuestNotes: readonly string[];
  allowedGobblegums: readonly string[];
  /** Max uses of each allowed gobblegum per run */
  gobblegumUseLimit: number;
  officialRulesUrl: string | null;
  summary: string;
};

const GAUNTLET_1: SpeedrunGauntletConfig = {
  slug: 'gauntlet-1-totenreich',
  name: 'Speedrun Gauntlet #1',
  shortLabel: 'Gauntlet #1 — Totenreich',
  mapSlug: 'totenreich',
  mapDisplayName: 'Totenreich',
  timerEndCondition: "Dravakar's health bar disappears",
  startsAt: '2020-01-01T00:00:00.000Z',
  endsAt: '2026-07-18T05:00:00.000Z',
  requiredRelics: [
    'Teddy Bear',
    'Dragon Wings',
    'Gong',
    'Seed',
    'Rocket',
    'Focusing Stone',
    'Spider Fang',
    'Elephant',
    'Bus',
    'Spork',
  ],
  requiredRelicLabels: [
    'Teddy Bear - Round start delay is cut down by 75%',
    'Dragon Wings - Normal power-up spawns are disabled',
    'Gong - Field Upgrade starts charged, but can only be charged by full power',
    'Seed - No Mystery Box',
    'Rocket - No Score Streaks',
    'Focusing Stone - No Self-Revive kits',
    'Spider Fang - Perk costs at machines never decrease',
    'Elephant - Health regen delay is increased',
    'Bus - Enemy health regenerates',
    'Spork - Enemies deal double damage',
  ],
  bannedItems: [
    'Mask of Salvation (Wisp Tea)',
    'Mask of Benevolence (Wisp Tea)',
    'Free Throw (Mule Kick)',
    'Multi-Pack (Mule Kick)',
    'Kick Back (Mule Kick)',
    'Iron Core (Juggernog)',
    'Shake It Off (Juggernog)',
    'Prestidigitation (Speed Cola)',
    'Equivalent Exchange (Quick Revive)',
    'Imperil Peach (Elemental Pop)',
    'Pineapple Blast (Elemental Pop)',
    'Smell of Death (Vulture-Aid)',
    'Picky Eater (Vulture-Aid)',
    'Barista Brawl (Melee Macchiato)',
    'Double Whammy (PhD Flopper)',
    'Stuntman (PhD Flopper)',
    'Sixth Sense (Death Perception)',
    'Haywire (Tesla Storm)',
    'All Tyr Secret Room wall weapons/equipment found inside those rooms',
    'Stim Shots',
    'Aether Shroud',
  ],
  coreRestrictions: [
    'High Contrast Mode is not allowed',
    'No Mister Peeks eggs (bronze, silver, gold)',
    'No relic trials to counter active relics',
    'TEDD tasks are not allowed',
    'No Pack-a-Punch crystals/Aether tools from Die Glocke streak',
    'Free power-ups are allowed except free Fire Sale',
    'No unique helmet side quests',
    "No Olaf's Cod Cranker for extra score streak pulls",
    "No power-ups from Tyr's head kill-coordinate side quest",
  ],
  sideQuestNotes: [
    'Unique helmet side quests are not allowed',
    "Olaf's Cod Cranker for extra score streak pulls is not allowed",
    "Power-ups from Tyr's head kill-coordinate side quest are not allowed",
  ],
  allowedGobblegums: [
    'Wall Power',
    'Cache Back',
    'Dead Drop',
    "Who's Keeping Score",
    'Temporal Gift',
  ],
  gobblegumUseLimit: 2,
  officialRulesUrl: 'https://new.express.adobe.com/webpage/2ZBRnAT6CxqDr',
  summary: 'Totenreich Main Quest speedrun with fixed competitive settings and locked submission rules.',
};

const GAUNTLET_2: SpeedrunGauntletConfig = {
  slug: 'gauntlet-2-ashes',
  name: 'Speedrun Gauntlet #2',
  shortLabel: 'Gauntlet #2 — Ashes of the Damned',
  mapSlug: 'ashes-of-the-damned',
  mapDisplayName: 'Ashes of the Damned',
  timerEndCondition: "Veytharion's health bar disappears",
  startsAt: '2026-07-18T16:00:00.000Z',
  endsAt: '2026-08-18T23:59:59.000Z',
  requiredRelics: [
    'Teddy Bear',
    'Dragon Wings',
    'Gong',
    'Seed',
    'Vril Sphere',
    'Focusing Stone',
    'Matryoshka Doll',
    'Dragon (Zombies)',
    'Blood Vials',
    'Mannequin Turret',
  ],
  requiredRelicLabels: [
    'Teddy Bear - Round start delay is cut down by 75%',
    'Dragon Wings - Normal Power-Up spawns are disabled',
    'Gong - Field Upgrade starts charged, but can only be charged by full power',
    'Seed - No Mystery Box',
    'Vril Sphere - Players can only carry 4 Perk-a-Colas',
    'Focusing Stone - No Self-Revive kits',
    'Matryoshka Doll - Salvage drop rate halved',
    'Dragon (Zombies) - All ammo crates are disabled',
    'Blood Vials - No Augments',
    'Mannequin Turret - No starting armor. Only armor available is gold armor from the wall buy.',
  ],
  bannedItems: [
    'Toxic Growth',
    'Death Machine',
    'War Machine',
    'Pack-A-Punch Crystals',
    'Aether Tools',
    'Ray Gun',
    'Any Free Perk After Equipping 4 Perks',
  ],
  coreRestrictions: [
    'High Contrast Mode is not allowed',
    'No Mister Peeks eggs (bronze, silver, gold)',
    'No relic trials to counter active relics',
    'TEDD tasks are not allowed',
    'Free power-ups are allowed except free Fire Sale',
    'You must stay within the Gobblegum limit',
  ],
  sideQuestNotes: [
    'ALL side quests are allowed for this competition',
    'You may only grab Points, Salvage, or Equipment that drop from any and all side quests',
    'Mystery & Free Perks are allowed and may be equipped from any side quest, but you MUST stay within the 4-perk limit',
    'Going over the 4-perk limit at any point automatically invalidates your run',
    'You may NOT grab Pack-A-Punch Crystals, Aether Tools, or Wonder Weapons that drop from any side quest',
  ],
  allowedGobblegums: [
    "Who's Keeping Score",
    'Temporal Gift',
    'Cache Back',
    'Kill Joy',
    'Power Keg',
  ],
  gobblegumUseLimit: 1,
  officialRulesUrl: null,
  summary:
    'Ashes of the Damned Main Quest speedrun in Cursed mode with a fixed relic lineup and simplified bans.',
};

/** Newest first */
export const SPEEDRUN_GAUNTLETS: readonly SpeedrunGauntletConfig[] = [GAUNTLET_2, GAUNTLET_1];

export function listGauntlets(): readonly SpeedrunGauntletConfig[] {
  return SPEEDRUN_GAUNTLETS;
}

export function getGauntlet(slug: string | null | undefined): SpeedrunGauntletConfig | null {
  if (!slug) return null;
  return SPEEDRUN_GAUNTLETS.find((g) => g.slug === slug) ?? null;
}

export function getGauntletByMapSlug(mapSlug: string | null | undefined): SpeedrunGauntletConfig | null {
  if (!mapSlug) return null;
  const normalized = mapSlug.toLowerCase();
  // Prefer the newest gauntlet that uses this map
  return SPEEDRUN_GAUNTLETS.find((g) => g.mapSlug.toLowerCase() === normalized) ?? null;
}

export function isGauntletOpen(gauntlet: SpeedrunGauntletConfig, now: Date = new Date()): boolean {
  const start = new Date(gauntlet.startsAt).getTime();
  const end = new Date(gauntlet.endsAt).getTime();
  const t = now.getTime();
  return t >= start && t < end;
}

export function isGauntletEnded(gauntlet: SpeedrunGauntletConfig, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(gauntlet.endsAt).getTime();
}

/**
 * Default selection: newest gauntlet that has not ended yet (open or upcoming),
 * otherwise the newest overall.
 */
export function getCurrentGauntlet(now: Date = new Date()): SpeedrunGauntletConfig {
  const activeOrUpcoming = SPEEDRUN_GAUNTLETS.find(
    (g) => now.getTime() < new Date(g.endsAt).getTime()
  );
  if (activeOrUpcoming) return activeOrUpcoming;
  return SPEEDRUN_GAUNTLETS[0];
}

export function hasExactRelics(
  value: unknown,
  requiredRelics: readonly string[]
): boolean {
  const relics = Array.isArray(value) ? value.map(String) : [];
  return (
    relics.length === requiredRelics.length &&
    requiredRelics.every((relic) => relics.includes(relic))
  );
}

/** Match a challenge log against any gauntlet in the catalog (map + mode + exact relics). */
export function matchGauntletForLog(log: {
  mapSlug: string;
  playerCount?: string | null;
  bo7GobbleGumMode?: string | null;
  bo7SupportMode?: string | null;
  bo7IsCursedRun?: boolean | null;
  bo7RelicsUsed?: unknown;
}): SpeedrunGauntletConfig | null {
  if (log.playerCount !== 'SOLO') return null;
  if (log.bo7GobbleGumMode !== 'WITH_GOBBLEGUMS') return null;
  if (log.bo7SupportMode !== 'WITH_SUPPORT') return null;
  if (log.bo7IsCursedRun !== true) return null;
  const mapSlug = log.mapSlug.toLowerCase();
  for (const gauntlet of SPEEDRUN_GAUNTLETS) {
    if (gauntlet.mapSlug.toLowerCase() !== mapSlug) continue;
    if (hasExactRelics(log.bo7RelicsUsed, gauntlet.requiredRelics)) return gauntlet;
  }
  return null;
}

export function resolveGauntletFromTournament(tournament: {
  title?: string | null;
  map?: { slug?: string | null } | null;
}): SpeedrunGauntletConfig | null {
  const title = tournament.title?.toLowerCase() ?? '';
  const mapSlug = tournament.map?.slug?.toLowerCase() ?? '';
  if (!title.includes('speedrun gauntlet') || !mapSlug) return null;
  const byMap = SPEEDRUN_GAUNTLETS.filter((g) => g.mapSlug.toLowerCase() === mapSlug);
  if (byMap.length === 0) return null;
  const numbered = byMap.find((g) => {
    const n = g.slug.match(/gauntlet-(\d+)/)?.[1];
    if (!n) return false;
    return title.includes(`#${n}`) || title.includes(`gauntlet ${n}`) || title.includes(`gauntlet #${n}`);
  });
  return numbered ?? byMap[0];
}
