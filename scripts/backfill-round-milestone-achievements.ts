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
import { processMapAchievements } from '../src/lib/achievements';

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DIRECT_URL/DATABASE_URL. Load .env.local (dev) or production env.');
    process.exit(1);
  }
  const host = dbUrl.includes('@') ? new URL(dbUrl.replace(/^postgresql:/, 'postgres:')).hostname : 'unknown';
  console.log('Using DB host:', host);
  console.log('Fetching distinct (userId, mapId) from ChallengeLog...');

  const pairs = await prisma.challengeLog.findMany({
    select: { userId: true, mapId: true },
    distinct: ['userId', 'mapId'],
  });

  console.log(`Found ${pairs.length} user+map combinations. Running processMapAchievements for each...`);

  let processed = 0;
  let totalNewUnlocks = 0;

  for (const { userId, mapId } of pairs) {
    const unlocked = await processMapAchievements(userId, mapId);
    processed++;
    if (unlocked.length > 0) {
      totalNewUnlocks += unlocked.length;
      console.log(`  [${processed}/${pairs.length}] userId=${userId.slice(0, 8)}... mapId=${mapId.slice(0, 8)}... → ${unlocked.length} new achievement(s)`);
    }
    if (processed % 100 === 0 && unlocked.length === 0) {
      console.log(`  [${processed}/${pairs.length}] ...`);
    }
  }

  console.log('Done.');
  console.log(`Processed ${processed} user+map pairs. Total new achievements unlocked: ${totalNewUnlocks}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
