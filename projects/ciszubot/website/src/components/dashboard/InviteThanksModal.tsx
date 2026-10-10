'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';

export const INVITE_MARKER = 'cz-invite-pending';

interface Marker {
  ts: number;
  before: string[];
}

/**
 * Modal de gracias por invitar: aparece si hay una invitación reciente marcada
 * por `InviteLink` (localStorage). Consulta la API hasta detectar un servidor
 * NUEVO en la lista del bot (comparando con la lista previa al clic) y, si no
 * lo detecta en ~80s, avisa con fallback y opción de reintentar.
 */
export default function InviteThanksModal() {
  const router = useRouter();
  const { dict } = useClientI18n();
  const [state, setState] = useState<'idle' | 'detecting' | 'done' | 'failed'>('idle');
  const [found, setFound] = useState<{ id: string; name: string } | null>(null);
  const triesRef = useRef(0);

  useEffect(() => {
    try {
      const marker = JSON.parse(localStorage.getItem(INVITE_MARKER) ?? 'null') as Marker | null;
      if (marker && Date.now() - marker.ts < 10 * 60_000) setState('detecting');
    } catch {
      /* sin storage */
    }
  }, []);

  const check = useCallback(async (): Promise<boolean> => {
    triesRef.current += 1;
    try {
      const marker = JSON.parse(localStorage.getItem(INVITE_MARKER) ?? 'null') as Marker | null;
      const before = marker?.before ?? [];
      const res = await fetch('/api/dashboard/bot-guilds?refresh=1', { cache: 'no-store' });
      const json = (await res.json()) as { ok: boolean; guilds?: { id: string; name: string }[] };
      const fresh = json.ok && Array.isArray(json.guilds) ? json.guilds.filter((g) => !before.includes(g.id)) : [];
      if (fresh.length > 0) {
        setFound(fresh[0]);
        setState('done');
        try {
          localStorage.removeItem(INVITE_MARKER);
        } catch {
          /* sin storage */
        }
        router.refresh();
        return true;
      }
    } catch {
      /* sigue intentando */
    }
    if (triesRef.current >= 20) setState('failed');
    return false;
  }, [router]);

  useEffect(() => {
    if (state !== 'detecting') return;
    const id = window.setInterval(() => {
      void check().then((done) => {
        if (done) window.clearInterval(id);
      });
    }, 4000);
    void check().then((done) => {
      if (done) window.clearInterval(id);
    });
    return () => window.clearInterval(id);
  }, [state, check]);

  if (state === 'idle') return null;

  const retry = () => {
    triesRef.current = 0;
    setState('detecting');
  };

  const close = () => {
    try {
      localStorage.removeItem(INVITE_MARKER);
    } catch {
      /* sin storage */
    }
    setState('idle');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.dashboardPage.inviteThanksTitle}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border p-7 text-center ${
          state === 'failed'
            ? 'border-amber-400/40 bg-[#0a0a14] shadow-[0_0_60px_-12px_rgba(251,191,36,0.5)]'
            : 'border-emerald-400/40 bg-[#0a0a14] shadow-[0_0_60px_-12px_rgba(52,211,153,0.5)]'
        }`}
      >
        {state === 'detecting' && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-neon-blue" />
            <h2 className="font-header text-lg font-black uppercase tracking-wide text-white">
              {dict.dashboardPage.inviteDetecting}
            </h2>
          </>
        )}
        {state === 'done' && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 text-2xl">
              ✅
            </div>
            <h2 className="font-header text-xl font-black uppercase tracking-wide text-emerald-400">
              {dict.dashboardPage.inviteThanksTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {dict.dashboardPage.inviteThanksBody.replace(
                '{guild}',
                found ? `${found.name} (${found.id})` : 'tu servidor',
              )}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-6 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
            >
              {dict.dashboardPage.inviteClose}
            </button>
          </>
        )}
        {state === 'failed' && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-2xl">
              ⚠️
            </div>
            <h2 className="font-header text-xl font-black uppercase tracking-wide text-amber-400">
              {dict.dashboardPage.inviteFailedTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{dict.dashboardPage.inviteFailedBody}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
              >
                <Icon name="refresh" size={14} />
                {dict.dashboardPage.inviteRetry}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-white/20 px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white/70 transition hover:border-neon-blue/60 hover:text-white"
              >
                {dict.dashboardPage.inviteClose}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
