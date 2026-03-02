import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/^https?:\/\/www\./, 'https://').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'About',
  description:
    'CoD Zombies Tracker is a free, open source project with no ads or paywalls. Tips help keep the site running. Contact.',
  openGraph: {
    title: 'About | CoD Zombies Tracker',
    description:
      'Free, open source CoD Zombies tracker. No monetization, no ads. How to support the project and contact.',
    url: `${BASE}/about`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
