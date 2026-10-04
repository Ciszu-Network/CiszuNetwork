/**
 * Helper SEO compartido para las 4 webs de Ciszu Network.
 *
 * Genera la configuración de metadata con title, description, openGraph,
 * twitter, canonical (alternates), keywords, robots y JSON-LD de forma
 * coherente. Evita la duplicación entre webs y garantiza que Google y los
 * motores (y las IAs que los usan) entiendan cada página.
 *
 * Este paquete no depende de Next (es server-agnostic): devuelve un objeto
 * plano estructuralmente compatible con `Metadata` de Next.js. Las webs lo
 * tipan con `satisfies Metadata` o `as Metadata` al usarlo.
 *
 * Uso (en cada `layout.tsx` o `page.tsx` server component):
 *   import { buildSeoMetadata } from '@ciszunetwork/utils/seo';
 *   import type { Metadata } from 'next';
 *   export const metadata: Metadata = buildSeoMetadata({ ... });
 */

export interface SeoImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface SeoOpenGraph {
  type?: 'website' | 'article' | 'profile';
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  images?: SeoImage[];
  locale?: string;
  authors?: string[];
  publishedTime?: string;
}

export interface SeoTwitter {
  card?: string;
  title?: string;
  description?: string;
  images?: string[];
}

export interface SeoRobots {
  index?: boolean;
  follow?: boolean;
  googleBot?: {
    index?: boolean;
    follow?: boolean;
    'max-image-preview'?: 'none' | 'standard' | 'large';
    'max-snippet'?: number;
  };
}

/** Objeto Metadata plano (compatible con Next.js Metadata). */
export interface SeoMetadata {
  title?: string;
  description?: string;
  metadataBase?: URL;
  alternates?: { canonical?: string };
  keywords?: string[];
  robots?: SeoRobots;
  openGraph?: SeoOpenGraph;
  twitter?: SeoTwitter;
}

export interface SeoInput {
  /** Título visible (sin sufijo). */
  title: string;
  /** Descripción (150-160 chars recomendado). */
  description: string;
  /** URL canónica absoluta de la página. */
  url: string;
  /** Nombre del sitio (para OG site_name y JSON-LD). */
  siteName: string;
  /** Imagen OG (URL absoluta). */
  image?: string;
  /** Palabras clave (opcional). */
  keywords?: string[];
  /** Permitir indexar (default true). */
  noIndex?: boolean;
  /** Tipo OG (default 'website'). */
  type?: 'website' | 'article' | 'profile';
  /** Autor / creador (para profile/article). */
  author?: string;
  /** Fecha de publicación (para article). */
  publishedTime?: string;
}

/** JSON-LD de WebSite + Organization (como string) para inyectar en el layout. */
export function buildJsonLd(siteName: string, url: string, description: string, logoUrl?: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteName,
        url,
        description,
        inLanguage: 'es',
        publisher: { '@type': 'Organization', name: 'Ciszu Network', url: 'https://ciszunetwork.vercel.app' },
      },
      logoUrl
        ? {
            '@type': 'Organization',
            name: siteName,
            url,
            logo: logoUrl,
          }
        : undefined,
    ].filter(Boolean),
  });
}

export function buildSeoMetadata(input: SeoInput): SeoMetadata {
  const {
    title,
    description,
    url,
    siteName,
    image,
    keywords = [],
    noIndex = false,
    type = 'website',
    author,
    publishedTime,
  } = input;

  const canonical = url.split('#')[0].split('?')[0];

  return {
    title,
    description,
    metadataBase: new URL(new URL(url).origin),
    alternates: { canonical },
    keywords: [...new Set(['ciszu network', 'ciszuko antony', siteName, ...keywords])],
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: { index: !noIndex, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
      ...(author ? { authors: [author] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      locale: 'es_ES',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** Alias descriptivo de `buildSeoMetadata` para el JSON-LD string. */
export function seoJsonLdString(siteName: string, url: string, description: string, logoUrl?: string): string {
  return buildJsonLd(siteName, url, description, logoUrl);
}