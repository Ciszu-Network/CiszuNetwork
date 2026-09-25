import { CHANGELOG_DATA } from '@/data/changelog';

export const dynamic = 'force-static';

const BASE = 'https://ciszunetwork.vercel.app';

const ROUTES = [
  '',
  'about',
  'contact',
  'courses',
  'descargas',
  'donate',
  'faq',
  'feedback',
  'policies',
  'support',
  'team',
  'changelog',
  'reviews',
   'stats',
   'forum',
  'documentation',
  'help',
  'information',
  'projects',
  'projects/ciszugamens',
  'projects/ciszubot',
  'projects/ciszunetwork',
  'projects/ciszukoantony',
  'projects/muzicmania',
  // Una URL por entrada del registro de cambios (página interna de detalle).
  ...CHANGELOG_DATA.map((item) => `changelog/${item.id}`),
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}