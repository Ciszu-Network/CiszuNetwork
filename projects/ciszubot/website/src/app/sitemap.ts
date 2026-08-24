
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
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}