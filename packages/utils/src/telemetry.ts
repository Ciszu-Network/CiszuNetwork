/**
 * Telemetría web compartida (Ciszu Network).
 * No usa cookies de terceros: un ID anónimo de dispositivo en localStorage,
 * una sesión por pestaña y el endpoint central del ecosistema.
 */
export const TELEMETRY_ENDPOINT =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT) ||
  'https://ciszunetwork.vercel.app/api/telemetry/ingest';

const DEVICE_KEY = 'ciszu-telemetry-device';
const SESSION_KEY = 'ciszu-telemetry-session';
const ENABLED_KEY = 'ciszu-telemetry-enabled';
const QUEUE_KEY = 'ciszu-telemetry-queue';

export type TelemetryApp = 'muzicmania' | 'ciszunetwork' | 'ciszukoantony' | 'ciszubot' | 'ciszugamens';
export type TelemetryProperties = Record<string, unknown>;

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function storageGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

function storageSet(storage: Storage | undefined, key: string, value: string | null): void {
  try {
    if (!storage) return;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* almacenamiento bloqueado */
  }
}

export function getTelemetryDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = storageGet(window.localStorage, DEVICE_KEY);
  if (!id) {
    id = randomId();
    storageSet(window.localStorage, DEVICE_KEY, id);
  }
  return id;
}

export function getTelemetrySessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = storageGet(window.sessionStorage, SESSION_KEY);
  if (!id) {
    id = randomId();
    storageSet(window.sessionStorage, SESSION_KEY, id);
  }
  return id;
}

export function isWebTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return storageGet(window.localStorage, ENABLED_KEY) !== 'off';
}

export function setWebTelemetryEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  storageSet(window.localStorage, ENABLED_KEY, enabled ? null : 'off');
  window.dispatchEvent(new CustomEvent('ciszu-telemetry-preference', { detail: { enabled } }));
}

function signedInUserId(): string | null {
  if (typeof window === 'undefined') return null;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index) || '';
    if (!/^sb-.*-auth-token$/.test(key)) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || '{}');
      const id = parsed?.user?.id || parsed?.currentSession?.user?.id;
      if (typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) return id;
    } catch {
      /* token no parseable */
    }
  }
  return null;
}

function basePayload(app: TelemetryApp, eventType: string, properties: TelemetryProperties = {}) {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  return {
    event_id: randomId(),
    occurred_at: new Date().toISOString(),
    source: 'web',
    app,
    event_type: eventType,
    user_id: signedInUserId(),
    device_id: getTelemetryDeviceId(),
    session_id: getTelemetrySessionId(),
    os: nav?.platform || '',
    arch: /arm|aarch/i.test(nav?.userAgent || '') ? 'arm64' : 'x64',
    device_type: /Mobi|Android|iPhone/i.test(nav?.userAgent || '') ? 'mobile' : 'desktop',
    language: nav?.language || '',
    timezone: (() => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; }
    })(),
    is_official: true,
    consent: true,
    properties: {
      path: typeof location !== 'undefined' ? location.pathname + location.search : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ...properties,
    },
  };
}

function enqueue(payload: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(storageGet(window.localStorage, QUEUE_KEY) || '[]');
    if (!Array.isArray(current) || current.length >= 50) return;
    current.push(payload);
    storageSet(window.localStorage, QUEUE_KEY, JSON.stringify(current));
  } catch {
    /* cola no disponible */
  }
}

async function send(events: unknown[]): Promise<boolean> {
  if (typeof window === 'undefined' || !events.length) return false;
  try {
    const body = JSON.stringify({ events });
    if (navigator.onLine === false) {
      events.forEach(enqueue);
      return false;
    }
    if ('sendBeacon' in navigator) {
      const sent = navigator.sendBeacon(TELEMETRY_ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (sent) return true;
    }
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
    return response.ok;
  } catch {
    events.forEach(enqueue);
    return false;
  }
}

export async function flushWebTelemetryQueue(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const events = JSON.parse(storageGet(window.localStorage, QUEUE_KEY) || '[]');
    if (!Array.isArray(events) || !events.length) return;
    storageSet(window.localStorage, QUEUE_KEY, null);
    if (!(await send(events))) events.forEach(enqueue);
  } catch {
    /* ignore */
  }
}

export async function trackWebEvent(
  app: TelemetryApp,
  eventType: string,
  properties: TelemetryProperties = {},
): Promise<boolean> {
  if (typeof window === 'undefined' || !isWebTelemetryEnabled()) return false;
  await flushWebTelemetryQueue();
  return send([basePayload(app, eventType, properties)]);
}

export function startWebTelemetry(app: TelemetryApp): () => void {
  if (typeof window === 'undefined' || !isWebTelemetryEnabled()) return () => undefined;
  let stopped = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const tick = (eventType: string, extra: TelemetryProperties = {}) => {
    if (stopped || !isWebTelemetryEnabled()) return;
    void trackWebEvent(app, eventType, { activity: document.visibilityState, ...extra });
  };
  const handleVisibility = () => tick('heartbeat', { visibility: document.visibilityState });
  const handleOnline = () => { void flushWebTelemetryQueue(); tick('connectivity', { online: true }); };
  const handleOffline = () => tick('connectivity', { online: false });
  tick('session_start');
  tick('page_view');
  timer = setInterval(() => { if (document.visibilityState === 'visible') tick('heartbeat'); }, 60_000);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  void flushWebTelemetryQueue();
  const api = { track: (eventType: string, properties: TelemetryProperties = {}) => trackWebEvent(app, eventType, properties), app };
  (window as unknown as { ciszuTelemetry?: typeof api }).ciszuTelemetry = api;
  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    void trackWebEvent(app, 'session_end');
  };
}
