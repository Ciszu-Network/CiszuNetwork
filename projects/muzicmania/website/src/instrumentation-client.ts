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
      // Sin autoinjección del trigger flotante de Sentry: lo maneja FeedbackFab
      // (botón propio en esquina inferior-izquierda) vía Sentry.getFeedback().
      autoInject: false,
      triggerLabel: 'Reportar un problema',
      formTitle: '¿Algo no funciona?',
      messagePlaceholder: 'Cuéntanos qué ocurrió…',
    }),
  ],
});

// Rutas POST con fetch same-origin desde nuestras páginas (login/registro, 2FA y
// resolución de @username del login).
initBotId({
  protect: [
    { path: '/api/verify-recaptcha', method: 'POST' },
    { path: '/api/auth/resolve-username', method: 'POST' },
    { path: '/api/auth/2fa/disable', method: 'POST' },
    { path: '/api/auth/2fa/enable', method: 'POST' },
    { path: '/api/auth/2fa/generate', method: 'POST' },
    { path: '/api/auth/2fa/resend', method: 'POST' },
    { path: '/api/auth/2fa/verify', method: 'POST' },
    { path: '/api/auth/register/complete', method: 'POST' },
    { path: '/api/auth/account/delete-request', method: 'POST' },
    { path: '/api/auth/account/recovery', method: 'POST' },
    { path: '/api/auth/account/reclaim', method: 'POST' },
    { path: '/api/auth/account/privacy', method: 'POST' },
    { path: '/api/auth/register/guard', method: 'POST' },
  ],
});

// Instrumenta las navegaciones del App Router en Sentry (transacciones de cliente).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
