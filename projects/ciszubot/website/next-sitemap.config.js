/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ciszubot.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://ciszubot.vercel.app/sitemap.xml',
    ],
  },
}
