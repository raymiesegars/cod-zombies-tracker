/**
 * Loader for number_ones.json (world records). Used only in Node (seed/scripts)
 * for achievement tier generation. See docs/WR_ACHIEVEMENT_REBALANCE_PLAN.md.
 *
 * Path: project root number_ones.json (resolved from process.cwd() when running
 * prisma/seed or scripts).
 */

import * as fs from 'fs';
import * as path from 'path';

export interface NumberOnesRecord {
  game: string;
  category: string;
  map: string;
  board_id: string;
  achieved: string;
  platform?: string;
  video?: string;
  added?: string;
  players?: string[];
  player_count: number;
}

/** Raw shape: Record<game, Record<category, Record<map, NumberOnesRecord[]>>> */
export type NumberOnesData = Record<string, Record<string, Record<string, NumberOnesRecord[]>>>;

let cached: NumberOnesData | null = null;

function getDataPath(): string {
  const root = process.cwd();
  const p = path.join(root, 'number_ones.json');
  return p;
}

/**
 * Load and parse number_ones.json from project root. Cached after first load.
 * Returns null if file is missing or invalid.
 */
export function loadNumberOnes(): NumberOnesData | null {
  if (cached !== null) return cached;
  try {
    const p = getDataPath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf-8');
    cached = JSON.parse(raw) as NumberOnesData;
    return cached;
  } catch {
    return null;
  }
}

/** Normalize game key from number_ones (e.g. "bo7") to CZT game shortName (e.g. "BO7"). */
export function normalizeGameKey(game: string): string {
  const lower = game.toLowerCase();
  const map: Record<string, string> = {
    waw: 'WAW',
    bo: 'BO1',
    bo1: 'BO1',
    bo2: 'BO2',
    bo3: 'BO3',
    bo4: 'BO4',
    bocw: 'BOCW',
    bo6: 'BO6',
    bo7: 'BO7',
    iw: 'IW',
    wwii: 'WW2',
    ww2: 'WW2',
    vanguard: 'VANGUARD',
    aw: 'AW',
  };
  return map[lower] ?? game.toUpperCase();
}

/** Normalize map slug from number_ones to CZT map slug (caller can pass overrides). */
export function normalizeMapSlug(game: string, mapSlug: string): string {
  const g = game.toLowerCase();
  const m = mapSlug.toLowerCase();
  if (g === 'bo7' && m === 'bo7-farm') return 'vandorn-farm';
  return mapSlug;
}

/**
 * Parse "achieved" string: either a round number (e.g. "999") or time "MM:SS" / "H:MM:SS".
 * Returns { round } or { timeSeconds }, or null if unparseable.
 */
export function parseAchieved(achieved: string): { round: number } | { timeSeconds: number } | null {
  const t = (achieved ?? '').trim();
  if (!t) return null;
  const roundNum = parseInt(t, 10);
  if (!Number.isNaN(roundNum) && String(roundNum) === t) return { round: roundNum };
  const parts = t.split(':').map((s) => parseInt(s.trim(), 10));
  if (parts.length === 2 && parts.every((n) => !Number.isNaN(n))) {
    const [min, sec] = parts;
    return { timeSeconds: min * 60 + sec };
  }
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    const [h, min, sec] = parts;
    return { timeSeconds: h * 3600 + min * 60 + sec };
  }
  return null;
}

/**
 * Get the best (solo) WR for a given game, category, map, and optional board variant.
 * variant: substring to match in board_id (e.g. "w-support", "n-support", "no-gobblegum", "all-gobblegum").
 * Returns the first matching record with player_count === 1, or the first solo record for that game/category/map if variant is not specified.
 */
export function getSoloWR(
  game: string,
  category: string,
  mapSlug: string,
  variant?: string
): NumberOnesRecord | null {
  const data = loadNumberOnes();
  if (!data) return null;
  const byCategory = data[game.toLowerCase()]?.[category];
  if (!byCategory) return null;
  const records = byCategory[mapSlug] ?? byCategory[mapSlug.replace(/-/g, '_')];
  if (!Array.isArray(records)) return null;
  const solo = records.filter((r) => r.player_count === 1);
  if (variant) {
    const match = solo.find((r) => r.board_id && r.board_id.includes(variant));
    return match ?? null;
  }
  return solo[0] ?? null;
}

/**
 * Get all solo WRs for a game/category/map (one per board variant). Useful for listing all bands.
 */
export function getAllSoloWRs(
  game: string,
  category: string,
  mapSlug: string
): NumberOnesRecord[] {
  const data = loadNumberOnes();
  if (!data) return [];
  const byCategory = data[game.toLowerCase()]?.[category];
  if (!byCategory) return [];
  const records = byCategory[mapSlug] ?? byCategory[mapSlug.replace(/-/g, '_')];
  if (!Array.isArray(records)) return [];
  return records.filter((r) => r.player_count === 1);
}

/**
 * 4% rule: round WR → achievement round = floor(WR * 0.96).
 */
export function roundWRToAchievementRound(wrRound: number): number {
  return Math.floor(wrRound * 0.96);
}

/**
 * 4% rule: time WR (seconds) → achievement time = WR * 1.04 (4% slower).
 */
export function timeWRToAchievementSeconds(wrTimeSeconds: number): number {
  return Math.round(wrTimeSeconds * 1.04);
}
