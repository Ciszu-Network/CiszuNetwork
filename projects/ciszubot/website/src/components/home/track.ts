'use client';

import { captureEvent, trackEvent } from '@ciszu/ui';

/**
 * Analítica unificada de la home: GA4 (`trackEvent`) + PostHog (`captureEvent`).
 * Ambos helpers respetan el consentimiento de cookies y son no-op en SSR.
 */
export function track(event: string, params?: Record<string, unknown>) {
  trackEvent(event, params);
  captureEvent(event, params);
}
