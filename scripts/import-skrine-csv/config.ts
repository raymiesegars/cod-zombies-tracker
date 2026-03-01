/**
 * Central mapping config for ZWR/Skrine CSV → CZT.
 * Edit this file to add games, map slug overrides, or record→challenge mappings.
 */

// ---------------------------------------------------------------------------
// GAME CODES: source CSV "game" value → CZT Game.shortName
// ---------------------------------------------------------------------------
export const GAME_CODES: Record<string, string> = {
  aw: 'AW',
  bo: 'BO1',
  bo2: 'BO2',
  bo3: 'BO3',
  bo4: 'BO4',
  bocw: 'BOCW',
  bo6: 'BO6',
  iw: 'IW',
  vanguard: 'VANGUARD',
  wwii: 'WW2',
  // community, custom are skipped (no entry)
};

/** Games we skip entirely (no import). */
export const SKIP_GAMES = new Set<string>(['community', 'custom']);

// ---------------------------------------------------------------------------
// MAP SLUG OVERRIDES (per-game): source CSV game + map slug → CZT map slug
// Key = game code (aw, bo, bo3, bo4, iw, wwii, etc.). Value = object of
// source map slug → CZT map slug (or null to skip). Use this when the same
// slug means different maps in different games (e.g. bo|shi-no-numa vs bo3|shi-no-numa).
// ---------------------------------------------------------------------------
export const MAP_SLUG_BY_GAME: Record<string, Record<string, string | null>> = {
  // AW: CZT uses aw- prefix
  aw: {
    outbreak: 'aw-outbreak',
    descent: 'aw-descent',
    carrier: 'aw-carrier',
    infection: 'aw-infection',
  },
  // BO1: CZT uses bo1- prefix for Rezurrection / shared names
  bo: {
    'shi-no-numa': 'bo1-shi-no-numa',
    verruckt: 'bo1-verruckt',
  },
  // BO3: base maps match by name; Zombie Chronicles use bo3- prefix
  bo3: {
    'shangri-la': 'bo3-shangri-la',
    'nacht-der-untoten': 'bo3-nacht-der-untoten',
    'kino-der-toten': 'bo3-kino-der-toten',
    moon: 'bo3-moon',
    origins: 'bo3-origins',
    ascension: 'bo3-ascension',
    'shi-no-numa': 'bo3-shi-no-numa',
  },
  // BO4: gauntlet / board names in CSV → CZT map slug
  bo4: {
    'super-blood-wolf-moon': 'tag-der-toten',
    'veni-vidi-zombie': 'ix',
    hellcatraz: 'blood-of-the-dead',
    'an-ice-day-in-hell': 'alpha-omega',
    'deathcon-five': 'classified',
    'duck-and-cover': 'classified',
    'labours-of-hercules': 'ancient-evil',
  },
  // BOCW: super-ee is not a map
  bocw: {
    'bocw-super-ee': null,
  },
  // IW: source short names and "beast-from-beyond" vs CZT "the-beast-from-beyond"
  iw: {
    spaceland: 'zombies-in-spaceland',
    'beast-from-beyond': 'the-beast-from-beyond',
  },
  // Vanguard: source slugs differ for some maps
  vanguard: {
    'shi-no-numa-van': 'shi-no-numa-reborn',
    'van-archon': 'the-archon',
  },
  // WW2: CSV "frozen-dawn" → CZT "the-frozen-dawn"
  wwii: {
    'frozen-dawn': 'the-frozen-dawn',
  },
};

// ---------------------------------------------------------------------------
// MAP SLUG OVERRIDES (global fallback): source "map" slug → CZT map slug
// Only when the same slug is used across games or no per-game entry exists.
// ---------------------------------------------------------------------------
export const MAP_SLUG_OVERRIDES: Record<string, string | null> = {
  'firebase': 'firebase-z',
  'die-maschine': 'die-maschine',
  'mauer-der-toten': 'mauer-der-toten',
  'forsaken': 'forsaken',
};

// ---------------------------------------------------------------------------
// RECORD + SUB_RECORD → Challenge type and modifiers
// Key: `${record}|${sub_record}` (lowercase, empty sub_record as "").
// value: { challengeType, modifiers, createEasterEggLog? }
// ---------------------------------------------------------------------------
export interface RecordMappingResult {
  challengeType: string;
  modifiers: Record<string, unknown>;
  createEasterEggLog?: boolean;
}

/** Map record (+ optional sub_record) to CZT challenge type and modifiers. */
export function getRecordMapping(record: string, subRecord: string): RecordMappingResult | null {
  const r = record.toLowerCase().trim();
  const s = (subRecord || '').toLowerCase().trim();
  const key = `${r}|${s}`;

  const exact = RECORD_MAPPINGS[key];
  if (exact) return exact;

  // Fallback: try record only (any sub_record)
  const fallback = RECORD_MAPPINGS[`${r}|*`];
  if (fallback) {
    const mods = { ...fallback.modifiers };
    applySubRecordModifiers(r, s, mods);
    return { ...fallback, modifiers: mods };
  }

  return null;
}

/** Apply sub_record to modifier object (e.g. classic-gobblegum → bo3GobbleGumMode). */
function applySubRecordModifiers(record: string, subRecord: string, mods: Record<string, unknown>): void {
  if (!subRecord) return;

  // BO3
  if (subRecord === 'classic-gobblegum') mods.bo3GobbleGumMode = 'CLASSIC_ONLY';
  else if (subRecord === 'no-gobblegum') mods.bo3GobbleGumMode = 'NONE';
  else if (subRecord === 'all-gobblegum') mods.bo3GobbleGumMode = 'MEGA';
  else if (subRecord === 'no-aat') mods.bo3AatUsed = false;

  // BO4
  if (subRecord === 'all-elixirs') mods.bo4ElixirMode = 'ALL_ELIXIRS_TALISMANS';
  else if (subRecord === 'classic-elixirs-only') mods.bo4ElixirMode = 'CLASSIC_ONLY';
  else if (subRecord === 'hc-all-elixirs' || subRecord === 'hc-classic-elixirs-only') mods.bo4ElixirMode = 'CLASSIC_ONLY'; // HC = hardcore, use classic
  else if (subRecord === 'realistic' || subRecord.includes('realistic')) mods.difficulty = 'REALISTIC';
  else if (subRecord === 'hardcore') mods.difficulty = 'HARDCORE';
  else if (subRecord === 'casual') mods.difficulty = 'CASUAL';

  // BOCW
  if (subRecord === 'inducer') mods.rampageInducerUsed = true;
  else if (subRecord === 'non-inducer') mods.rampageInducerUsed = false;
  else if (subRecord === 'without-support') mods.bocwSupportMode = 'WITHOUT_SUPPORT';
  else if (subRecord === 'with-support') mods.bocwSupportMode = 'WITH_SUPPORT';

  // IW
  if (subRecord === 'fate-cards') mods.useFortuneCards = false;
  else if (subRecord === 'all-cards') mods.useFortuneCards = true;
  else if (subRecord === 'dc-all-cards') {
    mods.useFortuneCards = true;
    mods.useDirectorsCut = true;
  }

  // WW2
  if (subRecord === 'with-cons') mods.ww2ConsumablesUsed = true;
  else if (subRecord === 'no-cons') mods.ww2ConsumablesUsed = false;

  // Vanguard
  if (subRecord === 'with-void') mods.vanguardVoidUsed = true;
  else if (subRecord === 'without-void') mods.vanguardVoidUsed = false;

  // First room variant (AW Carrier, Verrückt, Buried)
  if (subRecord === 'mk14-side') mods.firstRoomVariant = 'MK14_SIDE';
  else if (subRecord === 'bulldog-side') mods.firstRoomVariant = 'BULLDOG_SIDE';
  else if (subRecord === 'mixed') mods.firstRoomVariant = 'MIXED';
}

const RECORD_MAPPINGS: Record<string, RecordMappingResult> = {
  // ---- Round-based ----
  'first-room|': { challengeType: 'STARTING_ROOM', modifiers: {} },
  'first-room|*': { challengeType: 'STARTING_ROOM', modifiers: {} },
  'high-round|': { challengeType: 'HIGHEST_ROUND', modifiers: {} },
  'high-round|*': { challengeType: 'HIGHEST_ROUND', modifiers: {} },
  'high-round-hc|': { challengeType: 'HIGHEST_ROUND', modifiers: { difficulty: 'HARDCORE' } },
  'no-power|': { challengeType: 'NO_POWER', modifiers: {} },
  'no-power|*': { challengeType: 'NO_POWER', modifiers: {} },
  'flawless|': { challengeType: 'NO_DOWNS', modifiers: {} },
  'flawless|*': { challengeType: 'NO_DOWNS', modifiers: {} },
  'no-perks|': { challengeType: 'NO_PERKS', modifiers: {} },
  'no-perks|*': { challengeType: 'NO_PERKS', modifiers: {} },
  'no-jug|': { challengeType: 'NO_JUG', modifiers: {} },
  'no-jug|*': { challengeType: 'NO_JUG', modifiers: {} },
  'no-armor|': { challengeType: 'NO_ARMOR', modifiers: {} },
  'no-blitz|': { challengeType: 'NO_BLITZ', modifiers: {} },
  'wwii-no-armor|': { challengeType: 'NO_ARMOR', modifiers: {} },
  'no-tuff-nuff|': { challengeType: 'NO_PERKS', modifiers: {} },
  'no-tuff-nuff|*': { challengeType: 'NO_PERKS', modifiers: {} },
  'iw-no-perks|': { challengeType: 'NO_PERKS', modifiers: {} },
  'iw-no-perks|*': { challengeType: 'NO_PERKS', modifiers: {} },
  'no-aat|': { challengeType: 'NO_ATS', modifiers: { bo3AatUsed: false } },
  'no-aat|no-gobblegum': { challengeType: 'NO_ATS', modifiers: { bo3AatUsed: false, bo3GobbleGumMode: 'NONE' } },
  'no-aat|classic-gobblegum': { challengeType: 'NO_ATS', modifiers: { bo3AatUsed: false, bo3GobbleGumMode: 'CLASSIC_ONLY' } },
  'flawless-hc|': { challengeType: 'NO_DOWNS', modifiers: { difficulty: 'HARDCORE' } },
  'flawless-hc|*': { challengeType: 'NO_DOWNS', modifiers: { difficulty: 'HARDCORE' } },
  'high-round-hc|*': { challengeType: 'HIGHEST_ROUND', modifiers: { difficulty: 'HARDCORE' } },
  'no-blitz|*': { challengeType: 'NO_BLITZ', modifiers: {} },
  'wwii-no-armor|*': { challengeType: 'NO_ARMOR', modifiers: {} },

  // ---- Speedruns (round) ----
  '30-speedrun|': { challengeType: 'ROUND_30_SPEEDRUN', modifiers: {} },
  '30-speedrun|*': { challengeType: 'ROUND_30_SPEEDRUN', modifiers: {} },
  '50-speedrun|': { challengeType: 'ROUND_50_SPEEDRUN', modifiers: {} },
  '50-speedrun|*': { challengeType: 'ROUND_50_SPEEDRUN', modifiers: {} },
  '70-speedrun|': { challengeType: 'ROUND_70_SPEEDRUN', modifiers: {} },
  '70-speedrun|*': { challengeType: 'ROUND_70_SPEEDRUN', modifiers: {} },
  '100-speedrun|': { challengeType: 'ROUND_100_SPEEDRUN', modifiers: {} },
  '100-speedrun|*': { challengeType: 'ROUND_100_SPEEDRUN', modifiers: {} },
  '200-speedrun|': { challengeType: 'ROUND_200_SPEEDRUN', modifiers: {} },
  '10-speedrun|': { challengeType: 'ROUND_10_SPEEDRUN', modifiers: {} },
  '10-speedrun|*': { challengeType: 'ROUND_10_SPEEDRUN', modifiers: {} },
  '20-speedrun|': { challengeType: 'ROUND_20_SPEEDRUN', modifiers: {} },
  '20-speedrun|*': { challengeType: 'ROUND_20_SPEEDRUN', modifiers: {} },

  // ---- Exfil (BOCW / Vanguard) ----
  'exfil-speedrun|round-11': { challengeType: 'EXFIL_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|round-21': { challengeType: 'EXFIL_R21_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|round-5': { challengeType: 'EXFIL_R5_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|round-10': { challengeType: 'EXFIL_R10_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|round-20': { challengeType: 'EXFIL_R20_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|rage-inducer': { challengeType: 'EXFIL_SPEEDRUN', modifiers: { rampageInducerUsed: true } },
  'exfil-speedrun|rage-inducer-21': { challengeType: 'EXFIL_R21_SPEEDRUN', modifiers: { rampageInducerUsed: true } },
  'exfil-speedrun|inducer': { challengeType: 'EXFIL_SPEEDRUN', modifiers: { rampageInducerUsed: true } },
  'exfil-speedrun|non-inducer': { challengeType: 'EXFIL_SPEEDRUN', modifiers: { rampageInducerUsed: false } },
  'exfil-speedrun|': { challengeType: 'EXFIL_SPEEDRUN', modifiers: {} },
  'exfil-speedrun|*': { challengeType: 'EXFIL_SPEEDRUN', modifiers: {} },

  // ---- EE speedrun: create both ChallengeLog (EASTER_EGG_SPEEDRUN) and EasterEggLog ----
  'ee-speedrun|': { challengeType: 'EASTER_EGG_SPEEDRUN', modifiers: {}, createEasterEggLog: true },
  'ee-speedrun|*': { challengeType: 'EASTER_EGG_SPEEDRUN', modifiers: {}, createEasterEggLog: true },
  'super-ee-speedrun|': { challengeType: 'EASTER_EGG_SPEEDRUN', modifiers: {}, createEasterEggLog: false }, // Super EE: challenge only, no single-map EE log

  // ---- Gauntlet (BO4) → treat as custom or highest round; many boards = different. Use PURIST or HIGHEST_ROUND with difficulty. ----
  'gauntlet|': { challengeType: 'HIGHEST_ROUND', modifiers: {} },
  'gauntlet|*': { challengeType: 'HIGHEST_ROUND', modifiers: {} },

  // ---- BO6 / other ----
  'exfil-speedrun|round-11-no-gums': { challengeType: 'EXFIL_SPEEDRUN', modifiers: { bo6GobbleGumMode: 'NO_GOBBLEGUMS' } },
  'exfil-speedrun|rage-inducer-n-gum': { challengeType: 'EXFIL_SPEEDRUN', modifiers: { rampageInducerUsed: true } },
};

// ---------------------------------------------------------------------------
// DEFAULTS (when CSV or mapping doesn't specify)
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  /** Proof URL when main_video is empty (verified runs must have proof). */
  placeholderProofUrl: 'https://zwr.gg/',
  /** BO4 difficulty when not inferred. */
  bo4Difficulty: 'NORMAL' as const,
  /** BO3 GobbleGum when not inferred. */
  bo3GobbleGumMode: 'CLASSIC_ONLY' as const,
  /** BOCW support mode when not inferred. */
  bocwSupportMode: 'WITHOUT_SUPPORT' as const,
  /** Rampage Inducer when not inferred. */
  rampageInducerUsed: false,
  /** BO6 support mode when not inferred. */
  bo6SupportMode: 'NO_SUPPORT' as const,
};
