/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ciszunetwork.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://ciszunetwork.vercel.app/sitemap.xml',
    ],
  },
}
