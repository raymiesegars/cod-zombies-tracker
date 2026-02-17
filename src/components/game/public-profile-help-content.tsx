'use client';

export function PublicProfileHelpContent() {
  return (
    <div className="space-y-4 text-sm text-bunker-200">
      <p>
        When your profile is <strong className="text-bunker-200">public</strong>, anyone with your profile link can see your stats: maps played, Easter eggs completed, high rounds, achievements, and rank. Your profile can also show up in search and on the site.
      </p>
      <p>
        When it’s <strong className="text-bunker-200">private</strong>, your profile page only shows a minimal view to others. You still see everything when you’re logged in. Your username and basic presence (e.g. on Find Group) may still be visible; we just hide your progress and stats.
      </p>
    </div>
  );
}
