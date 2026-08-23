import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = 'https://ciszukoantony.vercel.app';

const ROUTES = [
  '',
  'about',
  'certificates',
  'contact',
  'descargas',
  'faq',
  'feedback',
  'policies',
  'projects',
  'support',
  'team',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}