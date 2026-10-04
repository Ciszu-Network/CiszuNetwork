import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'bingbot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'GPTBot', allow: ['/about', '/portfolio', '/curriculum', '/projects', '/certificates', '/documentation'] },
    ],
    sitemap: 'https://ciszukoantony.vercel.app/sitemap.xml',
    host: 'https://ciszukoantony.vercel.app',
  };
}