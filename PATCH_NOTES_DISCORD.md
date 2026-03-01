**📋 Patch Notes**

---

**🏆 Ranks & Levels (1–100)**
• Ranks now go 1–100. Levels 1–80 match the feel of the old 1–20 curve; 81–100 ramp up so **Rank 100 = 93% of all obtainable XP** on the site.
• Badges: `rank1.webp` through `rank99.webp`, and `rank100.png` in the same ranks folder.
• Rank help updated: full 1–100 table, badge names, and a note on total vs verified rank.
• Leaderboard rank is always calculated from your XP (no more stale stored level).

---

**✅ Achievements**
• **"Verified only" toggle persists.** Turn it off (show "All") and it stays that way after refresh on any map or the dashboard.
• The one-time "Verified achievements" popup no longer shows on every refresh.
• **Verified Achievements block is clickable.** Opens a modal with breakdown by game and by map (same layout as the normal Achievements modal).
• Clicking a map in either achievement modal takes you to **that map’s page with the Achievements tab open** (`?tab=achievements`).
• Map pages now respect `?tab=achievements`, `?tab=your-runs`, etc. in the URL so links open on the right tab.

---

**📊 Leaderboards**
• **Verified / Unverified choice is saved.** Your selection is remembered across refresh everywhere:
  → Global leaderboards (map view + rank view)  
  → Per-map leaderboard tab  
  → World Records modal (All vs Verified)
• One shared preference: switch to Unverified in one place and it stays Unverified everywhere until you change it back.
• When the site auto-switches to Unverified (e.g. no verified runs on that leaderboard), that choice is saved too.

---

**🎛️ UI**
• **Customize blocks modal:** Wider layout, labels stay on one line (no text wrap/bleed), 200px min column width. Full name still in tooltip on hover.

---

*Optional DB step: run `pnpm db:sync-level-thresholds` once to fill the LevelThreshold table with the new 1–100 ranks. Rank display works from code either way.*
