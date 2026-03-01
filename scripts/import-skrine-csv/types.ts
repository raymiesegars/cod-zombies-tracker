/**
 * Types for the ZWR/Skrine-style CSV import.
 * CSV columns: game, map, record, sub_record, platform, main_video, other_links,
 * game_type, achieved, player_count, player_1, player_2, player_3, player_4,
 * is_world_record, added
 */

export type SourceGameCode =
  | 'aw'
  | 'bo'
  | 'bo2'
  | 'bo3'
  | 'bo4'
  | 'bocw'
  | 'bo6'
  | 'iw'
  | 'vanguard'
  | 'wwii'
  | 'community'
  | 'custom';

export interface CsvRow {
  game: string;
  map: string;
  record: string;
  sub_record: string;
  platform: string;
  main_video: string;
  other_links: string;
  game_type: string;
  achieved: string;
  player_count: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  is_world_record: string;
  added: string;
}

/** One row from the CSV (normalized: trimmed, lowercased where needed). */
export interface ParsedCsvRow extends CsvRow {
  _rowIndex: number; // 1-based for report
}

/** Result of mapping record+sub_record to CZT challenge + modifiers. */
export interface ChallengeMapping {
  challengeType: string;
  /** Modifiers to set on ChallengeLog / EasterEggLog (e.g. bo3GobbleGumMode, difficulty). */
  modifiers: Record<string, unknown>;
  /** If true, also create an EasterEggLog for main quest EE on this map. */
  createEasterEggLog?: boolean;
}

/** Report row for output CSV. */
export interface ReportRow {
  csvRowIndex: number;
  status: 'imported' | 'skipped' | 'updated' | 'error';
  game: string;
  map: string;
  record: string;
  sub_record: string;
  message: string;
  /** If imported: challenge log id(s); if ee-speedrun, may have two. */
  logIds?: string[];
}
