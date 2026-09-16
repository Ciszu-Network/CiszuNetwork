'use client';

/**
 * usePublishedChangelogs — changelogs GLOBALES publicados desde el devcon.
 *
 * Réplica del patrón de GLOBAL_ADVISOR / GLOBAL_DISCLAIMER (`useGlobalAdvisor`,
 * `GlobalDisclaimer`): hace polling a `ciszunetwork.global_changelogs` cada ~20s
 * (3s en desarrollo), respeta el kill switch (`global_changelog_settings`) y
 * confirma la entrega por sitio (`global_changelog_deliveries`) para que el
 * devcon pueda esperar con `--wait`.
 *
 * En desarrollo también lee las entradas de debug locales vía
 * `/api/changelogs/debug` (el devcon las escribe en un JSON fuera de git), así
 * se previsualizan antes de publicarlas a la nube.
 *
 * Uso:
 *   const { entries, enabled, ready } = usePublishedChangelogs('ciszubot');
 *   const items = mergeChangelogSources(entries, CHANGELOG);
 */

import { useEffect, useRef, useState } from 'react';

/** Webs soportadas por el almacén de changelogs. */
export type ChangelogSite = 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';

/** Fila del almacén (snake_case, tal como llega de PostgREST). */
export interface PublishedChangelogRow {
  id: number;
  slug: string;
  version: string;
  code: string | null;
  title: string;
  description: string | null;
  body: { text?: string; type?: string }[] | null;
  highlights: string[] | null;
  types: string[] | null;
  icon: string | null;
  status: string | null;
  phase: string | null;
  release_date: string | null;
  expires_at: string | null;
  target: string;
  author: string | null;
  published: boolean;
  created_at: string;
  updated_at: string | null;
  /** Origen de la fila: nube (`global`) o JSON de debug local. */
  origin: 'global' | 'debug';
}

export interface UsePublishedChangelogsResult {
  /** Entradas publicadas dirigidas a esta web (globales + debug en dev). */
  entries: PublishedChangelogRow[];
  /** `false` cuando el kill switch global está apagado. */
  enabled: boolean;
  /** `true` tras el primer intento de lectura (éxito o error). */
  ready: boolean;
  /** Último error de red/API (no rompe el render). */
  error: string | null;
}

const CHANGELOG_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const CHANGELOG_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function changelogFetch(path: string, query = '', init?: RequestInit) {
  // Las tablas global_* viven en el schema `ciszunetwork`; PostgREST necesita
  // Accept-Profile para leer ese schema (sin él busca en `public`).
  const baseHeaders: Record<string, string> = {
    apikey: CHANGELOG_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${CHANGELOG_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Accept-Profile': 'ciszunetwork',
  };
  const headers = { ...baseHeaders, ...(init?.headers as Record<string, string> | undefined) };
  return fetch(`${CHANGELOG_SUPABASE_URL}/rest/v1/${path}?${query}`, { headers, ...init });
}

/** ¿La entrada está dirigida a esta web (o a `global`)? */
function targetsSite(row: PublishedChangelogRow, site: ChangelogSite): boolean {
  if (row.target === 'global') return true;
  const list = String(row.target || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const aliases = site === 'ciszu' ? ['ciszu', 'ciszunetwork'] : [site];
  return aliases.some((alias) => list.includes(alias));
}

/** ¿Sigue vigente la entrada (no expirada)? */
function isLive(row: PublishedChangelogRow): boolean {
  if (row.published === false) return false;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return false;
  return true;
}

/** Lee las entradas de debug locales (solo desarrollo). */
async function fetchDebugEntries(
  site: ChangelogSite,
): Promise<{ entries: PublishedChangelogRow[]; pending: string[] }> {
  try {
    const res = await fetch(`/api/changelogs/debug?site=${encodeURIComponent(site)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { entries: [], pending: [] };
    const data = (await res.json()) as { entries?: PublishedChangelogRow[] };
    const entries = Array.isArray(data.entries) ? data.entries : [];
    // Marca la entrega local (equivalente al upsert de la tabla global): así el
    // devcon muestra ⏳ pendiente hasta que la web lee la entrada.
    await Promise.all(
      entries.map((entry) =>
        fetch('/api/changelogs/debug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: entry.slug, site }),
        }).catch(() => null),
      ),
    );
    return { entries, pending: [] };
  } catch {
    return { entries: [], pending: [] };
  }
}

export function usePublishedChangelogs(
  site: ChangelogSite,
  options: { pollInterval?: number; disabled?: boolean } = {},
): UsePublishedChangelogsResult {
  const { pollInterval, disabled = false } = options;
  // En desarrollo: polling rápido (3s). En producción: 20s.
  const effectiveInterval =
    pollInterval ?? (process.env.NODE_ENV === 'development' ? 3000 : 20000);
  const isDev = process.env.NODE_ENV !== 'production';

  const [globalRows, setGlobalRows] = useState<PublishedChangelogRow[]>([]);
  const [debugRows, setDebugRows] = useState<PublishedChangelogRow[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (disabled) {
      setReady(true);
      return () => {
        mountedRef.current = false;
      };
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const settingsRes = await changelogFetch(
          'global_changelogs_settings',
          'id=eq.1&select=enabled',
        );
        const settings = settingsRes.ok ? await settingsRes.json() : [];
        const isEnabled =
          Array.isArray(settings) && settings.length ? settings[0].enabled !== false : true;
        if (!cancelled) setEnabled(isEnabled);

        if (!isEnabled) {
          if (!cancelled) {
            setGlobalRows([]);
            setError(null);
          }
          return;
        }

        const res = await changelogFetch(
          'global_changelogs',
          'select=*&published=eq.true&order=release_date.desc&limit=200',
        );
        if (!res.ok) {
          if (!cancelled) setError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as PublishedChangelogRow[];
        const relevant = (Array.isArray(data) ? data : [])
          .filter(isLive)
          .filter((row) => targetsSite(row, site))
          .map((row) => ({ ...row, origin: 'global' as const }));

        // Confirma la entrega real por web (upsert idempotente) para que el
        // devcon pueda esperar con --wait de forma fiable. La tabla usa
        // `entry_id` (PK compuesta entry_id+site) — igual que scripts/changelogs.js.
        for (const row of relevant) {
          changelogFetch('global_changelog_deliveries', '', {
            method: 'POST',
            body: JSON.stringify({ entry_id: row.id, site }),
            headers: {
              'Content-Type': 'application/json',
              'Content-Profile': 'ciszunetwork',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
          }).catch(() => {});
        }

        if (!cancelled) {
          setGlobalRows(relevant);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'network');
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    poll();
    const iv = window.setInterval(poll, effectiveInterval);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [site, effectiveInterval, disabled]);

  // Previsualización local (solo en desarrollo) de las entradas de debug.
  useEffect(() => {
    if (!isDev || disabled) return;
    let cancelled = false;
    const load = async () => {
      const { entries } = await fetchDebugEntries(site);
      const rows = entries
        .filter(isLive)
        .filter((row) => targetsSite(row, site))
        .map((row) => ({ ...row, origin: 'debug' as const }));
      if (!cancelled) setDebugRows(rows);
    };
    load();
    const iv = window.setInterval(load, Math.max(3000, effectiveInterval));
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [site, effectiveInterval, disabled, isDev]);

  return {
    // El debug va primero: `mergeChangelogSources` deja ganar a la global.
    entries: enabled ? [...debugRows, ...globalRows] : [],
    enabled,
    ready,
    error,
  };
}
