/**
 * Error tracking del bot con Sentry (@sentry/node).
 *
 * Se inicializa SOLO si existe SENTRY_DSN en el entorno (vault). Sin DSN el bot
 * funciona igual (no-op). Traces activos a 10% (transacciones de fetch/http del bot).
 * Ver projects/ciszu/docs/documentation/ERRORS_SYSTEM.md.
 */
import * as Sentry from '@sentry/node';
import { logger } from './logger';

export function initErrorTracking(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('Sentry no configurado (falta SENTRY_DSN) — tracking de errores desactivado.');
    return;
  }
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV ?? 'production',
  });
  Sentry.setTag('service', 'ciszubot');
  logger.info('Sentry inicializado (error tracking activo).');
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}