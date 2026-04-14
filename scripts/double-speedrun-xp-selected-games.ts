#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2]!.replace(/^["']|["']$/g, '').trim();
    process.env[match[1]!] = value;
  }
}

type Args = {
  dryRun: boolean;
  games: Set<string>;
  sampleLimit: number;
};

type Candidate = {
  id: string;
  name: string;
  slug: string;
  xpReward: number;
  gameShortName: string;
  challengeType: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let dryRun = true;
  let games = new Set(['WAW', 'BO1', 'BO2', 'WW2']);
  let sampleLimit = 20;

  for (const a of args) {
    if (a === '--apply') dryRun = false;
    else if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--games=')) {
      const parsed = a
        .slice(8)
        .split(',')
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);
      if (parsed.length > 0) games = new Set(parsed);
    } else if (a.startsWith('--sample-limit=')) {
      const n = parseInt(a.slice(15).trim(), 10);
      if (!Number.isNaN(n) && n > 0) sampleLimit = n;
    }
  }

  return { dryRun, games, sampleLimit };
}

function parseChallengeType(criteria: unknown): string | null {
  if (!criteria || typeof criteria !== 'object') return null;
  const value = (criteria as Record<string, unknown>).challengeType;
  return typeof value === 'string' ? value : null;
}

function isTimeSpeedrunChallengeType(challengeType: string): boolean {
  return challengeType.endsWith('_SPEEDRUN');
}

async function main() {
  const { dryRun, games, sampleLimit } = parseArgs();
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Games: ${Array.from(games).join(', ')}`);

  const achievements = await prisma.achievement.findMany({
    where: {
      isActive: true,
      OR: [
        { map: { game: { shortName: { in: Array.from(games) } } } },
        { easterEgg: { map: { game: { shortName: { in: Array.from(games) } } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      xpReward: true,
      criteria: true,
      map: { select: { game: { select: { shortName: true } } } },
      easterEgg: { select: { map: { select: { game: { select: { shortName: true } } } } } },
    },
  });

  const candidates: Candidate[] = [];
  for (const a of achievements) {
    const challengeType = parseChallengeType(a.criteria);
    if (!challengeType || !isTimeSpeedrunChallengeType(challengeType)) continue;
    const gameShortName = a.map?.game.shortName ?? a.easterEgg?.map.game.shortName ?? null;
    if (!gameShortName || !games.has(gameShortName)) continue;
    candidates.push({
      id: a.id,
      name: a.name,
      slug: a.slug,
      xpReward: a.xpReward,
      gameShortName,
      challengeType,
    });
  }

  if (candidates.length === 0) {
    console.log('No matching speedrun achievements found.');
    return;
  }

  let beforeTotal = 0;
  let afterTotal = 0;
  const byGame = new Map<string, { count: number; beforeXp: number; afterXp: number }>();
  const byType = new Map<string, { count: number; beforeXp: number; afterXp: number }>();

  for (const c of candidates) {
    const nextXp = c.xpReward * 2;
    beforeTotal += c.xpReward;
    afterTotal += nextXp;

    const g = byGame.get(c.gameShortName) ?? { count: 0, beforeXp: 0, afterXp: 0 };
    g.count++;
    g.beforeXp += c.xpReward;
    g.afterXp += nextXp;
    byGame.set(c.gameShortName, g);

    const t = byType.get(c.challengeType) ?? { count: 0, beforeXp: 0, afterXp: 0 };
    t.count++;
    t.beforeXp += c.xpReward;
    t.afterXp += nextXp;
    byType.set(c.challengeType, t);
  }

  console.log(`\nMatched achievements: ${candidates.length}`);
  console.log(`Total XP before: ${beforeTotal}`);
  console.log(`Total XP after:  ${afterTotal}`);
  console.log(`Delta:           +${afterTotal - beforeTotal}`);

  console.log('\nBy game:');
  for (const [game, s] of Array.from(byGame.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${game}: ${s.count} achievements | ${s.beforeXp} -> ${s.afterXp} (+${s.afterXp - s.beforeXp})`);
  }

  console.log('\nBy challenge type:');
  for (const [ct, s] of Array.from(byType.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${ct}: ${s.count} achievements | ${s.beforeXp} -> ${s.afterXp} (+${s.afterXp - s.beforeXp})`);
  }

  console.log(`\nSample (${Math.min(sampleLimit, candidates.length)}):`);
  for (const c of candidates.slice(0, sampleLimit)) {
    console.log(`  [${c.gameShortName}] ${c.challengeType} | ${c.slug} | ${c.xpReward} -> ${c.xpReward * 2}`);
  }

  if (dryRun) {
    console.log('\nDry run complete. Use --apply to write updates.');
    return;
  }

  console.log('\nApplying XP updates...');
  let updated = 0;
  for (const c of candidates) {
    await prisma.achievement.update({
      where: { id: c.id },
      data: { xpReward: c.xpReward * 2 },
    });
    updated++;
    if (updated % 200 === 0) {
      console.log(`  Updated ${updated}/${candidates.length}...`);
    }
  }
  console.log(`Updated achievements: ${updated}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
