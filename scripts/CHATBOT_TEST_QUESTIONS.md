# Chatbot Test Questions (Skrine Zombies Info)

Use these to validate retrieval and answers before pushing. ✓ = has keyword trigger; ⚠ = likely needs keywords.

---

## ✓ Terminology (ZWR Glossary)

| Question | Expected source | Expected answer |
|----------|-----------------|-----------------|
| What is g-spawn? | Skrine General Info (or terminology chunk) | G-spawn is an error that occurs when you kill too many zombies at once in a spawn. E.g. shooting a ground spawn in SoE junction with a death machine—if multiple zombies spawn in a row at that spawn, it can cause a G-spawn error. |
| What does SPH mean? | ZWR Terminology Glossary | SPH = spawns per horde (or similar). Link to glossary. |
| Define AAT | ZWR Terminology Glossary | AAT = Alternative Ammo Type. Glossary definition. |
| What is spawn manip? | ZWR Terminology Glossary | Spawn manipulation – glossary definition. |

---

## ✓ Point Drops / Wonder Weapons (BO1) – has keywords

Data = wonder weapons (rayguns) needed to clear the round, Waffe shots per horde, drop chances. NOT "shot chance" or probability.

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| How many raygun PAP shots needed to clear round 1 solo vs 4p? | Point Drops | Round 1: Solo 0.6 shots, 4p 2.4 shots. (Shots = rayguns needed to clear round.) |
| How many Waffe shots per horde on round 5? | Point Drops | 2.4 shots (solo 1p). 2.7 (2p), 3.2 (3p), 3.7 (4p). |
| What's the drop chance for solo round 1 on Ascension? | Point Drops | DROPS = 0.01 (1%) per zombie. Note: BO1 maps only, not WaW. |
| DG2 shots needed round 10 solo? | Point Drops | DG2 (PAP) column – look up round 10. Wonder-weapon shots needed. |
| VR-11 shots needed round 5? | Point Drops | VR-11 (PAP) columns in the table (wonder weapons needed per round). |

---

## ✓ Instakill & Health Scale (WaW) – has keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| How does zombie health scale with dog rounds on Nacht? | Instakill Rounds | Zombie Round 1 → Health 150, Dog Round 7; Round 2 → 250, Dog 12; etc. |
| What's the instakill round for Nacht solo? | Instakill Rounds | Round 1 instakill time 0:09 solo, etc. |
| Verruckt health scale dog round? | Instakill Rounds | Same structure: Zombie Round, Health Scale, Dog Round. |
| Shi No Numa zombie health by dog round? | Instakill Rounds | Round 1: 150, 6; Round 2: 250, 10; etc. |
| Der Riese health scale? | Instakill Rounds | Round 1: 150, 5; Round 2: 250, 9; etc. |

---

## ⚠ Map Reset Times – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| What's the Nacht reset time? | Map Reset Times | WaW Nacht: 165h (approximation). |
| How long until Kino resets? | Map Reset Times | BO1 Kino: 75h30. BO3 Kino: 105h. |
| Map reset for Der Eisendrache? | Map Reset Times | DE: 63h. |
| When does ZiS reset? | Map Reset Times | ZiS: 110–120h. |
| Ascension reset time? | Map Reset Times | BO1 Ascension: 70h. BO3 Ascension: 112h. |
| Outbreak reset? | Map Reset Times | Outbreak: 71h. |

**Suggested keywords:** `reset`, `165`, `resets`, `hours`

---

## ⚠ Round Times (per-round vs cumulative) – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| What's the round 5 time solo? | Round – Per-round | 53.54 seconds. |
| Total time to reach round 10 solo? | Round – Cumulative | ~7:32.88 (from cumulative column). |
| How long is round 1 solo? | Round – Per-round | 19.03 seconds. |
| Time to complete round 20 duo? | Round – Per-round | 1:14.35 (from table). |
| Cumulative time to round 15 quad? | Round – Cumulative | ~11:38.64. |

**Suggested keywords:** `round time`, `per round`, `cumulative`, `total time to round`, `reach round`

---

## ⚠ Perfect & Expected Times / Moon – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| What are the round 30 and 50 solo times for Moon with megas vs classics? | Perfect & Expected | Moon 30 SR: Round 30 Megas vs Classics columns. Moon 50 SR+: Round 50. (Table has Megas/Classics per round.) |
| Perfect round 1 time solo? | Perfect & Expected | 18.650 seconds. |
| Expected round 5 time quad? | Perfect & Expected | 36.100 seconds. |
| Moon solo round times megas vs classics? | Perfect & Expected | Moon 30 SR / Moon 50 SR+ sections with Round, Megas, Classics. |
| SoE symbol guide? | Perfect & Expected | Shadows of Evil Symbol Guide / AAT Info in same chunk. |

**Suggested keywords:** `perfect time`, `expected time`, `moon`, `megas`, `classics`, `round 30`, `round 50`

---

## ⚠ Firebase Z (Cold War) – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| What's the best Firebase Z trial combo? | A1+A2 / 4p | A1+A2 = 39s (ideal). A1+B2, A1+C2 = 41s. |
| Firebase Z ideal trial combos? | A1+A2 | A1+A2 39s, A1+B2 41s, B1+A2 43s, etc. |
| How many kills for Firebase Z gens solo? | A1+A2 | Rnd 4 Spd Gen: 6 kills solo. Rnd 5 Jug Gen: 0 kills solo. |
| Firebase Z 4p trial kills needed? | A1+A2 / 4p | 4p = 16 trials; Rnd 5 Jug: 15 kills for 4p. |
| Weaver trial quotes Firebase Z? | A1+A2 | A1 "No more games" Well 31s, etc. |

**Suggested keywords:** `firebase z`, `trial`, `ideal combo`, `weaver`, `peck`, `a1`, `a2`, `cold war`

---

## ⚠ IW / ZiS / Carrier – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| ZiS round 1 solo time? | NOT ACTUAL TIMES / Round | 0:13 (sheet 10). Note: estimates. |
| Carrier bomb times? | NOT ACTUAL TIMES | 1P, 2P, 3P, 4P columns per round. |
| IW Zombies spawn delay formula? | NOT ACTUAL TIMES | Spawn delay = 2 × 0.95^(Round-1). Max spawn rate round 64 = 0.08. |
| Zombies in Spaceland first room round 1? | Table 1 (sheet 8) | 30.65 seconds no C4, 30.65 with C4. |
| Moon 30 SR round 1 time? | NOT ACTUAL TIMES | 0:13 1P, etc. (sheet 10). |

**Suggested keywords:** `zombies in spaceland`, `zis`, `carrier`, `iw`, `infinite warfare`, `bomb time`, `spawn delay`

---

## ⚠ Vanguard / Blitz / Transmit – needs keywords

| Question | Expected chunk | Expected answer |
|----------|----------------|-----------------|
| Vanguard Blitz round times? | 4p (sheet 11) | R1 = 1:00, R2 = 1:30, R3 = 2:00, R4 = 2:30, R5+ = 3:00. |
| Harvest stones per player Vanguard? | 4p | 1p = 5 stones, 2p = 5, 3p = 7, 4p = 9. |
| Transmit times Terra Maledicta? | 4p | Trains top 0:58–1:01, bottom 1:00–1:03, etc. |
| Purge circles 4p? | 4p | 1p = 10, 2p = 17, 3p = 24, 4p = 30. |
| Shi No Numa transmit time? | 4p | SNN top 0:53–0:55, bottom 0:48–0:51. |

**Suggested keywords:** `blitz`, `transmit`, `harvest`, `purge`, `vanguard`, `terra maledicta`, `anfang`

---

## Chunk summary (for keyword expansion)

| Chunk title contains | Add keywords |
|----------------------|--------------|
| Point Drops | ✓ raygun, waffe, shots needed, wonder weapons, drop chance |
| Instakill Rounds | ✓ health scale, dog round, zombie health |
| Map Reset Times | reset, 165h, resets, hours |
| Round – Per-round / Cumulative | round time, per round, cumulative, total time to round |
| Perfect & Expected | perfect time, expected time, moon, megas, classics |
| A1+A2 / 4p = 16 | firebase z, trial, ideal combo, cold war |
| NOT ACTUAL TIMES | zis, carrier, iw, infinite warfare, bomb time |
| 4p (sheet 11) | blitz, transmit, harvest, purge, vanguard |
