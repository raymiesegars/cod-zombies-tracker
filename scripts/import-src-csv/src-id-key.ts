/**
 * Loads src_codzombies_id_key.json and resolves SRC variable=value IDs to CZT modifiers.
 * Variable names and value labels from the JSON are matched to set gums, rampage, support, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseSubCategoryVars, DEFAULTS, type ResolvedModifiers } from './config';

export interface SrcIdKeyVariable {
  name: string;
  game_id?: string;
  game_name?: string;
  values: Record<string, string>;
}

export interface SrcIdKey {
  games?: Record<string, string>;
  categories?: Record<string, string>;
  levels?: Record<string, string>;
  platforms?: Record<string, string>;
  variables?: Record<string, SrcIdKeyVariable>;
}

const ID_KEY_PATH = 'src-csvs/src_codzombies_id_key.json';

export function loadSrcIdKey(projectRoot: string): SrcIdKey | null {
  const fullPath = path.join(projectRoot, ID_KEY_PATH);
  if (!fs.existsSync(fullPath)) return null;
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw) as SrcIdKey;
  } catch {
    return null;
  }
}

function norm(s: string): string {
  return (s || '').trim().toLowerCase();
}

function labelMatches(label: string, ...options: string[]): boolean {
  const n = norm(label);
  return options.some((o) => n === norm(o) || n.includes(norm(o)));
}

/**
 * Resolve modifiers from sub_category using the SRC id key (variables).
 * For each var_id=value_id in sub_category, look up the variable name and value label.
 * Match by variable name (e.g. "Gobblegum Loadout", "Rampage Inducer") and value label (e.g. "Megas", "Classics").
 */
export function resolveModifiersWithIdKey(
  gameShortName: string,
  subCategory: string,
  idKey: SrcIdKey | null
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

  const summaryParts: string[] = [];
  const idKeyVars = idKey?.variables ?? {};

  for (const [varId, valueId] of Object.entries(vars)) {
    const v = idKeyVars[varId];
    if (!v?.values) continue;
    const label = v.values[valueId];
    if (!label) continue;
    const name = norm(v.name);

    if (name === 'gobblegum loadout' && (gameShortName === 'BO3' || gameShortName === 'BO1')) {
      if (labelMatches(label, 'Megas', 'Mega')) {
        mods.bo3GobbleGumMode = 'MEGA';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: megas (SRC)');
      } else if (labelMatches(label, 'Classics', 'Classic')) {
        mods.bo3GobbleGumMode = 'CLASSIC_ONLY';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: classics (SRC)');
      } else if (labelMatches(label, 'No Gums', 'No Gum')) {
        mods.bo3GobbleGumMode = 'NONE';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: no gums (SRC)');
      }
    }

    if (name === 'rampage inducer' && (gameShortName === 'BO6' || gameShortName === 'BOCW' || gameShortName === 'BO7')) {
      if (labelMatches(label, 'Rampage ON', 'Rampage')) {
        mods.rampageInducerUsed = true;
        if (!summaryParts.some((s) => s.startsWith('rampage:'))) summaryParts.push('rampage: yes (SRC)');
      } else if (labelMatches(label, 'Rampage OFF')) {
        mods.rampageInducerUsed = false;
        if (!summaryParts.some((s) => s.startsWith('rampage:'))) summaryParts.push('rampage: no (SRC)');
      }
    }

    if (name === 'rampage' && gameShortName === 'VANGUARD') {
      if (labelMatches(label, 'Rampage')) {
        mods.rampageInducerUsed = true;
        if (!summaryParts.some((s) => s.startsWith('rampage:'))) summaryParts.push('rampage: yes (SRC)');
      } else if (labelMatches(label, 'Classic')) {
        mods.rampageInducerUsed = false;
        if (!summaryParts.some((s) => s.startsWith('rampage:'))) summaryParts.push('rampage: no (SRC)');
      }
    }

    if (name === 'gobblegums ruleset' && gameShortName === 'BO6') {
      if (labelMatches(label, 'No Gums', 'No Gum')) {
        mods.bo6GobbleGumMode = 'NO_GOBBLEGUMS';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: no (SRC)');
      } else if (labelMatches(label, 'All Gums')) {
        mods.bo6GobbleGumMode = 'WITH_GOBBLEGUMS';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: all (SRC)');
      } else if (labelMatches(label, 'Classic Gums')) {
        mods.bo6GobbleGumMode = 'WITH_GOBBLEGUMS';
        if (!summaryParts.some((s) => s.startsWith('gums:'))) summaryParts.push('gums: classic (SRC)');
      }
    }

    if (name === 'consumables' && gameShortName === 'WW2') {
      if (labelMatches(label, 'No Consumables', 'No mods No Consumables')) {
        mods.ww2ConsumablesUsed = false;
        if (!summaryParts.some((s) => s.startsWith('consumables:'))) summaryParts.push('consumables: no (SRC)');
      } else if (labelMatches(label, 'All Consumables', 'Yes mods Yes consumables')) {
        mods.ww2ConsumablesUsed = true;
        if (!summaryParts.some((s) => s.startsWith('consumables:'))) summaryParts.push('consumables: yes (SRC)');
      }
    }

    if (name === 'fate & fortune cards' && gameShortName === 'IW') {
      if (labelMatches(label, 'No FF Cards', 'No Cards')) {
        mods.useFortuneCards = false;
        if (!summaryParts.some((s) => s.startsWith('fate'))) summaryParts.push('fate cards: no (SRC)');
      } else if (labelMatches(label, 'FF Cards', 'All Cards')) {
        mods.useFortuneCards = true;
        if (!summaryParts.some((s) => s.startsWith('fate'))) summaryParts.push('fate cards: yes (SRC)');
      } else if (labelMatches(label, 'Fate Card Only')) {
        mods.useFortuneCards = false;
        if (!summaryParts.some((s) => s.startsWith('fate'))) summaryParts.push('fate cards: fate only (SRC)');
      }
    }

    if (name === 'directors cut' && gameShortName === 'IW') {
      if (labelMatches(label, 'No DC')) {
        mods.useDirectorsCut = false;
        if (!summaryParts.some((s) => s.startsWith('DC:'))) summaryParts.push('DC: no (SRC)');
      } else if (norm(label) === 'dc' || labelMatches(label, 'Directors Cut')) {
        mods.useDirectorsCut = true;
        if (!summaryParts.some((s) => s.startsWith('DC:'))) summaryParts.push('DC: yes (SRC)');
      }
    }
  }

  if (summaryParts.length === 0) {
    if (gameShortName === 'BO3' || gameShortName === 'BO1') {
      const label = mods.bo3GobbleGumMode === 'NONE' ? 'no gums' : mods.bo3GobbleGumMode === 'CLASSIC_ONLY' ? 'classics' : 'megas';
      summaryParts.push(`gums: ${label} (default)`);
    }
    if (gameShortName === 'BOCW' || gameShortName === 'BO6' || gameShortName === 'BO7') {
      summaryParts.push(`support: ${mods.bocwSupportMode === 'WITH_SUPPORT' ? 'with' : 'without'} (default)`);
      summaryParts.push(`rampage: ${mods.rampageInducerUsed ? 'yes' : 'no'} (default)`);
    }
    if (gameShortName === 'VANGUARD') {
      summaryParts.push(`rampage: ${mods.rampageInducerUsed ? 'yes' : 'no'} (default)`);
      summaryParts.push(`void: ${mods.vanguardVoidUsed ? 'with' : 'without'} (default)`);
    }
    if (gameShortName === 'IW') {
      summaryParts.push(`fate cards: ${mods.useFortuneCards ? 'yes' : 'no'} (default)`);
      summaryParts.push(`DC: ${mods.useDirectorsCut ? 'yes' : 'no'} (default)`);
    }
    if (gameShortName === 'WW2') {
      summaryParts.push(`consumables: ${mods.ww2ConsumablesUsed ? 'yes' : 'no'} (default)`);
    }
    if (summaryParts.length === 0) summaryParts.push('defaults');
  }

  return { mods, summary: summaryParts.join(', ') };
}

const ROUND_LABEL_TO_CHALLENGE_TYPE: Record<string, string> = {
  'round 5': 'ROUND_5_SPEEDRUN',
  'round 10': 'ROUND_10_SPEEDRUN',
  'round 15': 'ROUND_15_SPEEDRUN',
  'round 20': 'ROUND_20_SPEEDRUN',
  'round 30': 'ROUND_30_SPEEDRUN',
  'round 50': 'ROUND_50_SPEEDRUN',
  'round 70': 'ROUND_70_SPEEDRUN',
  'round 100': 'ROUND_100_SPEEDRUN',
  'round 200': 'ROUND_200_SPEEDRUN',
  'round 255': 'ROUND_255_SPEEDRUN',
  'round 935': 'ROUND_935_SPEEDRUN',
  'round 999': 'ROUND_999_SPEEDRUN',
};

/**
 * Resolve speedrun challenge type from sub_category using the id key.
 * SRC stores the actual round (Round 5, Round 15, Round 30) in a "Category" or "Round Number" variable.
 * We were previously inferring from time only, which wrongly turned e.g. a 13min "Round 15" run into R30.
 */
export function resolveSpeedrunTypeFromSubCategory(
  subCategory: string,
  idKey: SrcIdKey | null
): string | null {
  const vars = parseSubCategoryVars(subCategory);
  const idKeyVars = idKey?.variables ?? {};
  for (const [varId, valueId] of Object.entries(vars)) {
    const v = idKeyVars[varId];
    if (!v?.values) continue;
    const label = v.values[valueId];
    if (!label) continue;
    const varName = norm(v.name);
    const labelNorm = norm(label);
    if (varName !== 'category' && varName !== 'round number') continue;
    const challengeType = ROUND_LABEL_TO_CHALLENGE_TYPE[labelNorm];
    if (challengeType) return challengeType;
    const roundMatch = /^round\s+(\d+)/i.exec(label.trim());
    if (roundMatch) {
      const key = `round ${roundMatch[1]}`;
      const fromDigits = ROUND_LABEL_TO_CHALLENGE_TYPE[key];
      if (fromDigits) return fromDigits;
    }
  }
  for (const [varId, valueId] of Object.entries(vars)) {
    const v = idKeyVars[varId];
    if (!v?.values) continue;
    const label = v.values[valueId];
    if (!label) continue;
    const labelNorm = norm(label);
    if (labelNorm === 'easter egg' || labelNorm === 'any% ee') return 'EASTER_EGG_SPEEDRUN';
    if (labelNorm === 'main quest') return 'EASTER_EGG_SPEEDRUN';
    if (labelNorm.startsWith('main quest') && !labelNorm.includes('obsolete'))
      return 'EASTER_EGG_SPEEDRUN';
  }
  for (const [varId, valueId] of Object.entries(vars)) {
    const v = idKeyVars[varId];
    if (!v?.values) continue;
    const label = v.values[valueId];
    if (!label) continue;
    const labelNorm = norm(label);
    const challengeType = ROUND_LABEL_TO_CHALLENGE_TYPE[labelNorm];
    if (challengeType) return challengeType;
    const roundMatch = /^round\s+(\d+)/i.exec(label.trim());
    if (roundMatch) {
      const key = `round ${roundMatch[1]}`;
      const fromDigits = ROUND_LABEL_TO_CHALLENGE_TYPE[key];
      if (fromDigits) return fromDigits;
    }
  }
  return null;
}
