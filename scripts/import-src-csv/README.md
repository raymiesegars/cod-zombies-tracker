# Speedruns.com (SRC) CSV import

Imports verified runs from an SRC-export CSV into a single CZT user. Same flow as ZWR: create `ChallengeLog` entries, then run reunlock + recompute verified XP for that user.

## CSV format

Expected columns: `game`, `map`, `category`, `sub_category`, `time_primary`, `date`, `main_video`, `other_links`, `player_count`, `player_1`–`player_4`, `status`.

- **game**: Full name (e.g. "Call of Duty: Black Ops III Zombies").
- **category**: Leaderboard/category name, usually the map (e.g. "Ascension", "Shi No Numa").
- **time_primary**: Run time, e.g. "21m 29.530s", "22.850s", "1h 56m 19.230s".
- **date**: "YYYY-MM-DD".
- Only rows where the given source player appears in `player_1`–`player_4` are imported.

## Usage

```bash
pnpm db:import-src-csv -- --csv=src-csvs/FallnightYT.csv --source-player=FallnightYT --czt-user=cmlzic2am0000jax7hqhmsck8 [--dry-run] [--no-skip-existing]
```

- `--czt-user`: CZT user ID, username, or display name.
- `--dry-run`: Log what would be imported without writing.
- `--no-skip-existing`: Create duplicate logs if same map/challenge/time/proof already exists (default: skip).

## Mapping

- **Game**: `config.ts` maps SRC game names → CZT `Game.shortName` (AW, BO1, BO2, BO3, BO6, IW, VANGUARD, WAW, WW2).
- **Map**: `(game, category)` → CZT map slug (e.g. "Ascension" + BO3 → `bo3-ascension`). Add entries in `SRC_CATEGORY_TO_MAP_SLUG` for new games/categories.
- **Challenge type**: Resolved **only** from `sub_category` via the id key (no time inference): SRC stores the actual round (e.g. "Round 5", "Round 15", "Round 30") in a "Category" or "Round Number" variable. If that yields a type that exists on the map, we use it; otherwise the row is skipped. `--remove-imported` still uses time inference only to find logs created by a previous buggy import.
- **Modifiers**: Place `src_codzombies_id_key.json` (from your SRC scraper/export) at `src-csvs/src_codzombies_id_key.json`. The importer loads it and resolves `sub_category` variable=value IDs using the `variables` section: variable names (e.g. "Gobblegum Loadout", "Rampage Inducer") and value labels (e.g. "Megas", "Classics", "No Gums") are matched to set gums, rampage, consumables, fate cards, Directors Cut, etc. If the file is missing, runs use default modifiers.

## After import

The script runs `pnpm db:reunlock-achievements` and `pnpm db:recompute-verified-xp` with `BACKFILL_USER_ID` set to the target user, so achievements and verified XP are updated for that user only.
