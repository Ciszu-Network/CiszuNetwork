import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Todas las características activas: traces, replays y feedback (widget en la web).
  tracesSampleRate: 1,
  // Replays al 100% temporalmente (pruebas). Bajar a 0.1 en producción tras validar.
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  ignoreErrors: [
    // Extensiones del navegador que se inyectan en cada página y lanzan errores
    // ajenos a la web (MetaMask, wallets, etc.). No son de la app.
    /Failed to connect to MetaMask/i,
    /chrome-extension:\/\//i,
  ],
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      showBranding: false,
      autoInject: false,
      triggerLabel: 'Reportar un problema',
      formTitle: '¿Algo no funciona?',
      messagePlaceholder: 'Cuéntanos qué ocurrió…',
    }),
  ],
});

// Instrumenta las navegaciones del App Router en Sentry (transacciones de cliente).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;