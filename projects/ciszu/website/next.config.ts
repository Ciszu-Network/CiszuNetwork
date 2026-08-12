import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'obwzzmbvkrcscqwptlqo.supabase.co',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'ciszu-network',
  project: 'ciszunetwork',
  silent: true,
  // Source maps: se suben en build cuando exista SENTRY_AUTH_TOKEN (production).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },
});
