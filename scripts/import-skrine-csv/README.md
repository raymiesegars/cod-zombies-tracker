# ZWR/Skrine CSV → CZT Import Script

This script imports verified leaderboard runs from a ZWR/Skrine-style CSV into a single CZT user. **One source-site player per run** is linked to **one CZT user**: you provide the source player ID (the value that appears in `player_1`–`player_4` in the CSV) and the CZT user (by username, user ID, or display name). Only rows where that source player is in the run are imported.

## Quick start

```bash
# Dry run (no DB writes) — always do this first
npx tsx scripts/import-skrine-csv/run.ts \
  --csv=/path/to/records.csv \
  --source-player-id=17046 \
  --czt-user=cmlst8s1g0000143lg1ffpspg \
  --dry-run

# Real run
npx tsx scripts/import-skrine-csv/run.ts \
  --csv=/path/to/records.csv \
  --source-player-id=17046 \
  --czt-user=cmlst8s1g0000143lg1ffpspg

# With report file
npx tsx scripts/import-skrine-csv/run.ts \
  --csv=/path/to/records.csv \
  --source-player-id=17046 \
  --czt-user=YourUsername \
  --report=import-report.json
```

## Options

| Option | Required | Description |
|--------|----------|-------------|
| `--csv=<path>` | Yes | Path to the CSV file (absolute or relative to cwd). |
| `--source-player-id=<id>` | Yes | The player ID from the source site that appears in `player_1`–`player_4`. Only rows where this ID is one of the four players are imported. |
| `--czt-user=<id\|username\|displayName>` | Yes | The CZT user to attach all imported logs to. Can be CZT user ID (cuid), username, or display name. |
| `--dry-run` | No | Do not write to the database; only parse CSV and report what would be imported/skipped. |
| `--report=<path>` | No | Write a JSON report (per-row status + skipped list + summary) to this path. |
| `--no-skip-existing` | No | By default, rows that would create a duplicate log (same user, map, challenge, round/time, proof) are skipped. Use this to disable that check (not recommended). |

## Environment

The script loads `.env` then `.env.local` (same as the rest of the project) and uses `DIRECT_URL` or `DATABASE_URL` for Prisma. Run from the **project root** so that `scripts/import-skrine-csv/run.ts` and `src/lib/utils` resolve correctly.

## CSV format

Expected columns (order can vary; headers are matched case-insensitively):

- `game` — e.g. `aw`, `bo3`, `bo4`, `bocw`, `iw`, `wwii`, `vanguard`
- `map` — map slug (e.g. `outbreak`, `der-eisendrache`)
- `record` — category (e.g. `first-room`, `high-round`, `30-speedrun`, `ee-speedrun`)
- `sub_record` — optional sub-category (e.g. `classic-gobblegum`, `realistic`)
- `platform`, `game_type` — optional
- `main_video` — primary proof URL (required for verified; if empty, script uses `https://zwr.gg/`)
- `other_links` — JSON array of extra URLs or comma-separated
- `achieved` — round number (e.g. `45`) or time (e.g. `4:13:29` or `26:57`)
- `player_count` — 1–4
- `player_1` … `player_4` — source-site player IDs (numeric or string)
- `added` — date/time when the run was added (e.g. `10/15/2022 15:02`)
- `is_world_record` — optional

## Behavior

1. **Row selection**  
   Only rows where `--source-player-id` appears in `player_1`–`player_4` are considered.

2. **Games**  
   `community` and `custom` are skipped. Other games are mapped via `config.ts` → CZT `Game.shortName`.

3. **Maps**  
   Map is resolved by game + map slug. Use `MAP_SLUG_OVERRIDES` in `config.ts` when the source slug differs from CZT (or set to `null` to skip that map).

4. **Challenge type**  
   `record` + `sub_record` are mapped in `config.ts` to a CZT `ChallengeType` and modifiers (e.g. BO3 gobblegum, BO4 difficulty). Unknown combinations are **skipped** and listed in the report and in the “Skipped / failed” list at the end.

5. **Proof**  
   All URLs from `main_video` and `other_links` are combined and normalized. If there are none, `https://zwr.gg/` is used. All imported runs are created as **verified** (`isVerified: true`).

6. **Teammates**  
   Other non-zero player IDs in `player_1`–`player_4` (excluding the source player) are resolved using **zwr-to-czt-users.ts**: if a teammate’s ZWR ID is in that mapping, they are added to **teammateUserIds** (site user); otherwise they are added to **teammateNonUserNames** as `"Player <id>"`. Add entries to the mapping when a ZWR player has a CZT account so future imports link them as site users.

7. **EE speedrun**  
   For `ee-speedrun` (and any record mapped with `createEasterEggLog: true`), the script creates **both** a **ChallengeLog** (type `EASTER_EGG_SPEEDRUN`) and an **EasterEggLog** for the map’s main-quest Easter Egg (if one exists).

8. **Duplicates**  
   By default, if a log already exists for the same CZT user, map, challenge, round/time, and proof set, the row is **skipped** (no second log). Use `--no-skip-existing` to turn off this check.

9. **Errors**  
   On hard errors (e.g. DB failure), the script exits with code 1 and reports the failing row. The report file (if used) still contains everything processed up to that point.

## ZWR → CZT user mapping (zwr-to-czt-users.ts)

**Purpose:** Map ZWR/source player IDs (as in CSV `player_1`–`player_4`) to CZT user IDs.

- **Reference:** When importing, use the correct `--czt-user` for the primary import target; this file is the single place to look up “ZWR ID 17046 = CZT user Skrine (cmlvocpbj0006ar6ml9vz7hsm)”.
- **Teammate resolution:** The script uses this map when building each log: if a teammate’s ZWR ID is listed, they are stored as a site user (`teammateUserIds`); otherwise as a placeholder (`teammateNonUserNames`).

**When to add an entry:** Add one for every ZWR player who has a CZT account. Then future imports will link them as site users on co-op runs. Example:

```ts
'18987': {
  cztUserId: 'cmlxxxxxxxxxxxxxxxxxxxxx',
  displayName: 'OtherPlayer',
  note: 'Added after second CSV import.',
},
```

## Configuration (config.ts)

- **GAME_CODES** — source `game` value → CZT `Game.shortName`.
- **SKIP_GAMES** — set of games to skip (e.g. `community`, `custom`).
- **MAP_SLUG_OVERRIDES** — source map slug → CZT map slug (or `null` to skip).
- **getRecordMapping(record, sub_record)** — returns `{ challengeType, modifiers, createEasterEggLog? }`.  
  Add new entries in `RECORD_MAPPINGS` and/or extend `applySubRecordModifiers()` for new boards or sub-categories (e.g. BO4 “Realistic” → `HIGHEST_ROUND` + `difficulty: REALISTIC`).
- **DEFAULTS** — placeholder proof URL, default BO3/BOCW/BO4 modifiers when not inferred.

## Adding new record types or maps

1. **New game**  
   Add to `GAME_CODES` in `config.ts` (and to `SKIP_GAMES` if it should be skipped).

2. **New map slug alias**  
   - **Per-game (preferred):** Add to `MAP_SLUG_BY_GAME` in `config.ts` under the game code (e.g. `aw`, `bo3`, `iw`). Each key is the source map slug, value is the CZT map slug or `null` to skip. Use this when the same slug means different maps in different games (e.g. `bo|shi-no-numa` → `bo1-shi-no-numa`, `bo3|shi-no-numa` → `bo3-shi-no-numa`).  
   - **Global fallback:** Add to `MAP_SLUG_OVERRIDES` for source slug → CZT slug when the slug is unique across games.

3. **New record / sub_record**  
   Add a key to `RECORD_MAPPINGS` in `config.ts` (e.g. `'new-record|'` or `'new-record|sub'`). Use `'*'` as sub_record for “any sub_record”. If the run should also create an EasterEggLog, set `createEasterEggLog: true`.  
   If the sub_record only affects modifiers (e.g. gobblegum, difficulty), add handling in `applySubRecordModifiers()`.

4. **Inference**  
   For ambiguous source categories (e.g. BO4 “Realistic” board), add a mapping that translates to the right CZT challenge type + modifiers (e.g. `HIGHEST_ROUND` + `difficulty: REALISTIC`).

## Report output

With `--report=<path>`, the script writes a JSON file containing:

- **report** — array of `{ csvRowIndex, status, game, map, record, sub_record, message, logIds? }` (status: `imported` | `skipped` | `error`).
- **skippedReasons** — array of `{ row, game, map, record, sub_record, reason }` for every skipped or failed row.
- **summary** — `{ imported, skipped, errors }`.

The console also prints a short summary and the full “Skipped / failed” list at the end.

## Production

For production, use the same command but with the target CZT user (username or user ID). You can run the script multiple times for different users (different `--source-player-id` and `--czt-user`); duplicate detection is per user, so the same CSV can be used to import to several CZT accounts.
