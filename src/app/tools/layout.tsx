import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'More Zombies Tools',
  description:
    'Links to other useful CoD Zombies tools: Zombacus (calculators, strategies, trackers) and ZWR (official verified Zombies world records and leaderboards).',
  openGraph: {
    title: 'More Zombies Tools | CoD Zombies Tracker',
    description: 'Zombacus, ZWR, and other useful Call of Duty Zombies tools and verified leaderboards.',
    type: 'website',
  },
  alternates: { canonical: `${BASE}/tools` },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
