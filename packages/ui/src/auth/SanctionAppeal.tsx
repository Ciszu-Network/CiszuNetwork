'use client';

import React, { useCallback, useEffect, useState } from 'react';

/**
 * Apelación de sanciones (Soporte). Sirve para sanciones del anticheat Y manuales
 * (y aparece siempre, aunque no haya sanciones). Consume /api/support/appeal.
 * Ver ANTICHEAT_SYSTEM.md §9 y MODERATION_PROTOCOLS.md §7.
 */

interface AuthLike {
  auth: {
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
  };
}

interface Sanction {
  id: string;
  type: string;
  reason: string;
  source: 'anticheat' | 'manual';
  createdAt: string;
  expiresAt: string | null;
}

export function SanctionAppeal({
  supabase,
  site,
  apiBase = '/api/support',
}: {
  supabase: AuthLike;
  site: string;
  apiBase?: string;
}) {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [selected, setSelected] = useState<string>('other');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
  }, [supabase]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/appeal?site=${encodeURIComponent(site)}`, {
          headers: { Authorization: `Bearer ${await token()}` },
          cache: 'no-store',
        });
        const json = (await res.json()) as { sanctions?: Sanction[] };
        setSanctions(json.sanctions ?? []);
        if (json.sanctions?.length) setSelected(`${json.sanctions[0].source}:${json.sanctions[0].id}`);
      } catch {
        /* sin sesión o red */
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase, site, token]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const [source, id] = selected === 'other' ? ['other', ''] : selected.split(':');
      const res = await fetch(`${apiBase}/appeal?site=${encodeURIComponent(site)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ sanctionId: id || null, sanctionSource: source, message }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? 'No se pudo enviar.');
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la apelación.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-xs text-muted">Cargando sanciones…</p>;

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-5">
        <p className="text-sm font-bold text-ink">Apelación enviada</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          El equipo la revisará y responderá por correo (objetivo: 72 h). Puedes seguir el estado en Soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-ink">Sanciones activas</p>
        {sanctions.length === 0 ? (
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            No tienes sanciones activas. Si crees que hubo un error o quieres reportar algo, usa esta misma vía.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {sanctions.map((s) => {
              const value = `${s.source}:${s.id}`;
              return (
                <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3">
                  <input
                    type="radio"
                    name="sanction"
                    className="mt-1 h-4 w-4 accent-[#22d3ee]"
                    checked={selected === value}
                    onChange={() => setSelected(value)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-ink">
                      {s.type.toUpperCase()} · {s.source === 'anticheat' ? 'Ciszu Anti-Cheat' : 'Moderación'}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{s.reason}</span>
                    {s.expiresAt && (
                      <span className="mt-0.5 block text-[10px] text-muted">Hasta {new Date(s.expiresAt).toLocaleString()}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <input
            type="radio"
            name="sanction"
            className="h-4 w-4 accent-[#22d3ee]"
            checked={selected === 'other'}
            onChange={() => setSelected('other')}
          />
          <span className="text-xs font-bold text-ink">Otra consulta / sanción no listada</span>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-muted">Explica tu caso</span>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-neon-blue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cuéntanos qué pasó y por qué crees que la sanción debe revisarse."
        />
      </label>

      {error && <p className="text-[11px] font-bold text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || message.trim().length < 10}
        className="w-full rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-[11px] font-black uppercase tracking-widest text-white transition hover:scale-[1.01] disabled:opacity-50"
      >
        {busy ? 'Enviando…' : 'Enviar apelación'}
      </button>
      <p className="text-center text-[10px] text-muted">También puedes escribir a Soporte; es el mismo canal.</p>
    </div>
  );
}

export default SanctionAppeal;
