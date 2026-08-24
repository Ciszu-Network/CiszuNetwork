
export const dynamic = 'force-static';

const BASE = 'https://muzicmania.vercel.app';

const ROUTES = [
  '',
  'about',
  'changelog',
  'contact',
  'credits',
  'documentation',
  'download',
  'faq',
  'feedback',
  'forum',
  'guidelines',
  'help',
  'information',
  'leaderboard',
  'library',
  'license',
  'play',
  'policy',
  'profile',
  'reviews',
  'rules',
  'stats',
  'support',
  'team',
  'terms',
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}