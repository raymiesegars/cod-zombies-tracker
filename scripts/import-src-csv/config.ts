/**
 * Speedruns.com (SRC) CSV → CZT mapping config.
 * SRC columns: game, map, category, sub_category, time_primary, date, player_count, player_1..4, status.
 * We log by category and map/game: (game, category) → map slug. Rows whose category is "Super X" (e.g. Super 15)
 * are skipped—Super speedruns are not tracked on our site. For valid categories, challenge type (R5, R30, etc.)
 * is inferred from time_primary (speedrun buckets) for that map.
 */

/** SRC game name (normalized: strip "Call of Duty:", trim) → our Game.shortName */
export const SRC_GAME_TO_SHORT_NAME: Record<string, string> = {
  'advanced warfare zombies': 'AW',
  'black ops zombies': 'BO1',
  'black ops ii zombies': 'BO2',
  'black ops iii zombies': 'BO3',
  'black ops 3 category extension': 'BO3',
  'black ops 6 zombies': 'BO6',
  'black ops cold war zombies': 'BOCW',
  'infinite warfare zombies': 'IW',
  'vanguard zombies': 'VANGUARD',
  'world at war zombies': 'WAW',
  'wwii zombies': 'WW2',
  'world war ii zombies': 'WW2',
};

function normalizeSrcGame(s: string): string {
  return (s || '')
    .replace(/^Call of Duty:\s*/i, '')
    .trim()
    .toLowerCase();
}

export function getGameShortNameFromSrc(game: string): string | null {
  const key = normalizeSrcGame(game);
  return SRC_GAME_TO_SHORT_NAME[key] ?? null;
}

/**
 * (game shortName, category) → our map slug.
 * category from SRC is the leaderboard/category name (often the map: "Ascension", "Kino Der Toten", "Shi No Numa").
 */
export const SRC_CATEGORY_TO_MAP_SLUG: Record<string, Record<string, string>> = {
  AW: {
    outbreak: 'aw-outbreak',
  },
  BO1: {
    verrückt: 'bo1-verruckt',
    verruckt: 'bo1-verruckt',
    five: 'five',
    'shi no numa': 'bo1-shi-no-numa',
    'der riese': 'bo1-der-riese',
    'kino der toten': 'kino-der-toten',
    'call of the dead': 'call-of-the-dead',
  },
  BO2: {
    buried: 'buried',
    tranzit: 'tranzit',
    transit: 'tranzit',
    'mob of the dead': 'mob-of-the-dead',
    'die rise': 'die-rise',
    town: 'town',
    'bus depot': 'bus-depot',
    nuketown: 'nuketown-zombies',
    farm: 'farm',
    origins: 'origins',
  },
  BO3: {
    ascension: 'bo3-ascension',
    'shangri-la': 'bo3-shangri-la',
    shangri_la: 'bo3-shangri-la',
    'kino der toten': 'bo3-kino-der-toten',
    kino: 'bo3-kino-der-toten',
    'shi no numa': 'bo3-shi-no-numa',
    origins: 'bo3-origins',
    'zetsubou no shima': 'zetsubou-no-shima',
    'der eisendrache': 'der-eisendrache',
    'the giant': 'the-giant',
    'gorod krovi': 'gorod-krovi',
    revelations: 'revelations',
    'shadows of evil': 'shadows-of-evil',
  },
  BO6: {
    'the tomb': 'the-tomb',
    'liberty falls': 'liberty-falls',
  },
  BOCW: {
    'die maschine': 'die-maschine',
    'firebase z': 'firebase-z',
    outbreak: 'outbreak',
    'mauer der toten': 'mauer-der-toten',
    forsaken: 'forsaken',
  },
  IW: {
    'zombies in spaceland': 'zombies-in-spaceland',
    spaceland: 'zombies-in-spaceland',
  },
  VANGUARD: {
    'shi no numa': 'shi-no-numa-reborn',
  },
  WAW: {
    'shi no numa': 'shi-no-numa',
    verrückt: 'verruckt',
    verruckt: 'verruckt',
    'nacht der untoten': 'nacht-der-untoten',
    nacht: 'nacht-der-untoten',
  },
  WW2: {
    'the final reich': 'the-final-reich',
    'the frozen dawn': 'the-frozen-dawn',
  },
};

function normalizeCategory(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** SRC "Super X" categories (e.g. Super 15) are not tracked on our site; skip these runs. */
export function isUnsupportedSuperCategory(category: string): boolean {
  const n = normalizeCategory(category);
  return n.startsWith('super ');
}

export function getMapSlugFromSrc(game: string, category: string): string | null {
  const shortName = getGameShortNameFromSrc(game);
  if (!shortName) return null;
  const catMap = SRC_CATEGORY_TO_MAP_SLUG[shortName];
  if (!catMap) return null;
  const key = normalizeCategory(category);
  return catMap[key] ?? null;
}

/**
 * Time (seconds) → speedrun challenge type when we don't have explicit category.
 * Buckets: R5 < 5m, R15 5–15m, R30 15–35m, R50 35–70m, R70 70–120m, R100 120–240m, R200+.
 * Returns challenge type that exists on the map (caller filters by map's challenge types).
 */
/** Time (seconds) → speedrun type. Tuned so ~12–35 min typically maps to R30. */
export const TIME_BUCKET_TO_SPEEDRUN_TYPE: { maxSeconds: number; challengeType: string }[] = [
  { maxSeconds: 5 * 60, challengeType: 'ROUND_5_SPEEDRUN' },
  { maxSeconds: 10 * 60, challengeType: 'ROUND_10_SPEEDRUN' },
  { maxSeconds: 10.5 * 60, challengeType: 'ROUND_15_SPEEDRUN' },
  { maxSeconds: 12 * 60, challengeType: 'ROUND_20_SPEEDRUN' },
  { maxSeconds: 45 * 60, challengeType: 'ROUND_30_SPEEDRUN' },
  { maxSeconds: 80 * 60, challengeType: 'ROUND_50_SPEEDRUN' },
  { maxSeconds: 135 * 60, challengeType: 'ROUND_70_SPEEDRUN' },
  { maxSeconds: 260 * 60, challengeType: 'ROUND_100_SPEEDRUN' },
  { maxSeconds: Number.POSITIVE_INFINITY, challengeType: 'ROUND_200_SPEEDRUN' },
];

export function inferSpeedrunChallengeType(
  timeSeconds: number,
  availableTypes: string[]
): string | null {
  const speedrunTypes = new Set(availableTypes);
  for (const { maxSeconds, challengeType } of TIME_BUCKET_TO_SPEEDRUN_TYPE) {
    if (timeSeconds <= maxSeconds && speedrunTypes.has(challengeType)) return challengeType;
  }
  return null;
}

/** Default modifiers when SRC sub_category (variable IDs) is not decoded. Same defaults as ZWR where applicable. */
export const DEFAULTS = {
  bo3GobbleGumMode: 'MEGA' as const,
  bo4ElixirMode: null as string | null,
  bocwSupportMode: 'WITH_SUPPORT' as const,
  rampageInducerUsed: true,
  bo6GobbleGumMode: 'WITH_GOBBLEGUMS' as const,
  bo6SupportMode: 'WITH_SUPPORT' as const,
  bo7SupportMode: 'WITH_SUPPORT' as const,
  bo7GobbleGumMode: 'WITH_GOBBLEGUMS' as const,
  vanguardVoidUsed: true as boolean,
  useFortuneCards: true as boolean,
  useDirectorsCut: false as boolean,
  ww2ConsumablesUsed: true as boolean,
  placeholderProofUrl: 'https://www.speedruns.com/',
};

/** Parse SRC sub_category into variable id → value id. e.g. "2lg396np=5leo55qo; ylp4kjlg=21g9m9oq" */
export function parseSubCategoryVars(subCategory: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = (subCategory || '').split(';').map((p) => p.trim()).filter(Boolean);
  for (const p of parts) {
    const eq = p.indexOf('=');
    if (eq > 0) {
      const key = p.slice(0, eq).trim();
      const val = p.slice(eq + 1).trim();
      if (key && val) out[key] = val;
    }
  }
  return out;
}

/**
 * SRC BO3 gobblegum variable: value ID → our bo3GobbleGumMode.
 * Fill from SRC category variables (e.g. GET /api/v1/games/{id}/variables) when known.
 * Common variable id on BO3 Zombies is often the "GobbleGum" or "Category" variable.
 */
export const SRC_BO3_GOBBLEGUM_VALUE_IDS: Record<string, 'MEGA' | 'CLASSIC_ONLY' | 'NONE'> = {
  // Example (replace with real SRC value IDs when you have them):
  // '5leo55qo': 'MEGA',
  // '814jp01d': 'CLASSIC_ONLY',
  // 'xxxxx': 'NONE',
};

/** SRC variable id used for BO3 gobblegum (category) on bo3zombies. Set when known. */
export const SRC_BO3_GOBBLEGUM_VAR_ID = '2lg396np';

export type ResolvedModifiers = {
  bo3GobbleGumMode: 'MEGA' | 'CLASSIC_ONLY' | 'NONE';
  bo4ElixirMode: string | null;
  bocwSupportMode: 'WITH_SUPPORT' | 'WITHOUT_SUPPORT';
  rampageInducerUsed: boolean;
  bo6GobbleGumMode: string | null;
  bo6SupportMode: string | null;
  bo7SupportMode: string | null;
  bo7GobbleGumMode: string | null;
  vanguardVoidUsed: boolean;
  useFortuneCards: boolean | undefined;
  useDirectorsCut: boolean | undefined;
  ww2ConsumablesUsed: boolean | undefined;
};

export function resolveModifiersFromSubCategory(
  gameShortName: string,
  subCategory: string
): { mods: ResolvedModifiers; summary: string } {
  const vars = parseSubCategoryVars(subCategory);
  const mods: ResolvedModifiers = {
    bo3GobbleGumMode: DEFAULTS.bo3GobbleGumMode,
    bo4ElixirMode: DEFAULTS.bo4ElixirMode,
    bocwSupportMode: DEFAULTS.bocwSupportMode,
    rampageInducerUsed: DEFAULTS.rampageInducerUsed,
    bo6GobbleGumMode: DEFAULTS.bo6GobbleGumMode,
    bo6SupportMode: DEFAULTS.bo6SupportMode,
    bo7SupportMode: DEFAULTS.bo7SupportMode,
    bo7GobbleGumMode: DEFAULTS.bo7GobbleGumMode,
    vanguardVoidUsed: DEFAULTS.vanguardVoidUsed,
    useFortuneCards: DEFAULTS.useFortuneCards,
    useDirectorsCut: DEFAULTS.useDirectorsCut,
    ww2ConsumablesUsed: DEFAULTS.ww2ConsumablesUsed,
  };

  if ((gameShortName === 'BO3' || gameShortName === 'BO1') && SRC_BO3_GOBBLEGUM_VAR_ID) {
    const valueId = vars[SRC_BO3_GOBBLEGUM_VAR_ID];
    const mapped = valueId ? SRC_BO3_GOBBLEGUM_VALUE_IDS[valueId] : null;
    if (mapped) {
      mods.bo3GobbleGumMode = mapped;
    }
  }

  const parts: string[] = [];
  if (gameShortName === 'BO3' || gameShortName === 'BO1') {
    const label =
      mods.bo3GobbleGumMode === 'NONE'
        ? 'no gums'
        : mods.bo3GobbleGumMode === 'CLASSIC_ONLY'
          ? 'classics'
          : 'megas';
    const from = vars[SRC_BO3_GOBBLEGUM_VAR_ID] && SRC_BO3_GOBBLEGUM_VALUE_IDS[vars[SRC_BO3_GOBBLEGUM_VAR_ID]] ? 'SRC' : 'default';
    parts.push(`gums: ${label} (${from})`);
  }
  if (gameShortName === 'BOCW' || gameShortName === 'BO6' || gameShortName === 'BO7') {
    parts.push(`support: ${mods.bocwSupportMode === 'WITH_SUPPORT' ? 'with' : 'without'} (default)`);
    parts.push(`rampage: ${mods.rampageInducerUsed ? 'yes' : 'no'} (default)`);
  }
  if (gameShortName === 'VANGUARD') {
    parts.push(`void: ${mods.vanguardVoidUsed ? 'with' : 'without'} (default)`);
  }
  if (gameShortName === 'IW') {
    parts.push(`fate cards: ${mods.useFortuneCards ? 'yes' : 'no'} (default)`);
  }
  if (gameShortName === 'WW2') {
    parts.push(`consumables: ${mods.ww2ConsumablesUsed ? 'yes' : 'no'} (default)`);
  }
  const summary = parts.length ? parts.join(', ') : 'defaults';
  return { mods, summary };
}
