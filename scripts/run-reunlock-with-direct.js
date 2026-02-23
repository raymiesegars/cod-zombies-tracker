/**
 * Runs reunlock-achievements.ts with DIRECT_URL to avoid "Max client connections"
 * errors when using Supabase's pooled connection. Spawns a child with DATABASE_URL
 * set from DIRECT_URL and connection_limit=1.
 *
 * Usage: node scripts/run-reunlock-with-direct.js [--dry-run]
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

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!directUrl) {
  console.error('Missing DIRECT_URL/DATABASE_URL.');
  process.exit(1);
}

// Use direct connection with single connection to avoid exhausting pool
const sep = directUrl.includes('?') ? '&' : '?';
const urlWithLimit = `${directUrl}${sep}connection_limit=1`;

const env = { ...process.env, DATABASE_URL: urlWithLimit };

const result = spawnSync('pnpm', ['exec', 'tsx', 'scripts/reunlock-achievements.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  cwd: root,
});
process.exit(result.status ?? 0);
