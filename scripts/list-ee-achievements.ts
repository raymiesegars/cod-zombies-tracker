/**
 * Diagnostic: List all EASTER_EGG_COMPLETE achievements and count by (mapId, name).
 * Run: pnpm tsx scripts/list-ee-achievements.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local', '.env.production']) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        const value = match[2]!.replace(/^["']|["']$/g, '').trim();
        process.env[match[1]!] = value;
      }
    }
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  const achievements = await prisma.achievement.findMany({
    where: { type: 'EASTER_EGG_COMPLETE', isActive: true },
    include: {
      map: { select: { id: true, name: true, slug: true } },
      easterEgg: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ mapId: 'asc' }, { name: 'asc' }, { id: 'asc' }],
  });

  console.log(`Total EASTER_EGG_COMPLETE achievements: ${achievements.length}\n`);

  // Group by (mapId, name)
  const byKey = new Map<string, typeof achievements>();
  for (const a of achievements) {
    const key = `${a.mapId ?? 'null'}::${a.name}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(a);
  }

  const duplicates: [string, typeof achievements][] = [];
  for (const [key, list] of byKey) {
    if (list.length > 1) duplicates.push([key, list]);
  }

  if (duplicates.length > 0) {
    console.log('DUPLICATES (same map + name):');
    for (const [key, list] of duplicates) {
      const first = list[0]!;
      console.log(`  "${first.name}" on ${first.map?.name ?? 'null map'} (mapId=${first.mapId}): ${list.length} rows`);
      for (const a of list) {
        console.log(`    - id=${a.id} slug=${a.slug} easterEggId=${a.easterEggId ?? 'null'}`);
      }
    }
    console.log('');
  }

  // Per-map summary
  const byMap = new Map<string, typeof achievements>();
  for (const a of achievements) {
    const mapKey = a.map?.name ?? 'null';
    if (!byMap.has(mapKey)) byMap.set(mapKey, []);
    byMap.get(mapKey)!.push(a);
  }

  console.log('Per map:');
  for (const [mapName, list] of [...byMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const names = list.map((a) => a.name);
    const uniqueNames = [...new Set(names)];
    console.log(`  ${mapName}: ${list.length} achievement(s) - ${uniqueNames.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
