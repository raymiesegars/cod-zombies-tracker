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

const findGroupFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find people to do CoD Zombies Easter eggs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the Find Group page to browse listings by map and game. Each listing shows desired player count, platform (PC, PlayStation, Xbox), and contact info like Discord or Steam. Open a listing and use the chat to coordinate, or create your own listing so others can find you for main quests and high rounds.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create a Find Group listing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click "Create listing," pick a map and optionally a specific main quest Easter egg, choose desired player count (1–4), add your contact info (Discord, Steam, Xbox), and optional notes. Listings expire after 30 days. Only the creator can edit or delete; everyone can view and send messages.',
      },
    },
  ],
};

export default function FindGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(findGroupFaqJsonLd) }} />
      {children}
    </>
  );
}
