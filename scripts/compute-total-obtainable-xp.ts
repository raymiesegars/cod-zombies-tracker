/**
 * Compute total obtainable XP from all active achievements.
 * Run and use the output to set TOTAL_OBTAINABLE_XP in src/lib/ranks.ts
 * so that rank 100 is at 93% of this value.
 *
 * Usage: pnpm exec tsx scripts/compute-total-obtainable-xp.ts
 */

import * as fs from 'fs';
import * as path from 'path';

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

import prisma from '../src/lib/prisma';

async function main() {
  const result = await prisma.achievement.aggregate({
    where: { isActive: true },
    _sum: { xpReward: true },
    _count: { id: true },
  });
  const total = result._sum.xpReward ?? 0;
  const count = result._count.id ?? 0;
  console.log(`Active achievements: ${count}`);
  console.log(`Total obtainable XP: ${total.toLocaleString()}`);
  console.log(`93% of total (for rank 100): ${Math.floor(total * 0.93).toLocaleString()}`);
  console.log('\nUpdate TOTAL_OBTAINABLE_XP in src/lib/ranks.ts to:', total);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
