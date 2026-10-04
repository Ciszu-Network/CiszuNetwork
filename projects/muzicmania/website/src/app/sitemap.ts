
export const dynamic = 'force-static';

const BASE = 'https://muzicmania.vercel.app';

const ROUTES = [
  '',
  'about',
  'changelog',
  'contact',
  'credits',
  'documentation',
  'donate',
  'download',
  'faq',
  'fddp2026',
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
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : route === 'library' || route === 'play' ? 0.8 : 0.6,
  }));
}