import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/changelog.html', destination: '/changelog', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/credits.html', destination: '/credits', permanent: true },
      { source: '/documentation.html', destination: '/documentation', permanent: true },
      { source: '/faq.html', destination: '/faq', permanent: true },
      { source: '/guidelines.html', destination: '/guidelines', permanent: true },
      { source: '/help.html', destination: '/help', permanent: true },
      { source: '/leaderboard.html', destination: '/leaderboard', permanent: true },
      { source: '/license.html', destination: '/license', permanent: true },
      { source: '/play.html', destination: '/play', permanent: true },
      { source: '/policy.html', destination: '/policy', permanent: true },
      { source: '/profile.html', destination: '/profile', permanent: true },
      { source: '/rules.html', destination: '/rules', permanent: true },
      { source: '/stats.html', destination: '/stats', permanent: true },
      { source: '/support.html', destination: '/support', permanent: true },
      { source: '/team.html', destination: '/team', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'obwzzmbvkrcscqwptlqo.supabase.co',
      },
    ],
  },
};

export default nextConfig;
