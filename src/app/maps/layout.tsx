import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'All Maps',
  description:
    'Every CoD Zombies map from World at War to Black Ops 7, including IW and WWII. Easter egg guides, challenges, leaderboards, and progress tracking for each map.',
  openGraph: {
    title: 'All CoD Zombies Maps | CoD Zombies Tracker',
    description: 'Browse every CoD Zombies map. Guides, leaderboards, and tracking for WAW, BO1, BO2, BO3, IW, WW2, BO4, BOCW, BO6, BO7.',
    type: 'website',
    url: `${BASE}/maps`,
  },
  alternates: { canonical: `${BASE}/maps` },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
