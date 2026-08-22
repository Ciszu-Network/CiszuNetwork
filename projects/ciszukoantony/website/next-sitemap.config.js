/** @type {import("next-sitemap").IConfig} */
module.exports = {
  siteUrl: "https://cizukoantony.vercel.app",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/api/*", "/admin/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://cizukoantony.vercel.app/sitemap.xml"]
  }
}
