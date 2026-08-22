import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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

export default withSentryConfig(nextConfig, {
  org: "ciszu-network",
  project: "ciszubot",
  silent: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    filesToDeleteAfterUpload: [".next/static/**/*.map"],
  },
});
