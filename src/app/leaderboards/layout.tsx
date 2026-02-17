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

export default function LeaderboardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
