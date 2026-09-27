/**
 * Datos REALES del ecosistema para la home de Ciszu Network.
 *
 * Regla de este módulo: aquí solo entra información verificable del repo —
 * proyectos con su URL real, tecnologías declaradas en los `package.json`,
 * versiones reales y cifras contadas de fuentes del propio monorepo.
 * Nada de cifras inventadas ni de "métricas de ejemplo".
 */
import { assetResolver } from '@ciszunetwork/cdn';
import type { LucideIcon } from 'lucide-react';
import {
  Atom,
  Bot,
  Boxes,
  Building,
  Cloud,
  Code,
  Database,
  Gamepad2,
  GitBranch,
  Hexagon,
  LayoutGrid,
  MonitorSmartphone,
  Music,
  Package,
  Palette,
  Server,
  Shield,
  Smartphone,
  Terminal,
  TestTube2,
  Triangle,
  User,
  Wind,
  Zap,
} from 'lucide-react';
import { CHANGELOG_DATA } from '@/data/changelog';
import { DOCS_METADATA } from '@/config/docs';
import { CISZU_NETWORK, PROJECT_SECTIONS } from '@/config/site';

export type EcosystemAccent = 'brand' | 'discord' | 'purple' | 'pink' | 'cyan' | 'green';

/** Paleta de acento por proyecto: todas con variante legible en claro y oscuro. */
export const ACCENT_STYLES: Record<
  EcosystemAccent,
  { text: string; tile: string; border: string; glow: string }
> = {
  brand: {
    text: 'text-brand-light',
    tile: 'from-brand via-brand-light to-brand-accent',
    border: 'hover:border-brand-light/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(58,107,240,0.25)]',
  },
  discord: {
    text: 'text-[#5865F2]',
    tile: 'from-[#5865F2] to-[#4752C4]',
    border: 'hover:border-[#5865F2]/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(88,101,242,0.25)]',
  },
  purple: {
    text: 'text-[#a855f7]',
    tile: 'from-[#a855f7] to-[#3b82f6]',
    border: 'hover:border-[#a855f7]/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]',
  },
  pink: {
    text: 'text-neon-pink',
    tile: 'from-neon-pink to-brand-accent',
    border: 'hover:border-neon-pink/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(255,51,204,0.25)]',
  },
  cyan: {
    text: 'text-neon-cyan',
    tile: 'from-neon-cyan to-brand-light',
    border: 'hover:border-neon-cyan/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(104,207,255,0.25)]',
  },
  green: {
    text: 'text-neon-green',
    tile: 'from-neon-green to-neon-cyan',
    border: 'hover:border-neon-green/50',
    glow: 'group-hover:shadow-[0_0_35px_rgba(0,255,136,0.25)]',
  },
};

export interface EcosystemProject {
  id: string;
  name: string;
  href: string;
  external: boolean;
  /** URL real del isotipo/imago del CDN. */
  logo: string;
  /** Si el asset es un logotipo ancho (no un isotipo cuadrado). */
  wide?: boolean;
  icon: LucideIcon;
  accent: EcosystemAccent;
  /** Claves del diccionario (`homePage.*`) para tagline y descripción. */
  taglineKey: 'tagCiszugamens' | 'tagCiszubot' | 'tagMuzicmania' | 'tagCiszunetwork' | 'tagAntony';
  descKey: 'descCiszugamens' | 'descCiszubot' | 'descMuzicmania' | 'descCiszunetwork' | 'descAntony';
  /** Stack real de cada proyecto (tomado de sus package.json / stack declarado). */
  tech: string[];
}

/**
 * Los 5 proyectos del ecosistema que la web presenta en `/projects`.
 * Las rutas de logo ya se usan en producción (web de Ciszuko Antony y esta
 * misma web), así que existen en el CDN.
 */
export const ECOSYSTEM_PROJECTS: EcosystemProject[] = [
  {
    id: 'ciszunetwork',
    name: 'Ciszu Network',
    href: '/projects/ciszunetwork',
    external: false,
    logo: assetResolver.resolve(
      'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zcolor_ccolor.svg',
    ),
    icon: Building,
    accent: 'brand',
    taglineKey: 'tagCiszunetwork',
    descKey: 'descCiszunetwork',
    tech: ['Next.js 15', 'React 19', 'Tailwind 4', 'Supabase', 'Vercel'],
  },
  {
    id: 'ciszubot',
    name: 'CiszuBot',
    href: '/projects/ciszubot',
    external: false,
    logo: assetResolver.resolve(
      'projects/ciszubot/content/logos/images/not-outline/isotype/color/ciszubot_logo_isotipo_color.png',
    ),
    icon: Bot,
    accent: 'discord',
    taglineKey: 'tagCiszubot',
    descKey: 'descCiszubot',
    tech: ['Discord.js 14', 'TypeScript', 'Node.js', 'Docker', 'Supabase'],
  },
  {
    id: 'muzicmania',
    name: 'MuzicMania',
    href: 'https://muzicmania.vercel.app/',
    external: true,
    logo: assetResolver.resolve(
      'projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg',
    ),
    icon: Music,
    accent: 'cyan',
    taglineKey: 'tagMuzicmania',
    descKey: 'descMuzicmania',
    tech: ['Next.js 15', 'Web Audio', 'Tauri 2', 'Supabase', 'Zustand 5'],
  },
  {
    id: 'ciszugamens',
    name: 'Ciszugamens',
    href: '/projects/ciszugamens',
    external: false,
    logo: assetResolver.resolve(
      'projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg',
    ),
    icon: Gamepad2,
    accent: 'purple',
    taglineKey: 'tagCiszugamens',
    descKey: 'descCiszugamens',
    tech: ['Discord', 'WhatsApp', 'Telegram', 'Top.gg', 'Disboard'],
  },
  {
    id: 'ciszukoantony',
    name: 'Ciszuko Antony',
    href: 'https://ciszukoantony.vercel.app/',
    external: true,
    logo: assetResolver.resolve(
      'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    ),
    icon: User,
    accent: 'pink',
    taglineKey: 'tagAntony',
    descKey: 'descAntony',
    tech: ['YouTube', 'Streaming', 'Portfolio Next.js', 'Puck'],
  },
];

export interface StackItem {
  name: string;
  version: string;
  icon: LucideIcon;
  href: string;
  accent: EcosystemAccent;
}

/**
 * Stack tecnológico real, con las versiones mayores declaradas en los
 * package.json del monorepo (raíz, webs, bot y paquetes).
 */
export const TECH_STACK: StackItem[] = [
  { name: 'Next.js', version: '15.5', icon: Triangle, href: 'https://nextjs.org', accent: 'brand' },
  { name: 'React', version: '19.2', icon: Atom, href: 'https://react.dev', accent: 'cyan' },
  { name: 'TypeScript', version: '6.0', icon: Code, href: 'https://www.typescriptlang.org', accent: 'brand' },
  { name: 'Tailwind CSS', version: '4.3', icon: Wind, href: 'https://tailwindcss.com', accent: 'cyan' },
  { name: 'Node.js', version: '24+', icon: Hexagon, href: 'https://nodejs.org', accent: 'green' },
  { name: 'pnpm', version: '10.8', icon: Package, href: 'https://pnpm.io', accent: 'purple' },
  { name: 'Turborepo', version: '2.10', icon: LayoutGrid, href: 'https://turbo.build', accent: 'pink' },
  { name: 'Supabase', version: '2', icon: Database, href: 'https://supabase.com', accent: 'green' },
  { name: 'Drizzle ORM', version: '0.45', icon: GitBranch, href: 'https://orm.drizzle.team', accent: 'cyan' },
  { name: 'Discord.js', version: '14.27', icon: Bot, href: 'https://discord.js.org', accent: 'discord' },
  { name: 'Tauri', version: '2.11', icon: Smartphone, href: 'https://tauri.app', accent: 'pink' },
  { name: 'Zustand', version: '5.0', icon: Boxes, href: 'https://zustand.docs.pmnd.rs', accent: 'purple' },
  { name: 'Vitest', version: '5.0', icon: TestTube2, href: 'https://vitest.dev', accent: 'green' },
  { name: 'Storybook', version: '10.6', icon: Palette, href: 'https://storybook.js.org', accent: 'pink' },
  { name: 'Sentry', version: '10.73', icon: Shield, href: 'https://sentry.io', accent: 'discord' },
  { name: 'Vercel', version: '', icon: Cloud, href: 'https://vercel.com', accent: 'brand' },
];

export interface ServiceItem {
  icon: LucideIcon;
  titleKey:
    | 'serviceWebTitle'
    | 'serviceInfraTitle'
    | 'serviceUxTitle'
    | 'serviceBotTitle'
    | 'serviceDataTitle'
    | 'serviceDesignTitle'
    | 'serviceGameTitle';
  descKey:
    | 'serviceWebDesc'
    | 'serviceInfraDesc'
    | 'serviceUxDesc'
    | 'serviceBotDesc'
    | 'serviceDataDesc'
    | 'serviceDesignDesc'
    | 'serviceGameDesc';
  accent: EcosystemAccent;
  /** Tecnologías reales del servicio (chips). */
  tech: string[];
}

/** Servicios reales que el ecosistema ya opera en producción. */
export const SERVICES: ServiceItem[] = [
  {
    icon: Code,
    titleKey: 'serviceWebTitle',
    descKey: 'serviceWebDesc',
    accent: 'brand',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
  },
  {
    icon: Server,
    titleKey: 'serviceInfraTitle',
    descKey: 'serviceInfraDesc',
    accent: 'cyan',
    tech: ['Vercel', 'Supabase', 'Cloudflare', 'GitHub Actions'],
  },
  {
    icon: Palette,
    titleKey: 'serviceUxTitle',
    descKey: 'serviceUxDesc',
    accent: 'pink',
    tech: ['@ciszu/ui', 'Storybook', 'i18n 4 idiomas'],
  },
  {
    icon: Bot,
    titleKey: 'serviceBotTitle',
    descKey: 'serviceBotDesc',
    accent: 'discord',
    tech: ['Discord.js', 'Docker', 'Top.gg'],
  },
  {
    icon: Database,
    titleKey: 'serviceDataTitle',
    descKey: 'serviceDataDesc',
    accent: 'green',
    tech: ['Postgres', 'RLS', 'Drizzle', 'Storage CDN'],
  },
  {
    icon: MonitorSmartphone,
    titleKey: 'serviceGameTitle',
    descKey: 'serviceGameDesc',
    accent: 'purple',
    tech: ['Web Audio', 'Tauri', 'NSIS', 'Supabase'],
  },
];

export interface FeaturedProject {
  id: string;
  name: string;
  href: string;
  external: boolean;
  /** Imagen real del proyecto (portada/banner subido al CDN). */
  image: string;
  imageAlt: string;
  /** Clave del diccionario para la descripción. */
  descKey: EcosystemProject['descKey'];
  accent: EcosystemAccent;
  icon: LucideIcon;
  hrefLabel: string;
}

/** Vitrina con imágenes reales del CDN (portadas y banners ya publicados). */
export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'muzicmania',
    name: 'MuzicMania',
    href: 'https://muzicmania.vercel.app/',
    external: true,
    image: assetResolver.resolve('projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cover.png'),
    imageAlt: 'Portada del álbum Genesis Neon de MuzicMania',
    descKey: 'descMuzicmania',
    accent: 'cyan',
    icon: Music,
    hrefLabel: 'muzicmania.vercel.app',
  },
  {
    id: 'ciszugamens',
    name: 'Ciszugamens',
    href: '/projects/ciszugamens',
    external: false,
    image: assetResolver.resolve('projects/ciszugamens/content/banners/images/banner.png'),
    imageAlt: 'Banner de la comunidad Ciszugamens',
    descKey: 'descCiszugamens',
    accent: 'purple',
    icon: Gamepad2,
    hrefLabel: '/projects/ciszugamens',
  },
  {
    id: 'ciszubot',
    name: 'CiszuBot',
    href: '/projects/ciszubot',
    external: false,
    image: assetResolver.resolve('projects/ciszubot/content/thumbnails/images/thumbnail.png'),
    imageAlt: 'Thumbnail oficial de CiszuBot',
    descKey: 'descCiszubot',
    accent: 'discord',
    icon: Bot,
    hrefLabel: '/projects/ciszubot',
  },
];

/**
 * Cifras REALES de la home. Cada una sale de una fuente del repo:
 *  - proyectos: `PROJECT_SECTIONS` (src/config/site.ts)
 *  - paquetes:  carpetas de `packages/` (cdn, db, email, payments, ui, utils)
 *  - versiones: entradas de `CHANGELOG_DATA`
 *  - docs:      documentos publicados en `DOCS_METADATA`
 *  - redes:     plataformas de `CISZU_NETWORK.social`
 */
export const HOME_STATS = [
  { id: 'projects', value: PROJECT_SECTIONS.length, labelKey: 'statProjects' as const, icon: LayoutGrid },
  { id: 'packages', value: 6, labelKey: 'statPackages' as const, icon: Package },
  { id: 'releases', value: CHANGELOG_DATA.length, labelKey: 'statReleases' as const, icon: Zap },
  { id: 'docs', value: Object.keys(DOCS_METADATA).length, labelKey: 'statDocs' as const, icon: Terminal },
];
