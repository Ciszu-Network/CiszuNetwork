import * as Sentry from '@sentry/nextjs';
import { initBotId } from 'botid/client/core';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Local/dev no debe reportar como production (los tests locales aparecian
  // con environment=production en Sentry).
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  // Todas las características activas: traces, replays y feedback (widget en la web).
  tracesSampleRate: 1,
  // Replays al 100% temporalmente (pruebas). Bajar a 0.1 en producción tras validar.
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  // Errores de scripts de terceros (AdSense/GTM/GA): su propio RUM lanza
  // fallos internos como "Error: int64" desde pagead/js/rum.js que no son
  // de la app (Sentry los capturaba en /musicboard y similares).
  denyUrls: [
    /pagead\/js/i,
    /googlesyndication\.com/i,
    /googletagmanager\.com/i,
    /google-analytics\.com/i,
  ],
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

// Rutas POST sensibles protegidas con BotID. El flujo de auth (login/register,
// OAuth, reCAPTCHA, 2FA y cuenta) queda FUERA a propósito: el challenge de
// BotID ahí resulta molesto (aparecía al pulsar los botones OAuth) y ese flujo
// ya está protegido por reCAPTCHA + rate limits server-side.
initBotId({
  protect: [
    { path: '/api/moderation/action', method: 'POST' },
    { path: '/api/staff/elevate', method: 'POST' },
    { path: '/api/dashboard/*', method: 'POST' },
  ],
});

// Instrumenta las navegaciones del App Router en Sentry (transacciones de cliente).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;