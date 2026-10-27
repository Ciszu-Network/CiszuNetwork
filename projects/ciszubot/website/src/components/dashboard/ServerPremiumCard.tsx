'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';
import { SERVER_PREMIUM_COPY } from '@/lib/serverPremiumContent';

type State = {
  account: { plan: string; status: string; premiumEnabled: boolean };
  limit: number;
  used: number;
  remaining: number;
  activation: { status: string; activationId: string | null; cooldownUntil: string | null } | null;
};

export function ServerPremiumCard({ guildId }: { guildId: string }) {
  const { lang } = useClientI18n();
  const copy = SERVER_PREMIUM_COPY[lang.startsWith('en') ? 'en' : 'es'];
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/${guildId}/premium`, { cache: 'no-store' });
      if (!res.ok) return;
      setState((await res.json()) as State);
    } catch {
      /* red */
    }
  }, [guildId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (action: 'activate' | 'deactivate') => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/${guildId}/premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; until?: string };
      if (!res.ok) {
        setError(
          data.error === 'premium_not_enabled'
            ? copy.notEnabled
            : data.error === 'limit_reached'
              ? copy.limit
              : data.error === 'cooldown'
                ? `${copy.cooldown} ${data.until ?? '—'}.`
                : copy.error,
        );
        return;
      }
      setState(data as State);
    } finally {
      setBusy(false);
    }
  };

  const active = state?.activation?.status === 'active';
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <Icon name="crown" size={14} className="text-amber-300" /> {copy.title}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {state ? `${state.account.plan} · ${state.remaining} ${copy.remaining} ${state.limit}` : copy.loading}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || !state?.account.premiumEnabled}
          onClick={() => void act(active ? 'deactivate' : 'activate')}
          className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition disabled:opacity-40 ${
            active ? 'border border-rose-400/40 text-rose-200' : 'bg-amber-400/20 text-amber-200'
          }`}
        >
          {active ? copy.deactivate : copy.activate}
        </button>
      </div>
      {!state?.account.premiumEnabled && (
        <p className="mt-2 text-[10px] text-amber-200/80">{copy.needAccount}</p>
      )}
      {error && <p className="mt-2 text-[10px] text-rose-300">{error}</p>}
    </div>
  );
}
