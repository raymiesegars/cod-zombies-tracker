/**
 * Restore ONLY Achievement.isActive from a PITR-restored backup project.
 * All other data (UserAchievement, ChallengeLog, etc.) stays as-is in the live DB.
 *
 * Prerequisites:
 * 1. Supabase Dashboard: Database > Backups > Restore to a New Project
 *    - Pick your restore point (e.g. 10 Mar 2026 09:04:06 UTC)
 *    - This creates a separate project with the backup state
 * 2. In the NEW (restored) project: Settings > Database > copy the connection string
 * 3. Add to .env.local:
 *      RESTORED_DATABASE_URL=postgresql://postgres.[new-project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
 *    Use the Direct connection for migrations if needed; pooler works for reads.
 *
 * Usage:
 *   pnpm exec tsx scripts/restore-achievement-activation-from-backup.ts --dry-run  # Preview
 *   pnpm exec tsx scripts/restore-achievement-activation-from-backup.ts             # Apply
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

import { PrismaClient } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

const RESTORED_URL = process.env.RESTORED_DATABASE_URL;
const LIVE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function main() {
  if (!RESTORED_URL) {
    console.error(
      'Missing RESTORED_DATABASE_URL. Add it to .env.local with the connection string from your PITR-restored project.'
    );
    process.exit(1);
  }
  if (!LIVE_URL) {
    console.error('Missing DIRECT_URL or DATABASE_URL.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN – no changes will be written ***\n');
  }

  const restored = new PrismaClient({
    datasources: { db: { url: RESTORED_URL } },
  });
  const live = new PrismaClient({
    datasources: { db: { url: LIVE_URL } },
  });

  const fromBackup = await restored.achievement.findMany({
    select: { id: true, isActive: true },
  });

  console.log(`Read ${fromBackup.length} achievements from backup.`);

  const toUpdate = await live.achievement.findMany({
    select: { id: true, isActive: true },
  });
  const backupById = new Map(fromBackup.map((a) => [a.id, a.isActive]));

  const changes: { id: string; from: boolean; to: boolean }[] = [];
  for (const a of toUpdate) {
    const backupActive = backupById.get(a.id);
    if (backupActive !== undefined && backupActive !== a.isActive) {
      changes.push({ id: a.id, from: a.isActive, to: backupActive });
    }
  }

  const toActivate = changes.filter((c) => !c.from && c.to).length;
  const toDeactivate = changes.filter((c) => c.from && !c.to).length;

  console.log(`Would update ${changes.length} achievements: ${toActivate} → activate, ${toDeactivate} → deactivate.`);

  if (changes.length > 0 && !DRY_RUN) {
    for (const { id, to } of changes) {
      await live.achievement.update({
        where: { id },
        data: { isActive: to },
      });
    }
    console.log(`Updated ${changes.length} achievements.`);
  } else if (changes.length === 0) {
    console.log('No changes needed – live DB already matches backup.');
  }

  await restored.$disconnect();
  await live.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
