import type { SpeedrunGauntletConfig } from '@/lib/speedrun-gauntlet';

type Props = {
  gauntlet: SpeedrunGauntletConfig;
};

export function SpeedrunGauntletRulesContent({ gauntlet }: Props) {
  return (
    <div className="space-y-5 text-sm text-bunker-100">
      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Event Setup</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          <li>Map: {gauntlet.mapDisplayName} (BO7)</li>
          <li>Category: Main Quest Easter Egg Speedrun</li>
          <li>Mode: Cursed mode</li>
          <li>Player count: Solo only</li>
          <li>
            Timer: Starts when you gain character control, ends when {gauntlet.timerEndCondition}
          </li>
          <li>Timing format: RTA (pausing does not pause time)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Required Relics (all 10)</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {gauntlet.requiredRelicLabels.map((relic) => (
            <li key={relic}>{relic}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Core Run Restrictions</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {gauntlet.coreRestrictions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {gauntlet.sideQuestNotes.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-base font-zombies text-white">Side Quests</h3>
          <ul className="list-disc list-inside space-y-1 text-bunker-200">
            {gauntlet.sideQuestNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Bans & Restrictions</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {gauntlet.bannedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-zombies text-white">Gobblegums</h3>
        <p className="text-bunker-300">
          You can only use the following gums, and each is limited to {gauntlet.gobblegumUseLimit}{' '}
          {gauntlet.gobblegumUseLimit === 1 ? 'use' : 'uses'} per run:
        </p>
        <ul className="list-disc list-inside space-y-1 text-bunker-200">
          {gauntlet.allowedGobblegums.map((gum) => (
            <li key={gum}>
              {gum} (max {gauntlet.gobblegumUseLimit}{' '}
              {gauntlet.gobblegumUseLimit === 1 ? 'use' : 'uses'})
            </li>
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
