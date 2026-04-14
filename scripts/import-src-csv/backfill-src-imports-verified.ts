#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { PrismaClient, type PlayerCount } from '@prisma/client';
import {
  getGameShortNameFromSrc,
  getMapSlugFromSrc,
  isUnsupportedSuperCategory,
} from './config';
import { loadSrcIdKey, resolveSpeedrunTypeFromSubCategory } from './src-id-key';
import { getRoundForSpeedrunChallengeType } from '../import-skrine-csv/speedrun-round-by-type';
import { normalizeProofUrls } from '../../src/lib/utils';

const root = path.resolve(__dirname, '../..');
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
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

type SrcCsvRow = {
  game: string;
  category: string;
  sub_category: string;
  time_primary: string;
  date: string;
  main_video: string;
  other_links: string;
  player_count: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  _rowIndex: number;
};

type Args = {
  csvDir: string;
  apply: boolean;
  skipRevalidate: boolean;
  onlyUserId: string | null;
  onlyPlayer: string | null;
  limitUsers: number | null;
  verbose: boolean;
  onlyUsersWithUnverified: boolean;
  revalidateMode: 'maps' | 'users';
  revalidateOnly: boolean;
  collectMatchedAsImpacted: boolean;
  userFilter: 'unverified' | 'verified' | 'all';
};

function parseCsvLine(line: string): string[] {
  const row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === undefined) {
      row.push(cur.replace(/^"|"$/g, ''));
      cur = '';
    } else {
      cur += c;
    }
  }
  row.push(cur.replace(/^"|"$/g, ''));
  return row;
}

function parseCsv(content: string): SrcCsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headerCells = parseCsvLine(lines[0]!);
  const getIdx = (name: string) => headerCells.findIndex((c) => c.trim().toLowerCase() === name.toLowerCase());
  const get = (row: string[], key: string) => {
    const i = getIdx(key);
    if (i < 0) return '';
    return (row[i] ?? '').trim().replace(/^"|"$/g, '');
  };

  const out: SrcCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    out.push({
      game: get(cells, 'game'),
      category: get(cells, 'category'),
      sub_category: get(cells, 'sub_category'),
      time_primary: get(cells, 'time_primary'),
      date: get(cells, 'date'),
      main_video: get(cells, 'main_video'),
      other_links: get(cells, 'other_links'),
      player_count: get(cells, 'player_count'),
      player_1: get(cells, 'player_1'),
      player_2: get(cells, 'player_2'),
      player_3: get(cells, 'player_3'),
      player_4: get(cells, 'player_4'),
      _rowIndex: i + 1,
    });
  }
  return out;
}

function parseTimePrimary(s: string): number | null {
  const raw = (s || '').trim();
  if (!raw) return null;
  let totalSeconds = 0;
  const hourMatch = raw.match(/(\d+)\s*h(?:our)?s?/i);
  const minMatch = raw.match(/(\d+)\s*m(?:in)?(?:ute)?s?/i);
  const secMatch = raw.match(/(\d+(?:\.\d+)?)\s*s(?:ec)?/i);
  if (hourMatch) totalSeconds += parseInt(hourMatch[1]!, 10) * 3600;
  if (minMatch) totalSeconds += parseInt(minMatch[1]!, 10) * 60;
  if (secMatch) totalSeconds += parseFloat(secMatch[1]!);
  if (totalSeconds <= 0 && raw.match(/\d/)) {
    const onlyNum = raw.match(/^(\d+(?:\.\d+)?)\s*$/);
    if (onlyNum) totalSeconds = parseFloat(onlyNum[1]!);
  }
  if (totalSeconds > 0) return Math.round(totalSeconds);
  return null;
}

function parseDateRange(s: string): { dayStart: Date; dayEnd: Date } {
  const raw = (s || '').trim();
  if (!raw) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return { dayStart, dayEnd };
  }
  const [y, m, d] = raw.split(/[-/]/).map((x) => parseInt(x, 10));
  if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
    const year = y! < 100 ? 2000 + y! : y!;
    const dayStart = new Date(year, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return { dayStart, dayEnd };
  }
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

function parseProofUrls(row: SrcCsvRow): string[] {
  const urls: string[] = [];
  if (row.main_video?.trim()) urls.push(row.main_video.trim());
  if (row.other_links?.trim()) {
    const split = row.other_links
      .split(/[;\s]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    urls.push(...split);
  }
  if (urls.length === 0) urls.push('https://www.speedruns.com/');
  return normalizeProofUrls(urls);
}

function parsePlayerCount(n: string): PlayerCount {
  const num = parseInt(String(n).trim(), 10);
  if (num === 2) return 'DUO';
  if (num === 3) return 'TRIO';
  if (num === 4) return 'SQUAD';
  return 'SOLO';
}

function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeUrl(u: string): string {
  const s = (u || '').trim().toLowerCase();
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let csvDir = path.join(root, 'src_codzombies_player_csv');
  let apply = false;
  let skipRevalidate = false;
  let onlyUserId: string | null = null;
  let onlyPlayer: string | null = null;
  let limitUsers: number | null = null;
  let verbose = false;
  let onlyUsersWithUnverified = true;
  let revalidateMode: 'maps' | 'users' = 'maps';
  let revalidateOnly = false;
  let collectMatchedAsImpacted = false;
  let userFilter: 'unverified' | 'verified' | 'all' = 'unverified';

  for (const a of args) {
    if (a === '--apply') apply = true;
    else if (a === '--skip-revalidate') skipRevalidate = true;
    else if (a.startsWith('--csv-dir=')) csvDir = a.slice(10).trim().replace(/^=+/, '');
    else if (a.startsWith('--only-user-id=')) onlyUserId = a.slice(15).trim().replace(/^=+/, '') || null;
    else if (a.startsWith('--only-player=')) onlyPlayer = a.slice(14).trim().replace(/^=+/, '') || null;
    else if (a.startsWith('--limit-users=')) {
      const n = parseInt(a.slice(14).trim(), 10);
      if (!Number.isNaN(n) && n > 0) limitUsers = n;
    } else if (a === '--verbose') verbose = true;
    else if (a === '--all-src-users') onlyUsersWithUnverified = false;
    else if (a === '--revalidate-users') revalidateMode = 'users';
    else if (a === '--revalidate-maps') revalidateMode = 'maps';
    else if (a === '--revalidate-only') revalidateOnly = true;
    else if (a === '--collect-matched-as-impacted') collectMatchedAsImpacted = true;
    else if (a === '--users-with-verified-logs') {
      onlyUsersWithUnverified = false;
      userFilter = 'verified';
    } else if (a === '--users-with-unverified-logs') {
      onlyUsersWithUnverified = false;
      userFilter = 'unverified';
    } else if (a === '--users-all') {
      onlyUsersWithUnverified = false;
      userFilter = 'all';
    }
  }

  return {
    csvDir,
    apply,
    skipRevalidate,
    onlyUserId,
    onlyPlayer,
    limitUsers,
    verbose,
    onlyUsersWithUnverified,
    revalidateMode,
    revalidateOnly,
    collectMatchedAsImpacted,
    userFilter,
  };
}

async function main() {
  const {
    csvDir,
    apply,
    skipRevalidate,
    onlyUserId,
    onlyPlayer,
    limitUsers,
    verbose,
    onlyUsersWithUnverified,
    revalidateMode,
    revalidateOnly,
    collectMatchedAsImpacted,
    userFilter,
  } = parseArgs();
  const mode = apply ? 'APPLY' : 'DRY RUN';
  console.log(`Mode: ${mode}`);
  console.log(`CSV dir: ${csvDir}`);
  if (!apply) console.log('Tip: pass --apply to write changes');
  if (skipRevalidate) console.log('Revalidation: skipped by flag');

  const csvAbs = path.isAbsolute(csvDir) ? csvDir : path.resolve(process.cwd(), csvDir);
  if (!fs.existsSync(csvAbs)) {
    throw new Error(`CSV directory not found: ${csvAbs}`);
  }

  const csvByName = new Map<string, string>();
  const csvCollisions = new Map<string, string[]>();
  for (const entry of fs.readdirSync(csvAbs)) {
    if (!entry.toLowerCase().endsWith('.csv')) continue;
    const full = path.join(csvAbs, entry);
    const base = entry.replace(/\.csv$/i, '');
    const key = normalizeName(base);
    if (!csvByName.has(key)) {
      csvByName.set(key, full);
      csvCollisions.set(key, [full]);
    } else {
      const current = csvCollisions.get(key) ?? [];
      current.push(full);
      csvCollisions.set(key, current);
    }
  }
  console.log(`Discovered ${csvByName.size} normalized SRC CSV names`);

  const allSrcIdentities = await prisma.externalAccountIdentity.findMany({
    where: {
      source: 'SRC',
      ...(onlyUserId ? { userId: onlyUserId } : {}),
      ...(onlyPlayer ? { externalName: { equals: onlyPlayer, mode: 'insensitive' } } : {}),
    },
    select: {
      userId: true,
      externalName: true,
      user: {
        select: {
          username: true,
          displayName: true,
          isArchived: true,
          mergedIntoUserId: true,
        },
      },
    },
    orderBy: [{ userId: 'asc' }, { externalName: 'asc' }],
  });

  let srcIdentities = allSrcIdentities;
  if (onlyUsersWithUnverified || userFilter !== 'all') {
    const verifiedFilter = userFilter === 'verified' ? true : userFilter === 'unverified' ? false : null;
    const usersByLogState = new Set(
      (
        await prisma.challengeLog.findMany({
          where: {
            ...(verifiedFilter == null ? {} : { isVerified: verifiedFilter }),
            user: {
              externalIdentities: {
                some: { source: 'SRC' },
              },
            },
          },
          select: { userId: true },
          distinct: ['userId'],
        })
      ).map((x) => x.userId)
    );
    srcIdentities = srcIdentities.filter((x) => usersByLogState.has(x.userId));
    const filterLabel = verifiedFilter == null ? 'all logs' : verifiedFilter ? 'verified logs' : 'unverified logs';
    console.log(`Filtered to SRC identities on users with ${filterLabel}: ${srcIdentities.length}`);
  }

  const mergedAuditCount = await prisma.userMergeAudit.count({
    where: {
      sourceUser: {
        isExternalPlaceholder: true,
        externalAvatarSource: 'SRC',
      },
    },
  });

  console.log(`SRC identity rows: ${srcIdentities.length}`);
  console.log(`Merge audits from SRC placeholders: ${mergedAuditCount}`);

  const mapCache = new Map<string, { id: string; gameShortName: string } | null>();
  const challengeCache = new Map<string, { id: string } | null>();
  const idKey = loadSrcIdKey(root);
  let usersProcessed = 0;
  let csvMissing = 0;
  let rowsConsidered = 0;
  let rowsMatched = 0;
  let rowsNoMatch = 0;
  let rowsAmbiguous = 0;
  let logsAlreadyVerified = 0;
  let logsUpdatedToVerified = 0;
  const impactedByUser = new Map<string, Set<string>>();

  for (const identity of srcIdentities) {
    if (limitUsers != null && usersProcessed >= limitUsers) break;
    usersProcessed++;
    const key = normalizeName(identity.externalName);
    const csvPath = csvByName.get(key);
    if (!csvPath) {
      csvMissing++;
      if (verbose || usersProcessed <= 5) {
        console.log(
          `[${usersProcessed}/${srcIdentities.length}] Missing CSV for SRC identity "${identity.externalName}" → user ${identity.user.username}`
        );
      }
      continue;
    }

    const dupCandidates = csvCollisions.get(key) ?? [];
    if (verbose) {
      if (dupCandidates.length > 1) {
        console.log(
          `[${usersProcessed}/${srcIdentities.length}] Warning: multiple CSV filename matches for "${identity.externalName}". Using first: ${path.basename(
            csvPath
          )}`
        );
      } else {
        console.log(`[${usersProcessed}/${srcIdentities.length}] ${identity.externalName} -> ${identity.user.username}`);
      }
    } else if (usersProcessed % 100 === 0 || usersProcessed <= 5) {
      console.log(
        `[${usersProcessed}/${srcIdentities.length}] progress | rowsConsidered=${rowsConsidered} matched=${rowsMatched} updates=${logsUpdatedToVerified}`
      );
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const allRows = parseCsv(content);
    const rows = allRows.filter((r) => {
      const names = [r.player_1, r.player_2, r.player_3, r.player_4].map((p) => normalizeName(p || ''));
      return names.includes(key);
    });

    for (const row of rows) {
      if (isUnsupportedSuperCategory(row.category)) continue;
      const gameShortName = getGameShortNameFromSrc(row.game);
      if (!gameShortName) continue;
      const mapSlug = getMapSlugFromSrc(row.game, row.category);
      if (!mapSlug) continue;
      const timeSeconds = parseTimePrimary(row.time_primary);
      if (timeSeconds == null || timeSeconds <= 0) continue;

      rowsConsidered++;

      const mapKey = `${gameShortName}:${mapSlug}`;
      let mapRecord = mapCache.get(mapKey);
      if (mapRecord === undefined) {
        const map = await prisma.map.findFirst({
          where: { slug: mapSlug, game: { shortName: gameShortName } },
          select: { id: true, game: { select: { shortName: true } } },
        });
        mapRecord = map ? { id: map.id, gameShortName: map.game.shortName } : null;
        mapCache.set(mapKey, mapRecord);
      }
      if (!mapRecord) continue;

      const challengeType = row.sub_category ? resolveSpeedrunTypeFromSubCategory(row.sub_category, idKey) : null;
      if (!challengeType) continue;
      const roundReached = getRoundForSpeedrunChallengeType(challengeType);
      if (roundReached == null) continue;

      const challengeKey = `${mapRecord.id}:${challengeType}`;
      let challenge = challengeCache.get(challengeKey);
      if (challenge === undefined) {
        challenge =
          (await prisma.challenge.findFirst({
            where: { mapId: mapRecord.id, type: challengeType as never },
            select: { id: true },
          })) ?? null;
        challengeCache.set(challengeKey, challenge);
      }
      if (!challenge) continue;

      const playerCount = parsePlayerCount(row.player_count);
      const { dayStart, dayEnd } = parseDateRange(row.date);
      const proofUrls = parseProofUrls(row).map(normalizeUrl);

      const candidates = await prisma.challengeLog.findMany({
        where: {
          userId: identity.userId,
          mapId: mapRecord.id,
          challengeId: challenge.id,
          roundReached,
          completionTimeSeconds: timeSeconds,
          playerCount,
          completedAt: { gte: dayStart, lt: dayEnd },
        },
        select: { id: true, isVerified: true, proofUrls: true },
      });

      if (candidates.length === 0) {
        rowsNoMatch++;
        continue;
      }

      const exact = candidates.filter((c) => arraysEqual(c.proofUrls.map(normalizeUrl), proofUrls));
      const overlap = candidates.filter((c) => {
        const set = new Set(c.proofUrls.map(normalizeUrl));
        return proofUrls.some((u) => set.has(u));
      });
      const resolved = exact.length > 0 ? exact : overlap.length > 0 ? overlap : candidates;
      if (resolved.length > 1) {
        rowsAmbiguous++;
        continue;
      }

      const hit = resolved[0]!;
      rowsMatched++;
      const addAsImpacted = collectMatchedAsImpacted || !hit.isVerified;
      if (addAsImpacted) {
        const mapSet = impactedByUser.get(identity.userId) ?? new Set<string>();
        mapSet.add(mapSlug);
        impactedByUser.set(identity.userId, mapSet);
      }
      if (hit.isVerified) {
        logsAlreadyVerified++;
        continue;
      }

      if (apply && !revalidateOnly) {
        await prisma.challengeLog.update({
          where: { id: hit.id },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
            verificationRequestedAt: null,
          },
        });
      }

      logsUpdatedToVerified++;
    }
  }

  console.log('\n--- SRC Verified Backfill Summary ---');
  console.log(`Users processed: ${usersProcessed}`);
  console.log(`Identity rows scanned: ${srcIdentities.length}`);
  console.log(`CSV files missing: ${csvMissing}`);
  console.log(`Candidate rows considered: ${rowsConsidered}`);
  console.log(`Rows matched to a single log: ${rowsMatched}`);
  console.log(`Rows with no matching log: ${rowsNoMatch}`);
  console.log(`Rows skipped as ambiguous: ${rowsAmbiguous}`);
  console.log(`Matched logs already verified: ${logsAlreadyVerified}`);
  console.log(`${apply ? 'Logs updated to verified' : '[DRY] Logs that would be updated'}: ${logsUpdatedToVerified}`);
  console.log(`${apply ? 'Impacted users' : '[DRY] Impacted users'}: ${impactedByUser.size}`);
  const impactedMapSlugs = new Set<string>();
  for (const mapSlugs of impactedByUser.values()) {
    for (const slug of mapSlugs) impactedMapSlugs.add(slug);
  }
  console.log(`${apply ? 'Impacted maps' : '[DRY] Impacted maps'}: ${impactedMapSlugs.size}`);

  if (impactedByUser.size > 0) {
    const preview = Array.from(impactedByUser.entries()).slice(0, 20);
    console.log('\nSample impacted users (first 20):');
    for (const [userId, mapSlugs] of preview) {
      console.log(`  - ${userId}: ${Array.from(mapSlugs).slice(0, 10).join(', ')}`);
    }
  }

  const shouldRunRevalidate = (apply || revalidateOnly) && !skipRevalidate && impactedByUser.size > 0;
  if (shouldRunRevalidate) {
    if (revalidateMode === 'users') {
      console.log('\nRevalidating achievements and verified XP per impacted user...');
      let i = 0;
      for (const [userId, mapSlugs] of impactedByUser.entries()) {
        i++;
        const slugs = Array.from(mapSlugs).join(',');
        console.log(`[${i}/${impactedByUser.size}] user=${userId} maps=${mapSlugs.size}`);
        const env = { ...process.env, BACKFILL_USER_ID: userId, BACKFILL_MAP_SLUGS: slugs };
        execSync('pnpm db:reunlock-achievements', { stdio: 'inherit', cwd: root, env });
        execSync('pnpm db:recompute-verified-xp', { stdio: 'inherit', cwd: root, env });
      }
    } else {
      const slugs = Array.from(impactedMapSlugs).join(',');
      const env = { ...process.env, BACKFILL_MAP_SLUGS: slugs };
      console.log(`\nRevalidating in map-batched mode across ${impactedMapSlugs.size} maps...`);
      execSync('pnpm db:reunlock-achievements', { stdio: 'inherit', cwd: root, env });
      execSync('pnpm db:recompute-verified-xp', { stdio: 'inherit', cwd: root, env });
    }
  } else if ((apply || revalidateOnly) && impactedByUser.size > 0 && skipRevalidate) {
    console.log('\nRevalidation skipped by --skip-revalidate.');
  }
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
