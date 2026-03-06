/**
 * Competition ranking: ties get the same rank (e.g. 255,255,254,253 → rank 1,1,2,3).
 * @param entries Sorted array (caller must sort before calling)
 * @param getValue Value getter for comparison
 * @param invertRanking false = higher is better (rounds, kills, score), true = lower is better (time)
 */
export function assignCompetitionRanks<T>(
  entries: T[],
  getValue: (e: T) => number,
  invertRanking: boolean
): (T & { rank: number })[] {
  if (entries.length === 0) return [];
  let rank = 1;
  const result: (T & { rank: number })[] = [];
  for (let i = 0; i < entries.length; i++) {
    const curr = entries[i]!;
    const currVal = getValue(curr);
    if (i > 0) {
      const prevVal = getValue(entries[i - 1]!);
      if (currVal !== prevVal) rank = i + 1;
    }
    result.push({ ...curr, rank });
  }
  return result;
}
