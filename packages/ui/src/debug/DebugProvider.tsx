'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  EMPTY_DEBUG_FEATURES,
  type DebugAccountLink,
  type DebugFeature,
  type DebugPlaceholder,
  type DebugSite,
  type DebugStatus,
} from './types';

const AUTH_KEY_RE = /(^|-)auth-token$/;
const ELEVATION_KEY = (site: DebugSite) => `ciszu_staff_elevation:${site}`;
const ENABLED_KEY = (site: DebugSite) => `ciszu_debug_enabled:${site}`;
const FEATURES_KEY = (site: DebugSite) => `ciszu_debug_features:${site}`;
const PLACEHOLDERS_KEY = (site: DebugSite) => `ciszu_debug_placeholders:${site}`;

function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index) ?? '';
        if (!key.startsWith('sb-') || !AUTH_KEY_RE.test(key)) continue;
        const parsed = JSON.parse(storage.getItem(key) ?? '{}') as {
          access_token?: string;
          currentSession?: { access_token?: string };
        };
        const token = parsed.access_token ?? parsed.currentSession?.access_token;
        if (token) return token;
      }
    } catch {
      /* almacenamiento bloqueado */
    }
  }
  return null;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento bloqueado */
  }
}

function makePlaceholder(index: number): DebugPlaceholder {
  const suffix = `${Date.now().toString(36)}${index}`.slice(-6).toUpperCase();
  return {
    id: `ph_${suffix}_${Math.random().toString(36).slice(2, 7)}`,
    name: `Placeholder ${suffix}`,
    username: `placeholder_${suffix.toLowerCase()}`,
    tag: 'BOT',
    score: 900_000 + Math.floor(Math.random() * 8_000_000),
    balance: 1_000 + Math.floor(Math.random() * 90_000),
    bank: 5_000 + Math.floor(Math.random() * 400_000),
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    comment: 'Reseña simulada localmente para probar la interfaz.',
    createdAt: new Date().toISOString(),
  };
}

interface DebugContextValue {
  site: DebugSite;
  status: DebugStatus | null;
  loading: boolean;
  authorized: boolean;
  staff: DebugStatus['staff'];
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  features: Record<DebugFeature, boolean>;
  setFeature: (feature: DebugFeature, value: boolean) => void;
  placeholders: DebugPlaceholder[];
  addPlaceholders: (count?: number) => void;
  removePlaceholder: (id: string) => void;
  clearPlaceholders: () => void;
  links: DebugAccountLink[];
  elevationRequired: boolean;
  verifyCode: (code: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  apiFetch: (input: string, init?: RequestInit) => Promise<Response>;
  simulatedNumber: (value: number, salt?: number) => number;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ site, children }: { site: DebugSite; children: React.ReactNode }) {
  const [status, setStatus] = useState<DebugStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [elevation, setElevation] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(ELEVATION_KEY(site));
    } catch {
      return null;
    }
  });
  const [enabled, setEnabledState] = useState(false);
  const [featureOverrides, setFeatureOverrides] = useState<Partial<Record<DebugFeature, boolean>>>({});
  const [placeholders, setPlaceholders] = useState<DebugPlaceholder[]>([]);
  const elevationRef = useRef(elevation);
  elevationRef.current = elevation;

  const refresh = useCallback(async () => {
    const token = readAuthToken();
    if (!token) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/debug/status', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(elevationRef.current ? { 'x-staff-elevation': elevationRef.current } : {}),
        },
      });
      if (!response.ok) {
        setStatus(null);
        return;
      }
      const data = (await response.json()) as DebugStatus;
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onStorage = () => void refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    if (!status?.authorized) {
      setEnabledState(false);
      return;
    }
    try {
      setEnabledState(window.localStorage.getItem(ENABLED_KEY(site)) === '1');
    } catch {
      setEnabledState(false);
    }
    setFeatureOverrides(readJson<Partial<Record<DebugFeature, boolean>>>(FEATURES_KEY(site), {}));
    setPlaceholders(readJson<DebugPlaceholder[]>(PLACEHOLDERS_KEY(site), []));
  }, [site, status?.authorized]);

  const setEnabled = useCallback((value: boolean) => {
    if (!status?.authorized) return;
    setEnabledState(value);
    try {
      window.localStorage.setItem(ENABLED_KEY(site), value ? '1' : '0');
    } catch {
      /* noop */
    }
  }, [site, status?.authorized]);

  const setFeature = useCallback((feature: DebugFeature, value: boolean) => {
    if (!status?.authorized || !status.features[feature]) return;
    setFeatureOverrides((current) => {
      const next = { ...current, [feature]: value };
      writeJson(FEATURES_KEY(site), next);
      return next;
    });
  }, [site, status?.authorized, status?.features]);

  const features = useMemo<Record<DebugFeature, boolean>>(() => {
    if (!status?.authorized || !enabled) return EMPTY_DEBUG_FEATURES;
    return {
      placeholders: Boolean(status.features.placeholders && featureOverrides.placeholders !== false),
      simulatedAnalytics: Boolean(status.features.simulatedAnalytics && featureOverrides.simulatedAnalytics !== false),
      officialEditor: Boolean(status.features.officialEditor && featureOverrides.officialEditor !== false),
      cheats: Boolean(status.features.cheats && featureOverrides.cheats !== false),
    };
  }, [enabled, featureOverrides, status]);

  const persistPlaceholders = useCallback((next: DebugPlaceholder[]) => {
    setPlaceholders(next);
    writeJson(PLACEHOLDERS_KEY(site), next);
  }, [site]);

  const addPlaceholders = useCallback((count = 1) => {
    const safeCount = Math.max(1, Math.min(10, Math.floor(count)));
    const next = [...placeholders, ...Array.from({ length: safeCount }, (_, index) => makePlaceholder(index))];
    persistPlaceholders(next);
  }, [persistPlaceholders, placeholders]);

  const removePlaceholder = useCallback((id: string) => {
    persistPlaceholders(placeholders.filter((placeholder) => placeholder.id !== id));
  }, [persistPlaceholders, placeholders]);

  const clearPlaceholders = useCallback(() => persistPlaceholders([]), [persistPlaceholders]);

  const verifyCode = useCallback(async (code: string) => {
    const token = readAuthToken();
    if (!token) return { ok: false, error: 'Inicia sesión con tu cuenta CISZU.' };
    try {
      const response = await fetch('/api/staff/elevate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { success?: boolean; token?: string; error?: string };
      if (!response.ok || !data.success || !data.token) {
        return { ok: false, error: data.error ?? 'Código inválido o expirado.' };
      }
      setElevation(data.token);
      elevationRef.current = data.token;
      try {
        window.sessionStorage.setItem(ELEVATION_KEY(site), data.token);
      } catch {
        /* noop */
      }
      await refresh();
      return { ok: true };
    } catch {
      return { ok: false, error: 'No se pudo verificar el código.' };
    }
  }, [refresh, site]);

  const apiFetch = useCallback(async (input: string, init: RequestInit = {}) => {
    const token = readAuthToken();
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(elevationRef.current ? { 'x-staff-elevation': elevationRef.current } : {}),
      },
    });
  }, []);

  const simulatedNumber = useCallback((value: number, salt = 0) => {
    if (!features.simulatedAnalytics) return value;
    return Math.max(value, Math.round((value + 1) * 1.618 + placeholders.length * 7 + salt));
  }, [features.simulatedAnalytics, placeholders.length]);

  const value = useMemo<DebugContextValue>(() => ({
    site,
    status,
    loading,
    authorized: Boolean(status?.authorized),
    staff: status?.staff ?? null,
    enabled,
    setEnabled,
    features,
    setFeature,
    placeholders,
    addPlaceholders,
    removePlaceholder,
    clearPlaceholders,
    links: status?.links ?? [],
    elevationRequired: status?.reason === 'elevation_required',
    verifyCode,
    refresh,
    apiFetch,
    simulatedNumber,
  }), [addPlaceholders, apiFetch, clearPlaceholders, enabled, features, loading, placeholders, refresh, removePlaceholder, setEnabled, setFeature, simulatedNumber, site, status, verifyCode]);

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebugMode(): DebugContextValue {
  const context = useContext(DebugContext);
  if (!context) throw new Error('useDebugMode debe usarse dentro de <DebugProvider>');
  return context;
}
