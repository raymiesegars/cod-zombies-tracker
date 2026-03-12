/**
 * Sets BO7 map display order: Ashes 1, Farm 2, Exit 115 3, Zarya Cosmodrome 4,
 * Astra Malorum 5, Mars 6, Paradox Junction 7. Run once on any DB that had the old order.
 *
 * Run: pnpm exec tsx scripts/fix-bo7-map-order.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const BO7_ORDER: { slug: string; order: number }[] = [
  { slug: 'ashes-of-the-damned', order: 1 },
  { slug: 'vandorn-farm', order: 2 },
  { slug: 'exit-115', order: 3 },
  { slug: 'zarya-cosmodrome', order: 4 },
  { slug: 'astra-malorum', order: 5 },
  { slug: 'mars', order: 6 },
  { slug: 'paradox-junction', order: 7 },
];

const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local']) {
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

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

async function main() {
  for (const { slug, order } of BO7_ORDER) {
    const result = await prisma.map.updateMany({
      where: { slug },
      data: { order },
    });
    if (result.count > 0) {
      console.log(`Set ${slug} -> order ${order}`);
    }
  }
  console.log('BO7 map order updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
