import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oric.shu.edu.pk';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/projects',
    '/radar',
    '/erl-assessment',
    '/discussions',
    '/reports'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}

