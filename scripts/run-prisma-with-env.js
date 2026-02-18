/**
 * Load .env then .env.local (same order as Next.js and prisma/seed.ts) so that
 * Prisma CLI (migrate, db push) uses the SAME database as the app and seed.
 * This prevents accidentally running migrate/push against production when
 * you keep production in .env and dev/branch in .env.local.
 *
 * Usage:
 *   node scripts/run-prisma-with-env.js --verify     # Print which DB host will be used (no writes)
 *   node scripts/run-prisma-with-env.js migrate dev    # Run prisma migrate dev with .env.local
 *   node scripts/run-prisma-with-env.js db push       # Run prisma db push with .env.local
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(root, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (match) {
          const value = match[2].replace(/^["']|["']$/g, '').trim();
          process.env[match[1]] = value;
        }
      }
    }
  }
}

loadEnv();

if (process.argv[2] === '--verify') {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('No DIRECT_URL or DATABASE_URL in .env / .env.local');
    process.exit(1);
  }
  try {
    const u = new URL(url.replace(/^postgresql:/, 'postgres:'));
    console.log('Database host:', u.hostname);
    console.log('(This is the DB that pnpm db:seed, db:migrate, and db:push will use.)');
  } catch (e) {
    console.error('Invalid DATABASE_URL/DIRECT_URL:', e.message);
    process.exit(1);
  }
  process.exit(0);
}

const prismaBin = path.join(root, 'node_modules', '.bin', 'prisma');
const prismaCmd = process.platform === 'win32' ? prismaBin + '.cmd' : prismaBin;
const result = spawnSync(prismaCmd, process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
});
process.exit(result.status ?? 0);
