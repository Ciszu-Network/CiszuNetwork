import { CHANGELOG_DATA } from '@/data/changelog';
import { PROJECTS } from '@/data/projects';
import { SOCIAL_IDS } from '@/data/socials';

export const dynamic = 'force-static';

const BASE = 'https://ciszukoantony.vercel.app';

const ROUTES = [
  '',
  'about',
  'certificates',
  'contact',
  'downloads',
  'donate',
  'faq',
  'feedback',
  'help',
  'information',
  'policies',
  'projects',
  'portfolio',
  'curriculum',
  'socials',
  'musicboard',
  'commissions',
  'support',
  'team',
  'changelog',
  'reviews',
  'stats',
  'forum',
  'documentation',
  // Una URL por proyecto (página interna de detalle de /projects).
  ...PROJECTS.map((project) => `projects/${project.slug}`),
  // Una URL por entrada del registro de cambios (página interna de detalle).
  ...CHANGELOG_DATA.map((item) => `changelog/${item.id}`),
  // Una URL por red social real (subpáginas de /socials).
  ...SOCIAL_IDS.map((id) => `socials/${id}`),
];

export default function sitemap() {
  return ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}