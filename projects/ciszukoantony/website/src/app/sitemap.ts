import { CHANGELOG_DATA } from '@/data/changelog';
import { PROJECTS } from '@/data/projects';

export const dynamic = 'force-static';

const BASE = 'https://ciszukoantony.vercel.app';

const ROUTES = [
  '',
  'about',
  'certificates',
  'contact',
  'descargas',
  'donate',
  'faq',
  'feedback',
  'help',
  'information',
  'policies',
  'projects',
  'portfolio',
  'curriculum',
  'commissions',
  'support',
  'team',
  'changelog',
  // Una URL por proyecto (página interna de detalle de /projects).
  ...PROJECTS.map((project) => `projects/${project.slug}`),
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