type TournamentRulesVariant = 'default' | 'prominent';

export function TournamentRulesContent({ variant = 'default' }: { variant?: TournamentRulesVariant }) {
  const isProminent = variant === 'prominent';

  return (
    <div className="space-y-4 text-sm text-white">
      <div>
        <p className="font-bold text-white mb-1">Duration and submissions</p>
        <p>
          Each tournament lasts <strong className="text-amber-200">12 days</strong>. Every submission must be sent in before the{' '}
          <strong className="text-amber-200">12-day countdown on the tournament page reaches zero</strong>. Late submissions are never accepted.
        </p>
      </div>
      <div>
        <p className="font-bold text-white mb-1">When your run counts</p>
        <p>Every run must be played in full during that 12-day window. Runs started or finished outside the window are not valid for the tournament.</p>
      </div>
      <div>
        <p className="font-bold text-white mb-1">ZWR and category rules</p>
        <p>
          All submissions must follow{' '}
          <a href="/rules" className="text-amber-400 hover:text-amber-300 underline">
            ZWR rules for the tournament category
          </a>{' '}
          (and any game-specific requirements listed there).
        </p>
      </div>
      <div>
        <p className="font-bold text-white mb-1">Speed tournaments</p>
        <p>For any speed-related tournament, you must include adequate proof of resets in the same session, as required for verification.</p>
      </div>

      <div
        className={
          isProminent
            ? 'rounded-2xl border-2 border-amber-500/90 bg-gradient-to-b from-amber-950/80 to-bunker-900 p-5 sm:p-6 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30'
            : 'rounded-xl border border-amber-600/50 bg-amber-950/25 p-4'
        }
      >
        <p
          className={
            isProminent
              ? 'text-center text-amber-100 font-zombies font-bold tracking-wide uppercase text-base sm:text-lg mb-3'
              : 'font-bold text-amber-200 mb-1'
          }
        >
          {isProminent ? 'Required: clan tag or emblem' : 'Clan tag or emblem (required)'}
        </p>
        {isProminent ? (
          <p className="text-center text-xl sm:text-2xl font-extrabold text-white leading-snug mb-4">
            You <span className="text-amber-300">must</span> set the secret clan tag <span className="text-amber-200">or</span> emblem announced for this tournament.
          </p>
        ) : null}
        <p className={isProminent ? 'text-base sm:text-lg text-bunker-100 leading-relaxed text-center' : ''}>
          Check the <strong className="text-white">Discord announcements</strong> channel for the secret clan tag or emblem for this event. Your run is{' '}
          <strong className="text-amber-200">not valid</strong> unless that clan tag or emblem appears as required in your proof.
        </p>
        <p className={`mt-3 text-bunker-200 ${isProminent ? 'text-sm sm:text-base text-center' : ''}`}>
          If the current tournament game has no way to set a clan tag or emblem, we will post instructions in Discord on how to validate the date of your run instead.
        </p>
      </div>
    </div>
  );
}
