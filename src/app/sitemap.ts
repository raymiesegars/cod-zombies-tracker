import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/maps`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/leaderboards`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/find-group`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
  ];

  try {
    const mapSlugs = await prisma.map.findMany({ select: { slug: true } });
    const mapRoutes: MetadataRoute.Sitemap = mapSlugs.map((m) => ({
      url: `${BASE_URL}/maps/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...mapRoutes];
  } catch {
    return staticRoutes;
  }
}
