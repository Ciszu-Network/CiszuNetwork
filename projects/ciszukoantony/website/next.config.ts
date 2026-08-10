import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      {
        protocol: 'https',
        hostname: 'obwzzmbvkrcscqwptlqo.supabase.co',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'ciszu-network',
  project: 'ciszukoantony',
  silent: true,
  sourcemaps: { disable: true },
});
