import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const PRODUCTION_DOMAIN = 'https://codzombiestracker.com'; // Canonical: no www

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || '';
  const env = raw.trim().replace(/\/$/, '').replace(/^https?:\/\/www\./, 'https://'); // Strip www
  if (process.env.NODE_ENV === 'production' && (!env || env.includes('localhost'))) {
    return PRODUCTION_DOMAIN;
  }
  return env || PRODUCTION_DOMAIN;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getBaseUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/maps`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/leaderboards`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/find-group`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.85 },
    { url: `${BASE_URL}/mystery-box`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
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
