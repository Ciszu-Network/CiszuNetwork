import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/dashboard'] },
      { userAgent: 'bingbot', allow: '/', disallow: ['/api/', '/dashboard'] },
      { userAgent: 'GPTBot', allow: ['/commands', '/downloads', '/about', '/faq', '/documentation'] },
    ],
    sitemap: 'https://ciszubot.vercel.app/sitemap.xml',
    host: 'https://ciszubot.vercel.app',
  };
}