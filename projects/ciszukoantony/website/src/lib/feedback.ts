'use client';

import * as Sentry from '@sentry/nextjs';

/**
 * Conecta un elemento del DOM para que al pulsarlo se abra el diálogo de
 * Feedback de Sentry.
 *
 * v10 (@sentry/nextjs 10.69) ya no expone `openForm()` en la integración: la
 * API correcta es `attachTo(el)` (añade un click-listener que renderiza y abre
 * el formulario). Se usa con `autoInject: false` en `instrumentation-client.ts`
 * para no mostrar el trigger automático.
 *
 * Guard: si Sentry no está configurado (sin DSN) o el feedback no está
 * registrado, llama a `onUnavailable` para que el caller haga fallback
 * (p.ej. redirigir a /feedback).
 *
 * @returns función unsubscribe (noop si no hay Sentry).
 */
export function attachFeedback(el: Element | null, onUnavailable?: () => void): () => void {
  if (!el) {
    onUnavailable?.();
    return () => {};
  }
  try {
    const feedback = Sentry.getFeedback();
    if (feedback && typeof feedback.attachTo === 'function') {
      return feedback.attachTo(el);
    }
  } catch {
    /* Sentry no disponible: cae al fallback */
  }
  onUnavailable?.();
  return () => {};
}
