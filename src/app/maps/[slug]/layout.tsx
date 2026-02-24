import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/^https?:\/\/www\./, 'https://').replace(/\/$/, '');

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const map = await prisma.map.findUnique({
    where: { slug },
    include: { game: true },
  });

  if (!map) {
    return { title: 'Map Not Found' };
  }

  const title = `${map.name} (${map.game.shortName}) - Easter Egg Guide & Leaderboard`;
  const description = `${map.name} - ${map.game.name}. Step-by-step Easter egg guide, challenges, high round leaderboard, and progress tracking. CoD Zombies Tracker.`;

  return {
    title,
    description,
    openGraph: {
      title: `${map.name} | CoD Zombies Tracker`,
      description,
      type: 'website',
      url: `${baseUrl}/maps/${map.slug}`,
    },
    twitter: { card: 'summary_large_image', title: `${map.name} - CoD Zombies Tracker` },
    alternates: { canonical: `${baseUrl}/maps/${map.slug}` },
  };
}

export default async function MapSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const map = await prisma.map.findUnique({
    where: { slug },
    include: {
      game: true,
      easterEggs: {
        where: { type: 'MAIN_QUEST', isActive: true },
        take: 1,
        include: { steps: { orderBy: { order: 'asc' }, take: 30 } },
      },
    },
  });

  const jsonLd = map
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'VideoGame',
            name: map.name,
            description: `${map.name} - ${map.game.name}. Easter egg guide, high round leaderboard, and challenges on CoD Zombies Tracker.`,
            url: `${baseUrl}/maps/${map.slug}`,
            gamePlatform: 'PC, PlayStation, Xbox',
          },
          ...(map.easterEggs[0]?.steps.length
            ? [
                {
                  '@type': 'HowTo',
                  name: `${map.name} Main Quest Easter Egg Guide`,
                  description: `Step-by-step guide to complete the main Easter egg on ${map.name}.`,
                  url: `${baseUrl}/maps/${map.slug}`,
                  step: map.easterEggs[0].steps.slice(0, 15).map((s, i) => ({
                    '@type': 'HowToStep',
                    position: i + 1,
                    name: s.label?.slice(0, 100) || `Step ${i + 1}`,
                  })),
                },
              ]
            : []),
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
