export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'bingbot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'GPTBot', allow: ['/about', '/library', '/play', '/documentation', '/faq'] },
    ],
    sitemap: 'https://muzicmania.vercel.app/sitemap.xml',
    host: 'https://muzicmania.vercel.app',
  };
}