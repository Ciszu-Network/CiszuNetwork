'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { useClientI18n } from '@/hooks/useClientI18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { INVITE_URL } from '@/lib/i18n';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

interface PremiumClientProps {
  /** Beta activa: todo gratis y modal bloqueante (sin checkout). */
  beta: boolean;
  /** El usuario tiene el bot en al menos uno de sus servidores. */
  hasBotInServer: boolean;
}

/**
 * Pantalla Premium (cliente).
 *
 * Durante la beta: modal bloqueante con disclaimer (sin acceso al checkout) y
 * precio "por definir". Al terminar la beta: gating real (CISZU ID + Discord +
 * bot en ≥1 servidor) y botón de suscripción (pago se conectará entonces).
 */
export default function PremiumClient({ beta, hasBotInServer }: PremiumClientProps) {
  usePageTitle('PREMIUM');
  const router = useRouter();
  const { dict } = useClientI18n();
  const t = dict.premiumPage;
  const [ciszuState, setCiszuState] = useState<'loading' | 'yes' | 'no'>('loading');

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setCiszuState(data.session ? 'yes' : 'no');
      })
      .catch(() => {
        if (active) setCiszuState('no');
      });
    return () => {
      active = false;
    };
  }, []);

  const canBuy = !beta && ciszuState === 'yes' && hasBotInServer;

  const benefits = [
    { icon: 'star', name: t.benefits.musicName, desc: t.benefits.musicDesc },
    { icon: 'search', name: t.benefits.searchName, desc: t.benefits.searchDesc },
    { icon: 'sparkles', name: t.benefits.embedsName, desc: t.benefits.embedsDesc },
    { icon: 'robot', name: t.benefits.profileName, desc: t.benefits.profileDesc },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 mb-6 text-sm font-semibold ${THEME.accent} hover:underline`}
          >
            <Icon name="arrow-back" size={16} />
            {t.modalBack}
          </Link>

          <PageReveal>
            <div className="text-center">
              <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>{t.kicker}</p>
              <h1 className="mt-3 font-header text-4xl font-black text-white md:text-5xl">{t.title}</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{t.subtitle}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-neon-pink/50 bg-neon-pink/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-neon-pink">
                <Icon name="clock" size={12} className="shrink-0" />
                {t.betaBadge} · {t.betaNote}
              </span>
            </div>
          </PageReveal>

          {!beta && ciszuState === 'no' && (
            <div className="mt-8 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
              {t.loginRequired}{' '}
              <Link href="/login" className="font-bold underline">
                {t.loginCta}
              </Link>
            </div>
          )}
          {!beta && !hasBotInServer && (
            <div className="mt-8 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
              {t.botRequired}{' '}
              <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                {t.inviteCta}
              </a>
            </div>
          )}

          <section className="mt-12">
            <h2 className={`mb-5 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
              {t.benefitsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {benefits.map((b) => (
                <article key={b.name} className={`rounded-2xl border p-6 ${THEME.border} ${THEME.card}`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${THEME.accentBg} ${THEME.accent}`}>
                    <Icon name={b.icon} size={18} />
                  </span>
                  <h3 className="mt-3 font-header font-bold text-white">{b.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{b.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className={`mb-5 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
              {t.pricingTitle}
            </h2>
            <div className={`rounded-3xl border p-8 text-center ${THEME.border} ${THEME.card}`}>
              <h3 className="font-header text-2xl font-black text-white">{t.planName}</h3>
              <p className={`mt-2 font-header text-3xl font-black ${THEME.accent}`}>{t.planPrice}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/40">{t.planPeriod}</p>
              <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-white/70">
                {[t.planFeature1, t.planFeature2, t.planFeature3].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Icon name="check" size={14} className={`mt-0.5 shrink-0 ${THEME.accent}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!canBuy}
                className="mt-7 w-full max-w-md rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-6 py-3.5 font-header text-xs font-black uppercase tracking-widest text-white transition enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.subscribe}
              </button>
            </div>
          </section>
        </div>
      </div>

      {beta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.modalTitle}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-lg rounded-3xl border border-amber-400/50 bg-[#0a0a14] p-7 text-center shadow-[0_0_60px_-12px_rgba(251,191,36,0.5)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10">
              <Icon name="crown" size={24} className="text-amber-400" />
            </div>
            <h2 className="font-header text-xl font-black uppercase tracking-wide text-amber-400">{t.modalTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{t.modalBody}</p>
            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/50">
              {t.modalDisclaimer}
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
            >
              {t.modalBack}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
