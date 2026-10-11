'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';

/**
 * Modal de sesión requerida: el dashboard y /premium redirigen a
 * `/?auth=login` cuando no hay sesión de Discord; antes el usuario aterrizaba
 * en el home sin ninguna explicación. Ofrece las dos vías (CISZU ID y Discord),
 * aclara el caso de rate limit y limpia el parámetro para no repetirse.
 */
export default function AuthRequiredModal() {
  const { dict } = useClientI18n();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'rate_limited'>('login');

  useEffect(() => {
    const auth = params.get('auth');
    if (auth !== 'login' && auth !== 'rate_limited') return;
    setMode(auth);
    setOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [params]);

  if (!open) return null;
  const t = dict.authRequired;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      className="fixed inset-0 z-[115] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-3xl border border-neon-blue/40 bg-[#0a0a14] p-7 text-center shadow-[0_0_50px_-12px_rgba(0,212,255,0.5)]">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-neon-blue/40 bg-neon-blue/10">
          <Icon name="lock" size={22} className="text-neon-blue" />
        </div>
        <h2 className="font-header text-xl font-black uppercase tracking-wide text-white">{t.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {mode === 'rate_limited' ? t.rateLimited : t.body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="key" size={14} />
            {t.loginCta}
          </Link>
          <a
            href="/api/auth/discord"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#4752c4] active:scale-95"
          >
            <Icon name="discord" size={14} className="[&>g]:fill-current" />
            {t.discordCta}
          </a>
          <Link
            href="/register"
            className="text-[11px] font-bold uppercase tracking-widest text-white/50 transition hover:text-white"
          >
            {t.registerCta}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] font-bold uppercase tracking-widest text-white/35 transition hover:text-white/70"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
