import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Todas las características activas: traces, replays y feedback (widget en la web).
  tracesSampleRate: 1,
  // Replays al 100% temporalmente (pruebas). Bajar a 0.1 en producción tras validar.
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      // Sin trigger automático: el botón se abre desde FeedbackFab / Feedback (attachTo).
      autoInject: false,
      showBranding: false,
      triggerLabel: 'Reportar un problema',
      formTitle: '¿Algo no funciona?',
      messagePlaceholder: 'Cuéntanos qué ocurrió…',
    }),
  ],
});

// Instrumenta las navegaciones del App Router en Sentry (transacciones de cliente).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;