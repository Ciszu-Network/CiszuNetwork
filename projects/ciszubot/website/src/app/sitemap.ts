import { CHANGELOG_DATA } from '@/data/changelog';

export const dynamic = 'force-static';

const BASE = 'https://ciszubot.vercel.app';

const ROUTES = [
  '',
  'comandos',
  'dashboard',
  'descargas',
  'estado',
  'feedback',
  'privacidad',
  'soporte',
  'terminos',
  'changelog',
  'donate',
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