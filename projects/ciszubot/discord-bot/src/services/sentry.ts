/**
 * Error tracking del bot con Sentry (@sentry/node).
 *
 * Se inicializa SOLO si existe SENTRY_DSN en el entorno (vault). Sin DSN el bot
 * funciona igual (no-op). Guardrails: traces off (tracing no aporta al bot),
 * solo errores. Ver projects/ciszu/docs/documentation/ERRORES_SISTEMA.md.
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
    tracesSampleRate: 0,
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