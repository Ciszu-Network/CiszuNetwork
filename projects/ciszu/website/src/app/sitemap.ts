import { CHANGELOG_DATA } from '@/data/changelog';
import { SERVICE_SLUGS } from '@/data/services';

export const dynamic = 'force-static';

const BASE = 'https://ciszunetwork.vercel.app';

const ROUTES = [
  '',
  'about',
  'contact',
  'courses',
  'downloads',
  'donate',
  'faq',
  'feedback',
  'guidelines',
  'help',
  'information',
  'license',
  'policy',
  'reviews',
  'rules',
  'stats',
  'support',
  'team',
  'changelog',
  'documentation',
  'services',
  'reset-password',
  // Una URL por servicio del catálogo (página interna de detalle).
  ...SERVICE_SLUGS.map((slug) => `services/${slug}`),
  'projects',
  'projects/ciszugamens',
  'projects/ciszubot',
  'projects/ciszunetwork',
  'projects/ciszukoantony',
  'projects/muzicmania',
  'ciszubot',
  'ciszugamens',
  'ciszukoantony',
  'muzicmania',
  // Una URL por entrada del registro de cambios (página interna de detalle).
  ...CHANGELOG_DATA.map((item) => `changelog/${item.id}`),
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : route.startsWith('changelog/') ? 0.5 : 0.7,
  }));
}