/**
 * One-off: move in-progress Easter egg entries to base, then clear in-progress.
 * Run: node prisma/merge-easter-eggs.js
 */
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'seed-easter-eggs-base.ts');
const inProgressPath = path.join(__dirname, 'seed-easter-eggs-in-progress.ts');

const baseContent = fs.readFileSync(basePath, 'utf8');
const inProgressContent = fs.readFileSync(inProgressPath, 'utf8');

// Extract array entries from in-progress (from first "  //" or "  {" after "= [" to last "  }," before "];")
const inProgressLines = inProgressContent.split('\n');
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < inProgressLines.length; i++) {
  const line = inProgressLines[i];
  if (line === 'export const SPECIFIC_EASTER_EGGS_IN_PROGRESS: SpecificEasterEgg[] = [') {
    startIdx = i + 1;
    break;
  }
}
for (let i = inProgressLines.length - 1; i >= 0; i--) {
  if (/^\s*\}\s*,?\s*$/.test(inProgressLines[i]) && i > startIdx) {
    endIdx = i;
    break;
  }
}
if (startIdx < 0 || endIdx < 0) {
  console.error('Could not find in-progress array boundaries');
  process.exit(1);
}
const entriesBlock = inProgressLines.slice(startIdx, endIdx + 1).join('\n');

// Base: replace the final "  },\n];" with "  },\n\n" + entries + "\n];"
const baseLastEntryClose = baseContent.lastIndexOf('  },');
const baseClosing = baseContent.indexOf('];', baseLastEntryClose);
if (baseLastEntryClose < 0 || baseClosing < 0) {
  console.error('Could not find base array end');
  process.exit(1);
}
const baseBefore = baseContent.slice(0, baseLastEntryClose + 4); // include "  },"
const baseAfter = baseContent.slice(baseClosing);
const newBase = baseBefore + '\n\n  // ——— BO4 & Nuketown Zombies (moved from in-progress) ———\n\n' + entriesBlock + '\n' + baseAfter;

fs.writeFileSync(basePath, newBase, 'utf8');
console.log('Appended in-progress entries to base file.');

// In-progress: replace with header + empty array
const newInProgress = `/**
 * In-progress Easter Egg seed data: add new map EEs here while you work on them.
 * Run \`pnpm run db:seed:easter-eggs:in-progress\` to re-seed only these EEs for fast iteration.
 * When done, move entries to seed-easter-eggs-base.ts and clear this array.
 *
 * Next up: Cold War (BOCW)
 */

import type { SpecificEasterEgg } from './seed-easter-egg-types';

export const SPECIFIC_EASTER_EGGS_IN_PROGRESS: SpecificEasterEgg[] = [
];
`;

fs.writeFileSync(inProgressPath, newInProgress, 'utf8');
console.log('Cleared in-progress file. Ready for Cold War.');
console.log('Run: pnpm run db:seed:easter-eggs');