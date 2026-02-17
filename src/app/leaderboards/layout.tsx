import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Leaderboards',
  description:
    'CoD Zombies high round and challenge leaderboards. Compete in Solo, Duo, Trio, or Squad. See top rounds and speedruns for every Treyarch Zombies map.',
  openGraph: {
    title: 'CoD Zombies Leaderboards | CoD Zombies Tracker',
    description: 'High round and challenge leaderboards for every map. Solo, Duo, Trio, Squad. Track who holds the top rounds.',
    type: 'website',
    url: `${BASE}/leaderboards`,
  },
  alternates: { canonical: `${BASE}/leaderboards` },
};

const leaderboardsFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do CoD Zombies leaderboards work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each map has its own leaderboard. We show one entry per player per player count (Solo, Duo, Trio, Squad). Your best round for that map and count is what counts. Ranks are sorted by round reached, highest first. Filter by map, player count, and challenge type (Highest Round, No Downs, No Perks, etc.).',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get on the Zombies leaderboard?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Log a run from the map page ("Log Progress") and choose the challenge type and player count. Your best run for that map and combo will show up on the leaderboard. You can log highest round, no downs, no perks, and other challenge types depending on the map.',
      },
    },
  ],
};

export default function LeaderboardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(leaderboardsFaqJsonLd) }} />
      {children}
    </>
  );
}
