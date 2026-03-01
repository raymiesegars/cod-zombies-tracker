# Patch Notes

## Ranks & Levels (1–100)

- **Ranks 1–100:** Progression scaled from the previous 1–20 system. Levels 1–80 use the same curve shape as the old 20 levels; levels 81–100 use a power curve so rank 100 is at **93% of total obtainable XP** on the site.
- **Rank assets:** Badges use `rank1.webp` through `rank99.webp` and `rank100.png` in the same ranks folder as before.
- **Rank help:** Help content updated for 1–100: XP table, badge filenames, and a short note on total vs verified rank. Table is scrollable with a sticky header.
- **Leaderboard rank:** Rank is always computed from XP (total or verified) instead of stored `user.level`, so it stays correct after the rework.
- **Scripts:** `pnpm db:compute-total-xp` prints total obtainable XP; `pnpm db:sync-level-thresholds` upserts all 100 level thresholds into the DB (optional, for consistency).

---

## Achievements

- **Verified-only preference:** The “Verified only” toggle on map achievements and dashboard achievements now **persists across refresh**. If you switch to “All” (unverified), it stays that way after reload.
- **Verified achievements popup:** The first-time “Verified achievements” explanation popup no longer appears on every refresh; the “seen” flag is read from localStorage after mount.
- **Verified Achievements block:** Clicking the “Verified Achievements” dashboard block opens a modal with **breakdown per game and per map** (same structure as the normal Achievements modal), using verified unlock counts.
- **Map links from achievement modals:** From both the normal and verified achievement modals, clicking a map goes to **that map’s page with the Achievements tab open** (`/maps/{slug}?tab=achievements`).
- **Map page URL:** The map detail page now respects `?tab=achievements`, `?tab=your-runs`, `?tab=easter-eggs`, and `?tab=leaderboard` so links can open directly on the right tab.

---

## Leaderboards

- **Verified preference persisted:** The Verified/Unverified (or Verified XP / Total XP) choice is **saved and restored on refresh** everywhere:
  - Global leaderboards page (map view and rank view)
  - Per-map leaderboard tab
  - World Records modal (All vs Verified filter)
- One shared preference key is used so the choice is consistent across all of these. Auto-switching to unverified when there are no verified runs also updates the stored preference.

---

## UI

- **Customize blocks modal:** Modal is wider (`size="full"`), uses a responsive grid with a 200px minimum column width and **single-line truncation** for block labels to avoid text wrapping/bleed. Full label remains in the tooltip.
