
export const dynamic = 'force-static';

const BASE = 'https://ciszunetwork.vercel.app';

const ROUTES = [
  '',
  'about',
  'contact',
  'cursos',
  'descargas',
  'donate',
  'faq',
  'feedback',
  'guidelines',
  'policies',
  'support',
  'team',
  'projects/ciszugamens',
  'projects/ciszubot',
  'projects/ciszunetwork',
  'projects/ciszukoantony',
  'projects/muzicmania',
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}