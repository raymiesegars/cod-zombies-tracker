import type { Metadata } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://codzombiestracker.com';

export const metadata: Metadata = {
  title: 'About',
  description:
    'CoD Zombies Tracker is a free, open source project with no ads or paywalls. Tips help keep the site running. Rank icon disclaimer and contact.',
  openGraph: {
    title: 'About | CoD Zombies Tracker',
    description:
      'Free, open source CoD Zombies tracker. No monetization, no ads. Rank icon disclaimer and how to support the project.',
    url: `${BASE}/about`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
