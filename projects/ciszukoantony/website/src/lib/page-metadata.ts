import type { Metadata } from 'next';
import { SOCIAL_ENTRIES } from '@/data/socials';

/**
 * Metadata SSR por ruta (Ciszuko Antony portfolio).
 *
 * Las páginas son client components ('use client') y no pueden exportar
 * `export const metadata` (requisito de Next App Router para server
 * components). Este helper lo centraliza: el layout raíz lo invoca con el
 * pathname (inyectado por el middleware en el header x-pathname) y devuelve
 * title/description únicos por ruta para SEO (Screaming Frog, GSC, etc.).
 *
 * El título visible en el navegador lo sigue fijando `usePageTitle()` en cada
 * página; aquí solo se cubre la capa SSR/SEO.
 */

export const SITE_NAME = 'Ciszuko Antony';

const META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} | HOME`,
    description: 'Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.',
  },
  '/about': {
    title: `About | ${SITE_NAME}`,
    description: 'Learn about Ciszuko Antony: biography, mission and the story behind Ciszuko Network.',
  },
  '/projects': {
    title: `Projects | ${SITE_NAME}`,
    description:
      'Personal projects of Ciszuko Antony and the projects of Ciszu Network: web, bots, rhythm game, community and content.',
  },
  '/portfolio': {
    title: `Portfolio & CV | ${SITE_NAME}`,
    description: 'Portfolio and interactive CV of Ciszuko Antony: projects, experience, education, skills, languages and certifications.',
  },
  '/socials': {
    title: `Socials | ${SITE_NAME}`,
    description: 'Official social networks of Ciszuko Antony: YouTube, Twitch, GitHub, Discord, X, Instagram, TikTok, Facebook, Spotify, LinkedIn, Pinterest and WhatsApp.',
  },
  '/musicboard': {
    title: `Musicboard | ${SITE_NAME}`,
    description:
      'Music by Ciszuko Antony with an integrated player and sidebar: the studio album FL Studio Track Practice 2024 (own work), the Genesis Neon soundtrack for MuzicMania, and the official podcast and playlists, with real links to SoundCloud, YouTube Music, Spotify and the game library.',
  },
  '/commissions': {
    title: `Commissions | ${SITE_NAME}`,
    description: 'Commission Ciszuko Antony: web development, bots, games, visual identity and automation.',
  },
  '/projects/ciszubot': {
    title: `CiszuBot | ${SITE_NAME}`,
    description: 'CiszuBot: the official Discord bot of the Ciszu Network ecosystem.',
  },
  '/projects/muzicmania': {
    title: `MuzicMania | ${SITE_NAME}`,
    description: 'MuzicMania: the rhythm game developed by Ciszu Network.',
  },
  '/projects/ciszugamens': {
    title: `Ciszugamens | ${SITE_NAME}`,
    description: 'Ciszugamens: the community of Ciszu Network on Discord, WhatsApp and Telegram.',
  },
  '/projects/ciszunetwork': {
    title: `Ciszu Network | ${SITE_NAME}`,
    description: 'Ciszu Network: digital innovation company founded by Ciszuko Antony.',
  },
  '/projects/ciszukoantony': {
    title: `Ciszuko Antony | ${SITE_NAME}`,
    description: 'Ciszuko Antony: youtuber, streamer and developer.',
  },
  '/contact': {
    title: `Contact | ${SITE_NAME}`,
    description: 'Contact Ciszuko Antony: collaborations, business and inquiries.',
  },
  '/faq': {
    title: `FAQ | ${SITE_NAME}`,
    description: 'Frequently asked questions about Ciszuko Antony and Ciszuko Network.',
  },
  '/team': {
    title: `Team | ${SITE_NAME}`,
    description: 'The team behind Ciszuko Network and Ciszuko Antony.',
  },
  '/support': {
    title: `Support | ${SITE_NAME}`,
    description: 'Support and help for Ciszuko Network products and services.',
  },
  '/feedback': {
    title: `Feedback | ${SITE_NAME}`,
    description: 'Send your feedback about Ciszuko Antony and the Ciszuko Network ecosystem.',
  },
  '/certificates': {
    title: `Certificates | ${SITE_NAME}`,
    description: 'Certificates and recognitions of Ciszuko Antony.',
  },
  '/policies': {
    title: `Policies | ${SITE_NAME}`,
    description: 'Policies and guidelines of Ciszuko Network.',
  },
  '/downloads': {
    title: `Downloads | ${SITE_NAME}`,
    description: 'Download and install Ciszuko Antony as a desktop app (PDWA): what it is and installation steps.',
  },
  '/login': {
    title: `Login | ${SITE_NAME}`,
    description: 'Sign in to your Ciszuko ID account.',
  },
  '/register': {
    title: `Register | ${SITE_NAME}`,
    description: 'Create your Ciszuko ID account.',
  },
};

// Metadata SSR por red real (misma fuente que /socials: src/data/socials.ts).
for (const social of SOCIAL_ENTRIES) {
  META[`/socials/${social.id}`] = {
    title: `${social.name} | ${SITE_NAME}`,
    description: `${social.name} (${social.handle}) — ${social.tagline}. ${social.about}`,
  };
}

const FALLBACK: { title: string; description: string } = {
  title: SITE_NAME,
  description: 'Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.',
};

/** Busca metadata por ruta exacta o prefix (/changelog/xxx → /changelog). */
export function metadataForPath(pathname: string): Metadata {
  if (META[pathname]) return META[pathname];
  const parts = pathname.split('/');
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join('/') || '/';
    if (META[prefix]) return META[prefix];
  }
  return FALLBACK;
}