
export const dynamic = 'force-static';

const BASE = 'https://ciszunetwork.vercel.app';

const ROUTES = [
  '',
  'about',
  'contact',
  'descargas',
  'faq',
  'feedback',
  'guidelines',
  'policies',
  'support',
  'team',
  'projects/ciszunetwork',
  'projects/ciszukoantony',
  'projects/discord',
  'projects/minecraft',
  'projects/muzicmania',
  'projects/telegram',
  'projects/whatsapp',
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}