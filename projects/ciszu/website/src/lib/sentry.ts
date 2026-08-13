'use client';

import * as Sentry from '@sentry/nextjs';

/**
 * Abre el formulario de feedback de Sentry desde nuestros botones propios
 * (FeedbackFab / página /feedback).
 *
 * Solo actúa si `Sentry.getFeedback` existe y devuelve el widget de feedback
 * (guard). En v10 el widget ya no expone `openForm()`: la API correcta es
 * `createForm()` → `appendToDom()` → `open()`. Se intenta primero
 * `openForm()` (SDKs antiguos) y si no existe se usa la API de v10.
 */
export async function openSentryFeedback(): Promise<boolean> {
  if (typeof Sentry.getFeedback !== 'function') return false;

  const feedback = Sentry.getFeedback();
  if (!feedback) return false;

  // Fallback para SDKs antiguos que sí tenían openForm().
  const withOpenForm = feedback as unknown as { openForm?: () => void };
  if (typeof withOpenForm.openForm === 'function') {
    withOpenForm.openForm();
    return true;
  }

  // API correcta de v10: createForm → appendToDom → open.
  if (typeof (feedback as { createForm?: unknown }).createForm !== 'function') return false;

  try {
    const form = await (feedback as { createForm: () => Promise<{ appendToDom: () => void; open: () => void } | null> }).createForm();
    if (!form) return false;
    form.appendToDom();
    form.open();
    return true;
  } catch {
    return false;
  }
}