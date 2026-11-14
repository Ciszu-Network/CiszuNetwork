import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";
import { withBotId } from "botid/next/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Resolver alias @/ para que funcione en Vercel build
  webpack(config: any) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default withBotId(
  withSentryConfig(nextConfig, {
    org: "ciszu-network",
    project: "ciszubot",
    silent: true,
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
      filesToDeleteAfterUpload: [".next/static/**/*.map"],
    },
  })
);
