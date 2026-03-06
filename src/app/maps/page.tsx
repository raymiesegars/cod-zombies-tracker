import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { MapsPageClient } from './MapsPageClient';
import type { MapWithGame, Game } from '@/types';

export const revalidate = 300;

const getCachedMaps = unstable_cache(
  () =>
    prisma.map.findMany({
      include: { game: true },
      orderBy: [
        { game: { order: 'asc' } },
        { order: 'asc' },
        { name: 'asc' },
      ],
    }),
  ['maps-page-maps'],
  { revalidate: 300 }
);

const getCachedGames = unstable_cache(
  () => prisma.game.findMany({ orderBy: { order: 'asc' } }),
  ['maps-page-games'],
  { revalidate: 300 }
);

export default async function MapsPage() {
  const [maps, games] = await Promise.all([getCachedMaps(), getCachedGames()]);

  return (
    <MapsPageClient
      initialMaps={maps as MapWithGame[]}
      initialGames={games as Game[]}
    />
  );
}
