const REQUIRED_RELICS = [
  'Teddy Bear - Round start delay is cut down by 75%',
  'Dragon Wings - Normal power-up spawns are disabled',
  'Gong - Field Upgrade starts charged, but can only be charged by full power',
  'Seed - No Mystery Box',
  'Rocket - No Score Streaks',
  'Focusing Stone - No Self-Revive kits',
  'Spider Fang - Perk costs at machines never decrease',
  'Elephant - Health regen delay is increased',
  'Bus - Enemy health regenerates',
  'Spork - Enemies deal double damage',
];

const BANNED_ITEMS = [
  'Mask of Salvation (Wisp Tea)',
  'Mask of Benevolence (Wisp Tea)',
  'Free Throw (Mule Kick)',
  'Multi-Pack (Mule Kick)',
  'Kick Back (Mule Kick)',
  'Iron Core (Juggernog)',
  'Shake It Off (Juggernog)',
  'Prestidigitation (Speed Cola)',
  'Equivalent Exchange (Quick Revive)',
  'Imperil Peach (Elemental Pop)',
  'Pineapple Blast (Elemental Pop)',
  'Smell of Death (Vulture-Aid)',
  'Picky Eater (Vulture-Aid)',
  'Barista Brawl (Melee Macchiato)',
  'Double Whammy (PhD Flopper)',
  'Stuntman (PhD Flopper)',
  'Sixth Sense (Death Perception)',
  'Haywire (Tesla Storm)',
  "All Tyr Secret Room wall weapons/equipment found inside those rooms",
  'Stim Shots',
  'Aether Shroud',
];

const ALLOWED_GOBBLEGUMS = [
  'Wall Power',
  'Cache Back',
  'Dead Drop',
  "Who's Keeping Score",
  'Temporal Gift',
];

export function SpeedrunGauntletRulesContent() {
  return (
    <div className="space-y-5 text-sm text-bunker-100">
      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Event Setup</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          <li>Map: Totenreich (BO7)</li>
          <li>Category: Main Quest Easter Egg Speedrun</li>
          <li>Mode: Cursed mode</li>
          <li>Player count: Solo only</li>
          <li>Timer: Starts when you gain character control, ends when Dravakar&apos;s health bar disappears</li>
          <li>Timing format: RTA (pausing does not pause time)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Required Relics (all 10)</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {REQUIRED_RELICS.map((relic) => (
            <li key={relic}>{relic}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Core Run Restrictions</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          <li>High Contrast Mode is not allowed</li>
          <li>No Mister Peeks eggs (bronze, silver, gold)</li>
          <li>No relic trials to counter active relics</li>
          <li>TEDD tasks are not allowed</li>
          <li>No Pack-a-Punch crystals/Aether tools from Die Glocke streak</li>
          <li>Free power-ups are allowed except free Fire Sale</li>
          <li>No unique helmet side quests</li>
          <li>No Olaf&apos;s Cod Cranker for extra score streak pulls</li>
          <li>No power-ups from Tyr&apos;s head kill-coordinate side quest</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Bans & Restrictions</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {BANNED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Gobblegums</h3>
        <p className="text-bunker-300">
          You can only use the following gums, and each is limited to two uses per run:
        </p>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {ALLOWED_GOBBLEGUMS.map((gum) => (
            <li key={gum}>{gum} (max 2 uses)</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Submissions & Verification</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          <li>Proof URL is required when submitting for verification</li>
          <li>Top 5 submissions must include proof of resets</li>
          <li>Runs that break rules are invalidated</li>
          <li>Repeat offenses may lead to disqualification</li>
        </ul>
      </section>
    </div>
  );
}
