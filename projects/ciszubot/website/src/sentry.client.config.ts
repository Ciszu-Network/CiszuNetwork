import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Todas las características activas: traces, replays y feedback (widget en la web).
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      showBranding: false,
      triggerLabel: 'Reportar un problema',
      formTitle: '¿Algo no funciona?',
      messagePlaceholder: 'Cuéntanos qué ocurrió…',
    }),
  ],
});