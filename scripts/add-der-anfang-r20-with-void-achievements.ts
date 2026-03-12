import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

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

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

function parseTimeToSeconds(input: string): number | null {
  const parts = input.trim().split(':').map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) return null;
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m * 60) + s;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (h * 3600) + (m * 60) + s;
  }
  return null;
}

function formatSpeedrunTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function collectEntries(node: unknown, out: Array<{ board_id?: unknown; achieved?: unknown }>) {
  if (Array.isArray(node)) {
    for (const item of node) collectEntries(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const rec = node as Record<string, unknown>;
  if ('board_id' in rec && 'achieved' in rec) {
    out.push({ board_id: rec.board_id, achieved: rec.achieved });
  }
  for (const value of Object.values(rec)) {
    collectEntries(value, out);
  }
}

function rarityForIndex(i: number, len: number): 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' {
  if (i === len - 1) return 'LEGENDARY';
  if (i >= len - 2) return 'EPIC';
  if (i >= len - 3) return 'RARE';
  return 'UNCOMMON';
}

async function main() {
  const map = await prisma.map.findUnique({
    where: { slug: 'der-anfang' },
    include: { game: { select: { shortName: true } }, challenges: { where: { type: 'ROUND_20_SPEEDRUN' } } },
  });
  if (!map) throw new Error('Map der-anfang not found.');
  if (map.game?.shortName !== 'VANGUARD') throw new Error(`Map der-anfang is not VANGUARD (found ${map.game?.shortName ?? 'unknown'}).`);

  const challengeId = map.challenges[0]?.id ?? null;
  if (!challengeId) throw new Error('ROUND_20_SPEEDRUN challenge is missing for der-anfang.');

  const noPath = path.join(root, 'number_ones.json');
  const raw = fs.readFileSync(noPath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  const entries: Array<{ board_id?: unknown; achieved?: unknown }> = [];
  collectEntries(parsed, entries);

  const withVoidOne = entries.find((e) => e.board_id === 'vanguard-der-anfang-20-speedrun-with-void-1-board');
  const withVoidFallback = entries
    .filter((e) => typeof e.board_id === 'string' && e.board_id.includes('vanguard-der-anfang-20-speedrun-with-void-'))
    .map((e) => ({ boardId: e.board_id as string, seconds: typeof e.achieved === 'string' ? parseTimeToSeconds(e.achieved) : null }))
    .filter((e): e is { boardId: string; seconds: number } => e.seconds != null);

  const wrSeconds =
    withVoidOne && typeof withVoidOne.achieved === 'string'
      ? parseTimeToSeconds(withVoidOne.achieved)
      : (withVoidFallback.length > 0 ? Math.min(...withVoidFallback.map((e) => e.seconds)) : null);
  if (!wrSeconds || wrSeconds <= 0) {
    throw new Error('Could not resolve Der Anfang ROUND_20 with-void WR seconds from number_ones.json.');
  }

  // 5% rule for top tier, plus standard outer bands used across speedrun tiers.
  const tiers = [
    { maxTimeSeconds: Math.round(wrSeconds * 2.0), xpReward: 80 },
    { maxTimeSeconds: Math.round(wrSeconds * 1.5), xpReward: 200 },
    { maxTimeSeconds: Math.round(wrSeconds * 1.2), xpReward: 500 },
    { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: 1200 },
  ];

  let created = 0;
  let skippedExisting = 0;
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i]!;
    const timeStr = formatSpeedrunTime(t.maxTimeSeconds);
    const slug = `round-20-speedrun-under-${timeStr.replace(/:/g, '-')}`;
    const existing = await prisma.achievement.findFirst({
      where: {
        mapId: map.id,
        slug,
        difficulty: null,
      },
      select: { id: true },
    });
    if (existing) {
      skippedExisting++;
      continue;
    }
    await prisma.achievement.create({
      data: {
        mapId: map.id,
        challengeId,
        slug,
        name: `Round 20 in under ${timeStr}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: {
          challengeType: 'ROUND_20_SPEEDRUN',
          maxTimeSeconds: t.maxTimeSeconds,
          vanguardVoidUsed: true,
        },
        xpReward: t.xpReward,
        rarity: rarityForIndex(i, tiers.length),
        isActive: true,
      },
    });
    created++;
  }

  console.log(`Der Anfang ROUND_20 with-void achievements: created=${created}, existing_skipped=${skippedExisting}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

