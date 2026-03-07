export function TournamentRulesContent() {
  return (
    <div className="space-y-4 text-sm text-white">
      <div>
        <p className="font-bold text-white mb-1">Submission window</p>
        <p>
          All tournament submissions must be started during the first 9 days of the tournament countdown. The last 3 days are for finishing existing runs or uploading submissions. After the timer closes, the leaderboard closes and no further submissions will be accepted.
        </p>
      </div>
      <div>
        <p className="font-bold text-white mb-1">Proof of run start</p>
        <p>
          To prove when the run was started, you must either live stream the entire run or open Google at the beginning of the run, search &quot;what day is today&quot;, and hit Enter—with no cuts or splices.
        </p>
      </div>
      <div>
        <p className="font-bold text-white mb-1">Top 3 verification</p>
        <p>
          To win top 3, you must follow all the{' '}
          <a href="/rules" className="text-amber-400 hover:text-amber-300 underline">
            official rules for submission
          </a>
          . Anyone is welcome to submit a run without following the rules, but the top 3 runs will be verified before prizes are given out or medals are awarded.
        </p>
      </div>
    </div>
  );
}
