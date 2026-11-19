'use client';

import { useEffect, useState } from 'react';

const ENDPOINT = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT) || 'https://muzicmania.vercel.app/api/telemetry/ingest';
const DEVICE_KEY = 'ciszu-telemetry-device';
const SESSION_KEY = 'ciszu-telemetry-session';
const ENABLED_KEY = 'ciszu-telemetry-enabled';

function id(): string {
  try {
    const webCrypto: Crypto | undefined = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (webCrypto?.randomUUID) return webCrypto.randomUUID();
    if (webCrypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      webCrypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* fallback */ }
  return `fallback-${Date.now().toString(36)}`;
}

function get(key: string, storage: Storage): string | null {
  try { return storage.getItem(key); } catch { return null; }
}
function set(key: string, value: string | null, storage: Storage): void {
  try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { /* blocked */ }
}

export function isWebTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return get(ENABLED_KEY, window.localStorage) !== 'off';
}

export function setWebTelemetryEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  set(ENABLED_KEY, enabled ? null : 'off', window.localStorage);
  window.dispatchEvent(new CustomEvent('ciszu-telemetry-preference', { detail: { enabled } }));
}

function userId(): string | null {
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i) || '';
      if (!/^sb-.*-auth-token$/.test(key)) continue;
      const value = JSON.parse(window.localStorage.getItem(key) || '{}');
      const candidate = value?.user?.id || value?.currentSession?.user?.id;
      if (typeof candidate === 'string' && /^[0-9a-f-]{36}$/i.test(candidate)) return candidate;
    }
  } catch { /* no session */ }
  return null;
}

function payload(app: string, eventType: string, properties: Record<string, unknown> = {}) {
  let device = get(DEVICE_KEY, window.localStorage);
  if (!device) { device = id(); set(DEVICE_KEY, device, window.localStorage); }
  let session = get(SESSION_KEY, window.sessionStorage);
  if (!session) { session = id(); set(SESSION_KEY, session, window.sessionStorage); }
  return {
    event_id: id(), occurred_at: new Date().toISOString(), source: 'web', app, event_type: eventType,
    user_id: userId(), device_id: device, session_id: session,
    os: navigator.platform || '', arch: /arm|aarch/i.test(navigator.userAgent) ? 'arm64' : 'x64',
    device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    language: navigator.language || '', is_official: true, consent: true,
    properties: { path: `${location.pathname}${location.search}`, referrer: document.referrer, ...properties },
  };
}

async function send(events: unknown[]): Promise<boolean> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }), keepalive: true,
    });
    return response.ok;
  } catch { return false; }
}

export async function trackWebEvent(app: string, eventType: string, properties: Record<string, unknown> = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !isWebTelemetryEnabled() || navigator.onLine === false) return false;
  return send([payload(app, eventType, properties)]);
}

export function TelemetryTracker({ app }: { app: string }) {
  useEffect(() => {
    if (!isWebTelemetryEnabled()) return () => undefined;
    let stopped = false;
    const tick = (type: string, extra: Record<string, unknown> = {}) => {
      if (!stopped && isWebTelemetryEnabled()) void trackWebEvent(app, type, { activity: document.visibilityState, ...extra });
    };
    const heartbeat = () => { if (document.visibilityState === 'visible') tick('heartbeat'); };
    const online = () => tick('connectivity', { online: true });
    const offline = () => tick('connectivity', { online: false });
    const preference = () => { if (!isWebTelemetryEnabled()) stopped = true; };
    const api = { track: (type: string, properties: Record<string, unknown> = {}) => trackWebEvent(app, type, properties), app };
    (window as unknown as { ciszuTelemetry?: typeof api }).ciszuTelemetry = api;
    tick('session_start'); tick('page_view');
    const timer = setInterval(heartbeat, 60_000);
    document.addEventListener('visibilitychange', heartbeat);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    window.addEventListener('ciszu-telemetry-preference', preference);
    return () => {
      stopped = true; clearInterval(timer);
      document.removeEventListener('visibilitychange', heartbeat);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      window.removeEventListener('ciszu-telemetry-preference', preference);
      void trackWebEvent(app, 'session_end');
    };
  }, [app]);
  return null;
}

export function TelemetryPreference() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => { setEnabled(isWebTelemetryEnabled()); }, []);
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-header text-sm font-black uppercase tracking-widest text-ink">Privacidad y telemetría</h3>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        La telemetría web nos ayuda a detectar fallos, medir uso y mejorar el servicio. Puedes desactivarla en este dispositivo.
      </p>
      <label className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-ink">
        <span>Enviar telemetría web</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => { setEnabled(event.target.checked); setWebTelemetryEnabled(event.target.checked); }}
          className="h-4 w-4 accent-neon-cyan"
        />
      </label>
    </section>
  );
}



