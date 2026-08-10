import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Guardrails (ver ERRORES_SISTEMA.md): tracing y replays desactivados a propósito
  // (no pisar Vercel Speed Insights ni los replays de PostHog).
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
