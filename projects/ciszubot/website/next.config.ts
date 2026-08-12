import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "ciszu-network",
  project: "ciszubot",
  silent: true,
  // Source maps: se suben en build cuando exista SENTRY_AUTH_TOKEN (production).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    filesToDeleteAfterUpload: [".next/static/**/*.map"],
  },
});
