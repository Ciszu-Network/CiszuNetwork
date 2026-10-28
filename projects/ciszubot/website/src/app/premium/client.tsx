'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import {
  CURRENCIES,
  PREMIUM_PLANS,
  discountedPrice,
  discountActive,
  formatMoney,
  listPrice,
  type BillingCycle,
  type CurrencyCode,
  type PremiumPlan,
  type PremiumPlanId,
} from '@ciszunetwork/utils';
import { supabase } from '@/config/supabase';
import { useClientI18n } from '@/hooks/useClientI18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { INVITE_URL } from '@/lib/i18n';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import { PLAN_AUDIENCE_EN, PLAN_FEATURES_EN, PLAN_TAGLINE_EN, PREMIUM_COPY } from '@/lib/premiumContent';

interface PremiumClientProps {
  beta: boolean;
  hasBotInServer: boolean;
}

const CARD_PLANS: PremiumPlanId[] = ['gold', 'diamond', 'platinum'];
const COMPARE_PLANS: PremiumPlanId[] = ['free', 'beta', 'gold', 'diamond', 'platinum', 'lifetime'];

function planCopy(plan: PremiumPlan, lang: 'es' | 'en') {
  if (lang === 'en') {
    return {
      tagline: PLAN_TAGLINE_EN[plan.id],
      audience: PLAN_AUDIENCE_EN[plan.id],
      features: PLAN_FEATURES_EN[plan.id],
    };
  }
  return { tagline: plan.tagline, audience: plan.audience, features: plan.features };
}

export default function PremiumClient({ beta, hasBotInServer }: PremiumClientProps) {
  usePageTitle('PREMIUM');
  const { lang, dict } = useClientI18n();
  const c = PREMIUM_COPY[lang.startsWith('en') ? 'en' : 'es'];
  const [ciszuState, setCiszuState] = useState<'loading' | 'yes' | 'no'>('loading');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<Record<string, number>>({});

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

  useEffect(() => {
    let active = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const payload = data as { rates?: Record<string, number> } | null;
        if (active && payload?.rates) setRates(payload.rates);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const rate = rates[currency] ?? CURRENCIES.find((item) => item.code === currency)?.rate ?? 1;
  const canBuy = false;
  const paidPlans = useMemo(() => PREMIUM_PLANS.filter((plan) => CARD_PLANS.includes(plan.id)), []);
  const lifetime = PREMIUM_PLANS.find((plan) => plan.id === 'lifetime')!;
  const free = PREMIUM_PLANS.find((plan) => plan.id === 'free')!;
  const betaPlan = PREMIUM_PLANS.find((plan) => plan.id === 'beta')!;

  const comparison: { label: string; values: Record<PremiumPlanId, string | boolean> }[] = [
    {
      label: c.compareServers,
      values: { free: '0', beta: '3', gold: '3', diamond: '8', platinum: '20', lifetime: '20' },
    },
    { label: c.compareMusic, values: { free: false, beta: true, gold: true, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareSearch, values: { free: false, beta: true, gold: true, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareEmbeds, values: { free: false, beta: true, gold: true, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareDrops, values: { free: false, beta: true, gold: true, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareAnalytics, values: { free: false, beta: false, gold: false, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareSupport, values: { free: false, beta: false, gold: false, diamond: true, platinum: true, lifetime: true } },
    { label: c.compareLifetime, values: { free: false, beta: false, gold: false, diamond: false, platinum: false, lifetime: true } },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20">
      <PageAmbience />
      <div className="relative mx-auto max-w-screen-xl px-4">
        <Link href="/" className={`inline-flex items-center gap-2 text-sm font-semibold ${THEME.accent} hover:underline`}>
          <Icon name="arrow-back" size={16} /> {dict.premiumPage.modalBack}
        </Link>

        <PageReveal>
          <header className="mx-auto mt-8 max-w-4xl text-center">
            <p className={`text-[11px] font-black uppercase tracking-[0.35em] ${THEME.accent}`}>{c.kicker}</p>
            <h1 className="mt-3 font-header text-4xl font-black tracking-tight text-white md:text-6xl">{c.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{c.subtitle}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Icon name="clock" size={12} /> {c.beta} · {c.betaNote}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <Icon name="shield" size={12} /> {c.secure}
              </span>
            </div>
          </header>
        </PageReveal>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: '20', label: c.statsServers },
            { value: '99.9%', label: c.statsUptime },
            { value: '24/7', label: c.statsSupport },
            { value: 'PCI', label: c.statsSecure },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-4 text-center ${THEME.border} ${THEME.card}`}>
              <p className="font-header text-xl font-black text-white">{stat.value}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {!beta && ciszuState === 'no' && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
            {c.login}{' '}
            <Link href="/login" className="font-bold underline">
              {dict.premiumPage.loginCta}
            </Link>
          </div>
        )}
        {!beta && !hasBotInServer && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
            {c.bot}{' '}
            <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
              {dict.premiumPage.inviteCta}
            </a>
          </div>
        )}

        <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">{c.trialBadge}</p>
              <h2 className="mt-1 font-header text-2xl font-black text-white">{c.trialTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/55">{c.trialBody}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-black/20 px-5 py-4 text-center">
              <p className="font-header text-2xl font-black text-amber-300">$0</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{c.trialServers}</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>{c.plans}</h2>
              <p className="mt-1 text-sm text-white/45">{c.billedBy}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
                {(['monthly', 'annual'] as BillingCycle[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCycle(item)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                      cycle === item ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {item === 'monthly' ? c.monthly : c.annual}
                  </button>
                ))}
              </div>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 outline-none"
              >
                {CURRENCIES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-[#0a0a14]">
                    {item.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-white/30">{c.rateNote}</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {paidPlans.map((plan) => {
              const copy = planCopy(plan, lang.startsWith('en') ? 'en' : 'es');
              const original = listPrice(plan, cycle);
              const final = discountedPrice(plan, cycle);
              const activeDiscount = discountActive(plan);
              return (
                <article
                  key={plan.id}
                  className={`relative overflow-hidden rounded-3xl border p-6 transition hover:-translate-y-1 ${
                    plan.popular ? 'border-cyan-400/50 shadow-[0_0_50px_-20px_rgba(34,211,238,0.6)]' : THEME.border
                  } ${THEME.card}`}
                  style={{ backgroundImage: `linear-gradient(145deg, ${plan.colorFrom}22, transparent 55%)` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white" style={{ background: `linear-gradient(90deg, ${plan.colorFrom}, ${plan.colorTo})` }}>
                      {plan.name}
                    </span>
                    {plan.popular && <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300">{c.popularBadge}</span>}
                  </div>
                  <h3 className="mt-4 font-header text-xl font-black text-white">{copy.tagline}</h3>
                  <p className="mt-1 text-xs text-white/45">{copy.audience}</p>
                  <div className="mt-5 flex items-end gap-2">
                    {final !== null && (
                      <span className="font-header text-4xl font-black text-white">
                        {formatMoney(final, currency, rate)}
                      </span>
                    )}
                    <span className="pb-1 text-[10px] uppercase tracking-widest text-white/40">
                      {cycle === 'monthly' ? c.perMonth : c.perYear}
                    </span>
                  </div>
                  {activeDiscount && original !== null && final !== null && (
                    <p className="mt-1 text-xs text-white/35">
                      {c.original}: <span className="line-through">{formatMoney(original, currency, rate)}</span>{' '}
                      <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black text-emerald-300">
                        {c.discountBadge} -{plan.discountPercent}%
                      </span>
                    </p>
                  )}
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/50">
                    {plan.serverLimit} {c.servers}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-white/65">
                    {copy.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Icon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={!canBuy}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-[10px] font-black uppercase tracking-widest text-white transition enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {beta ? c.betaCta : c.checkoutSoon}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className={`rounded-3xl border p-6 ${THEME.border} ${THEME.card}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-header text-xl font-black text-white">{c.lifetimeCard}</h2>
              <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-teal-300">
                {lifetime.badge}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/50">{c.lifetimePriceNote}</p>
            <p className="mt-5 font-header text-4xl font-black text-white">{formatMoney(lifetime.lifetimeUsd ?? 100, currency, rate)}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">{c.oneTime}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {planCopy(lifetime, lang.startsWith('en') ? 'en' : 'es').features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Icon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!canBuy}
              className="mt-6 w-full rounded-xl border border-teal-400/40 bg-teal-400/10 px-5 py-3 font-header text-[10px] font-black uppercase tracking-widest text-teal-200 transition enabled:hover:bg-teal-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {beta ? c.betaCta : c.checkoutSoon}
            </button>
          </article>

          <article className={`rounded-3xl border p-6 ${THEME.border} ${THEME.card}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-header text-xl font-black text-white">{c.freeCard}</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/50">
                {free.badge}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/50">{c.freePriceNote}</p>
            <p className="mt-5 font-header text-4xl font-black text-white">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {planCopy(free, lang.startsWith('en') ? 'en' : 'es').features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Icon name="check" size={14} className="mt-0.5 shrink-0 text-white/40" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[10px] uppercase tracking-widest text-white/30">{c.freeNote}</p>
          </article>
        </section>

        <section className="mt-12">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>{c.compare}</h2>
          <div className={`mt-4 overflow-x-auto rounded-2xl border ${THEME.border} ${THEME.card}`}>
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-white/40">
                  <th className="p-4">{c.comparisonFeature}</th>
                  {COMPARE_PLANS.map((id) => (
                    <th key={id} className="p-4 text-center">{PREMIUM_PLANS.find((plan) => plan.id === id)?.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-white/65">{row.label}</td>
                    {COMPARE_PLANS.map((id) => {
                      const value = row.values[id];
                      return (
                        <td key={id} className="p-4 text-center">
                          {typeof value === 'boolean' ? (
                            <Icon name={value ? 'check' : 'x'} size={14} className={value ? 'mx-auto text-emerald-300' : 'mx-auto text-white/20'} />
                          ) : (
                            <span className="font-bold text-white/75">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className={`rounded-3xl border p-6 ${THEME.border} ${THEME.card}`}>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>{c.discountHistory}</h2>
            <div className="mt-4 space-y-2">
              {PREMIUM_PLANS.filter((plan) => plan.discountPercent > 0).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{plan.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/35">{c.discountExpires}: {c.indefinite}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-300">-{plan.discountPercent}% {c.active}</span>
                </div>
              ))}
              <p className="text-[10px] text-white/30">{c.lifetimeNote} {c.freeNote}</p>
            </div>
          </div>

          <div className={`rounded-3xl border p-6 ${THEME.border} ${THEME.card}`}>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>{c.trust}</h2>
            <p className="mt-2 text-sm text-white/50">{c.trustBody}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/65">
              {[
                { label: c.trustStripe, href: 'https://stripe.com/legal' },
                { label: c.trustPaypal, href: 'https://www.paypal.com/legalhub/home' },
                { label: c.trustMercado, href: 'https://www.mercadopago.com/legal' },
                { label: c.trustBank, href: '/terms' },
                { label: c.trustSecurity, href: 'https://www.rfc-editor.org/rfc/rfc8446' },
                { label: c.trustPci, href: 'https://www.pcisecuritystandards.org/' },
                { label: c.trustSupport, href: '/support' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 transition hover:border-emerald-400/40 hover:text-white"
                >
                  <Icon name="shield" size={13} className="text-emerald-300" /> {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/terms" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">{c.viewTerms}</Link>
              <Link href="/privacy" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">{c.viewPrivacy}</Link>
              <Link href="/guidelines" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">{c.viewGuidelines}</Link>
              <Link href="/settings" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">{c.billingCta}</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-xs text-white/55">
          <p className="font-bold uppercase tracking-widest text-rose-300">{c.refundTitle}</p>
          <p className="mt-2">{c.refundBody}</p>
          <p className="mt-2">{c.termsBody}</p>
          <Link href="/terms" className="mt-3 inline-flex text-xs font-bold text-rose-200 underline">{c.termsLink}</Link>
        </section>
      </div>
    </div>
  );
}
