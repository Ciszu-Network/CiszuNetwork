import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'bingbot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'GPTBot', allow: ['/about', '/documentation', '/faq', '/services', '/courses'] },
    ],
    sitemap: 'https://ciszunetwork.vercel.app/sitemap.xml',
    host: 'https://ciszunetwork.vercel.app',
  };
}