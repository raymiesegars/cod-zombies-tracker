'use client';

import Image from 'next/image';
import { RANKS, getRankIconPath } from '@/lib/ranks';

export function RankHelpContent() {
  return (
    <div className="space-y-5 text-sm text-bunker-200">
      <section>
        <h3 className="text-base font-semibold text-white mb-2">How you level up</h3>
        <p className="mb-2">
          You earn XP by playing and logging your runs. Your total XP decides your level and rank. Hit the next rank’s XP threshold and you level up.
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
        <h3 className="text-base font-semibold text-white mb-3">All ranks and XP required</h3>
        <p className="text-bunker-400 text-xs mb-3">Level 1 starts at 0 XP. Each row shows the total XP needed to reach that level.</p>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full border-collapse text-left min-w-[320px]">
            <thead>
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
