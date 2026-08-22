/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://muzicmania.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://muzicmania.vercel.app/sitemap.xml',
    ],
  },
}
