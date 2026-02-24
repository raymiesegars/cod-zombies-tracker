import { MetadataRoute } from 'next';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/^https?:\/\/www\./, 'https://').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/settings', '/auth/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/settings', '/auth/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
