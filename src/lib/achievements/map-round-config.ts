export type RoundMilestone = { round: number; xp: number };

export type MapRoundConfig = {
  roundCap: number | null;
  roundMilestones: RoundMilestone[];
};

const MAX_STEP_RATIO = 1.30;
const REQUIRED_LOW_ROUNDS = [20, 35, 50, 70, 100] as const;

// Tiers at 20/35/50/70/100, then fill so no step is > 30%. XP scales up to cap.
export function buildRoundMilestones(
  roundCap: number,
  maxXpAtCap: number = 2500
): RoundMilestone[] {
  let ordered: number[] = [...REQUIRED_LOW_ROUNDS].filter((r) => r <= roundCap);
  if (ordered.length === 0 || ordered[ordered.length - 1]! !== roundCap) {
    ordered.push(roundCap);
  }
  ordered = Array.from(new Set(ordered)).sort((a, b) => a - b);
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i]!;
      const b = ordered[i + 1]!;
      const next = Math.floor(a * MAX_STEP_RATIO);
      if (next < b) {
        ordered.splice(i + 1, 0, next);
        changed = true;
        break;
      }
    }
  }
  const low = 20;
  const xpAtLow = 50;
  const exponent = Math.log(maxXpAtCap / xpAtLow) / Math.log(roundCap / low);
  return ordered.map((round) => {
    const xp = Math.round(xpAtLow * Math.pow(round / low, exponent));
    return { round, xp: Math.min(xp, maxXpAtCap) };
  });
}

function config(
  roundCap: number | null,
  roundMilestones: RoundMilestone[]
): MapRoundConfig {
  return { roundCap, roundMilestones };
}

const WAW_LOW: RoundMilestone[] = buildRoundMilestones(1000, 2000);
const WAW_MILESTONES: RoundMilestone[] = [
  ...WAW_LOW,
  { round: 2000, xp: 5000 },
  { round: 5000, xp: 10000 },
  { round: 10000, xp: 20000 },
].sort((a, b) => a.round - b.round);

const WAW: Record<string, MapRoundConfig> = {
  'nacht-der-untoten': config(null, WAW_MILESTONES),
  verruckt: config(null, WAW_MILESTONES),
  'shi-no-numa': config(null, WAW_MILESTONES),
  'der-riese': config(null, WAW_MILESTONES),
};

const BO1_220: RoundMilestone[] = buildRoundMilestones(220, 2500);
const BO1_200: RoundMilestone[] = buildRoundMilestones(200, 2000);
const BO1_100: RoundMilestone[] = buildRoundMilestones(100, 1200);

const BO1: Record<string, MapRoundConfig> = {
  'kino-der-toten': config(220, BO1_220),
  five: config(220, BO1_220),
  ascension: config(220, BO1_220),
  'call-of-the-dead': config(100, BO1_100),
  'shangri-la': config(200, BO1_200),
  moon: config(220, BO1_220),
  'bo1-nacht-der-untoten': config(100, BO1_100),
  'bo1-verruckt': config(220, BO1_220),
  'bo1-shi-no-numa': config(220, BO1_220),
  'bo1-der-riese': config(220, BO1_220),
};

const BO2_200: RoundMilestone[] = buildRoundMilestones(200, 2000);
const BO2_220: RoundMilestone[] = buildRoundMilestones(220, 2500);
const BO2_80: RoundMilestone[] = buildRoundMilestones(80, 1000);
const BO2_150: RoundMilestone[] = buildRoundMilestones(150, 1500);

const BO2: Record<string, MapRoundConfig> = {
  tranzit: config(200, BO2_200),
  'bus-depot': config(80, BO2_80),
  farm: config(80, BO2_80),
  town: config(80, BO2_80),
  'nuketown-zombies': config(80, BO2_80),
  'die-rise': config(200, BO2_200),
  'mob-of-the-dead': config(220, BO2_220),
  buried: config(220, BO2_220),
  origins: config(150, BO2_150),
};

const BO3_255: RoundMilestone[] = buildRoundMilestones(255, 2500);
const BO3_150: RoundMilestone[] = buildRoundMilestones(150, 1500);
const BO3_220: RoundMilestone[] = buildRoundMilestones(220, 2500);

const BO3: Record<string, MapRoundConfig> = {
  'shadows-of-evil': config(255, BO3_255),
  'the-giant': config(255, BO3_255),
  'der-eisendrache': config(255, BO3_255),
  'zetsubou-no-shima': config(255, BO3_255),
  'gorod-krovi': config(255, BO3_255),
  revelations: config(255, BO3_255),
  'bo3-nacht-der-untoten': config(255, BO3_255),
  'bo3-verruckt': config(255, BO3_255),
  'bo3-shi-no-numa': config(150, BO3_150),
  'bo3-kino-der-toten': config(255, BO3_255),
  'bo3-ascension': config(255, BO3_255),
  'bo3-shangri-la': config(220, BO3_220),
  'bo3-moon': config(255, BO3_255),
  'bo3-origins': config(255, BO3_255),
};

const BO4_250: RoundMilestone[] = buildRoundMilestones(250, 2500);
const BO4_300: RoundMilestone[] = buildRoundMilestones(300, 3000);
const BO4_350: RoundMilestone[] = buildRoundMilestones(350, 3500);

const BO4: Record<string, MapRoundConfig> = {
  'voyage-of-despair': config(250, BO4_250),
  ix: config(250, BO4_250),
  'blood-of-the-dead': config(350, BO4_350),
  classified: config(250, BO4_250),
  'dead-of-the-night': config(300, BO4_300),
  'ancient-evil': config(350, BO4_350),
  'alpha-omega': config(250, BO4_250),
  'tag-der-toten': config(350, BO4_350),
};

const BOCW_935: RoundMilestone[] = buildRoundMilestones(935, 3500);

const BOCW_OUTBREAK_LOW: RoundMilestone[] = buildRoundMilestones(500, 1500);
const BOCW_OUTBREAK: RoundMilestone[] = [
  ...BOCW_OUTBREAK_LOW,
  { round: 1000, xp: 3500 },
  { round: 1500, xp: 6000 },
  { round: 2000, xp: 10000 },
].sort((a, b) => a.round - b.round);

const BOCW: Record<string, MapRoundConfig> = {
  'die-maschine': config(935, BOCW_935),
  'firebase-z': config(935, BOCW_935),
  outbreak: config(2000, BOCW_OUTBREAK),
  'mauer-der-toten': config(935, BOCW_935),
  forsaken: config(935, BOCW_935),
};

const BO6_BO7_999: RoundMilestone[] = buildRoundMilestones(999, 3500);

const BO6: Record<string, MapRoundConfig> = {
  terminus: config(999, BO6_BO7_999),
  'liberty-falls': config(999, BO6_BO7_999),
  'citadelle-des-morts': config(999, BO6_BO7_999),
  'the-tomb': config(999, BO6_BO7_999),
  'shattered-veil': config(999, BO6_BO7_999),
  reckoning: config(999, BO6_BO7_999),
};

const BO7: Record<string, MapRoundConfig> = {
  'ashes-of-the-damned': config(999, BO6_BO7_999),
  'astra-malorum': config(999, BO6_BO7_999),
  mars: config(999, BO6_BO7_999),
  'vandorn-farm': config(999, BO6_BO7_999),
  'exit-115': config(999, BO6_BO7_999),
  'zarya-cosmodrome': config(999, BO6_BO7_999),
};

// IW: ZIS WR 207, cap ~190. Rave WR 255, cap 255.
const IW_190: RoundMilestone[] = buildRoundMilestones(190, 2500);
const IW_255: RoundMilestone[] = buildRoundMilestones(255, 2500);

const IW: Record<string, MapRoundConfig> = {
  'zombies-in-spaceland': config(190, IW_190),
  'rave-in-the-redwoods': config(255, IW_255),
};

const BY_GAME: Record<string, Record<string, MapRoundConfig>> = {
  WAW,
  BO1,
  BO2,
  BO3,
  IW,
  BO4,
  BOCW,
  BO6,
  BO7,
};

export function getRoundConfigForMap(
  mapSlug: string,
  gameShortName: string
): MapRoundConfig | null {
  return BY_GAME[gameShortName]?.[mapSlug] ?? null;
}

export function getRoundCapForMap(
  mapSlug: string,
  gameShortName: string
): number | null | undefined {
  const cfg = getRoundConfigForMap(mapSlug, gameShortName);
  return cfg ? cfg.roundCap : undefined;
}

export function getXpForRoundFromMilestones(
  round: number,
  milestones: RoundMilestone[]
): number {
  let xp = 0;
  for (const m of milestones) {
    if (m.round <= round && m.xp > xp) xp = m.xp;
  }
  return xp;
}
