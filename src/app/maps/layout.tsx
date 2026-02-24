import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'All Maps',
  description:
    'Every CoD Zombies map: WAW, BO1–7, IW, WW2, AW, Vanguard, MW2. Easter egg guides, challenges, speedruns, leaderboards, co-op logging. Customize view order.',
  openGraph: {
    title: 'All CoD Zombies Maps | CoD Zombies Tracker',
    description: 'Browse every CoD Zombies map. Guides, leaderboards, challenges for WAW, BO1–7, IW, WW2, AW, Vanguard, MW2.',
    type: 'website',
    url: `${BASE}/maps`,
  },
  alternates: { canonical: `${BASE}/maps` },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
