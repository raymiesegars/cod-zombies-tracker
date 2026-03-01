'use client';

import Image from 'next/image';
import { RANKS, getRankIconPath, MAX_LEVEL, TOTAL_OBTAINABLE_XP } from '@/lib/ranks';

export function RankHelpContent() {
  const rank100Xp = Math.floor(TOTAL_OBTAINABLE_XP * 0.93);
  return (
    <div className="space-y-5 text-sm text-bunker-200">
      <section>
        <h3 className="text-base font-semibold text-white mb-2">How you level up</h3>
        <p className="mb-2">
          You earn XP by playing and logging your runs. Your total XP decides your level and rank (1–{MAX_LEVEL}). Hit the next rank’s XP threshold and you level up.
        </p>
        <p>
          XP is permanent. We don’t remove it when you delete a log, but we do subtract XP if you revoke an achievement or re-lock one.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-2">Where you earn XP</h3>
        <ul className="list-disc list-inside space-y-1 text-bunker-300">
          <li><strong className="text-bunker-200">Challenge runs</strong> – Log a Highest Round, No Downs, or other challenge. XP depends on the round you reached and the map’s milestones.</li>
          <li><strong className="text-bunker-200">Main quest Easter eggs</strong> – Complete the main quest on a map and check off the final step. You get XP once per Easter egg per account.</li>
          <li><strong className="text-bunker-200">Achievements</strong> – Unlock map achievements (round milestones, challenge completions, EE completions). Each achievement pays out XP once.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-2">Rank display: total vs verified</h3>
        <p className="text-bunker-400 text-xs mb-2">
          Your <strong className="text-bunker-300">rank</strong> is always computed from XP. On leaderboards you can switch between <strong className="text-bunker-300">total XP</strong> (all runs) and <strong className="text-bunker-300">verified XP</strong> (verified runs only); your level and rank update to match the chosen XP.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-3">All ranks and XP required (1–{MAX_LEVEL})</h3>
        <p className="text-bunker-400 text-xs mb-3">
          Level 1 starts at 0 XP. Each row shows the total XP needed to reach that level. Rank {MAX_LEVEL} requires {rank100Xp.toLocaleString()} XP (about 93% of all obtainable XP on the site). Badges: rank1.webp through rank99.webp, rank100.png.
        </p>
        <div className="overflow-x-auto -mx-1 max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse text-left min-w-[320px]">
            <thead className="sticky top-0 bg-bunker-900 z-10">
              <tr className="border-b border-bunker-600">
                <th className="py-2 pr-2 text-bunker-400 font-medium">Lvl</th>
                <th className="py-2 pr-2 text-bunker-400 font-medium">Rank</th>
                <th className="py-2 text-bunker-400 font-medium">XP required</th>
              </tr>
            </thead>
            <tbody>
              {RANKS.map((r) => (
                <tr key={r.level} className="border-b border-bunker-800">
                  <td className="py-2 pr-2 font-medium text-white">{r.level}</td>
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src={getRankIconPath(r.icon)}
                        alt=""
                        width={24}
                        height={24}
                        className="object-contain flex-shrink-0"
                        unoptimized
                      />
                      <span className="text-bunker-200">{r.name}</span>
                    </span>
                  </td>
                  <td className="py-2 text-bunker-300">{r.xpRequired.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
