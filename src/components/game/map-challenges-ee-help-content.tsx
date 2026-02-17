'use client';

export function MapChallengesEeHelpContent() {
  return (
    <div className="space-y-5 text-sm text-bunker-200">
      <section>
        <h3 className="text-base font-semibold text-white mb-2">Challenges</h3>
        <p className="mb-2">
          Challenges are round-based runs with rules: Highest Round (no special rules), No Downs, Pistol Only, No Perks, and others. Each map has a set of challenge types you can log.
        </p>
        <p>
          When you log a run, you pick the challenge and the round you reached. That run can count toward the leaderboard and toward achievements. XP depends on the round and the map’s milestones.
        </p>
      </section>
      <section>
        <h3 className="text-base font-semibold text-white mb-2">Easter eggs</h3>
        <p className="mb-2">
          <strong className="text-bunker-200">Main quest</strong> – The big story Easter egg for the map. We have step-by-step guides; you can check off steps as you go. Finishing the main quest gives XP once per Easter egg per account.
        </p>
        <p className="mb-2">
          <strong className="text-bunker-200">Musical & side eggs</strong> – Songs, small quests, and other secrets. They’re listed here with guides and step tracking too. Some give XP, some are just for completion.
        </p>
        <p>
          Buildables (e.g. shields, wonder weapons) are listed under Easter Eggs where they have their own steps. Use the tabs and filters on this page to switch between overview, achievements, eggs, and the leaderboard.
        </p>
      </section>
    </div>
  );
}
