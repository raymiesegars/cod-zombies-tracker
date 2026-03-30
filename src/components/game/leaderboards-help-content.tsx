'use client';

export function LeaderboardsHelpContent() {
  return (
    <div className="space-y-5 text-sm text-bunker-200">
      <section>
        <h3 className="text-base font-semibold text-white mb-2">How the leaderboard works</h3>
        <p className="mb-2">
          Each map has its own board. We show one entry per player per player count (Solo, Duo, Trio, Squad). Your best round for that map and count is what counts—we don’t list every run, just your top one.
        </p>
        <p>
          Ranks are sorted by round reached, highest first. Ties are possible; we still show one row per person so you see who’s at the top.
        </p>
      </section>
      <section>
        <h3 className="text-base font-semibold text-white mb-2">Site-wide leaderboards</h3>
        <p>
          Under <strong className="text-bunker-200">Rank (by XP)</strong> everyone is ordered by total or verified XP (and Custom Zombies variants). Under <strong className="text-bunker-200">Rank 1&apos;s (site)</strong> we rank by how many leaderboard combinations you hold #1 on. In <strong className="text-bunker-200">All games</strong>, these totals match your profile Rank 1&apos;s / Verified Rank 1&apos;s stats for the same mode.
        </p>
      </section>
      <section>
        <h3 className="text-base font-semibold text-white mb-2">Filters</h3>
        <p className="mb-2">
          Pick a map (and optionally a game first to narrow the list). Then filter by <strong className="text-bunker-200">player count</strong> (Solo, Duo, etc.) and <strong className="text-bunker-200">challenge type</strong> (Highest Round, No Downs, and others). The board updates to show only runs that match.
        </p>
        <p>
          To get on the board, log a run from the map page (“Log Progress”) and choose the right challenge and player count. Your best run for that combo will show up here.
        </p>
      </section>
    </div>
  );
}
