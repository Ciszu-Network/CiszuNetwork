import { CHANGELOG_DATA } from '@/data/changelog';

export const dynamic = 'force-static';

const BASE = 'https://ciszubot.vercel.app';

const ROUTES = [
  '',
  'commands',
  'downloads',
  'stats',
  'feedback',
  'support',
  'changelog',
  'reviews',
  'forum',
  'contact',
  'documentation',
  'leaderboard',
  'donate',
  'information',
  'about',
  'team',
  'credits',
  'help',
  'faq',
  'guidelines',
  'rules',
  'license',
  'policy',
  'privacy',
  'terms',
  'invite',
  'explore',
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