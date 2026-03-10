import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'All Maps',
  description:
    'Every CoD Zombies map: WAW, BO1–7, IW, WW2, AW, Vanguard, MW2, plus BO3 Custom Zombies. Easter egg guides, challenges, speedruns, leaderboards. Submit custom maps for review. Customize view order.',
  openGraph: {
    title: 'All CoD Zombies Maps & BO3 Custom Zombies | CoD Zombies Tracker',
    description: 'Browse every CoD Zombies map and BO3 Custom Zombies. Guides, leaderboards, challenges. Submit custom maps for WAW, BO1–7, IW, WW2, AW, Vanguard, MW2.',
    type: 'website',
    url: `${BASE}/maps`,
  },
  alternates: { canonical: `${BASE}/maps` },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
