import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Find Group',
  description:
    'Find players to squad up for CoD Zombies Easter eggs and high rounds. Post or browse listings for main quests and multiplayer on every Treyarch Zombies map. Chat, Discord, and team up.',
  openGraph: {
    title: 'Find Group | CoD Zombies Tracker - Squad Up for Easter Eggs',
    description: 'Find players to group up for CoD Zombies Easter eggs, main quests, and high rounds. Post and browse listings.',
    type: 'website',
  },
  alternates: { canonical: `${BASE}/find-group` },
};

export default function FindGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
