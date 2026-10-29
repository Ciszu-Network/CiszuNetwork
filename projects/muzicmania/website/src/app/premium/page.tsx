'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Icon, PaymentTrustBadges } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAppStore } from '@/store';

type PlanId = 'free' | 'plus' | 'pro' | 'lifetime';

interface MuzicPlan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  lifetime: number | null;
  discount: number;
  popular: boolean;
  badge: string;
  colorFrom: string;
  colorTo: string;
  features: string[];
}

const PLANS: MuzicPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Juega sin pagar',
    monthly: 0,
    annual: 0,
    lifetime: null,
    discount: 0,
    popular: false,
    badge: 'Para siempre',
    colorFrom: '#64748b',
    colorTo: '#94a3b8',
    features: ['Juego completo', 'Ranking global', 'Perfil público', 'Anuncios no intrusivos'],
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'La experiencia limpia',
    monthly: 2.99,
    annual: 28.7,
    lifetime: null,
    discount: 20,
    popular: false,
    badge: '20% OFF anual',
    colorFrom: '#0891b2',
    colorTo: '#67e8f9',
    features: ['Sin anuncios', 'Historial ilimitado', 'Skins exclusivas', 'Insignia Plus'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para jugadores serios',
    monthly: 7.99,
    annual: 76.7,
    lifetime: null,
    discount: 20,
    popular: true,
    badge: 'Más popular',
    colorFrom: '#7c3aed',
    colorTo: '#e879f9',
    features: [
      'Todo lo de Plus',
      'Acceso anticipado a charts',
      'Torneos prioritarios',
      'Guardado en la nube',
      'Insignia Pro',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    tagline: 'Un pago, para siempre',
    monthly: null,
    annual: null,
    lifetime: 79,
    discount: 0,
    popular: false,
    badge: 'Pago único',
    colorFrom: '#0f766e',
    colorTo: '#2dd4bf',
    features: ['Todo lo de Pro', 'Sin renovaciones', 'Sin subidas de precio', 'Insignia Lifetime'],
  },
];

const COPY = {
  es: {
    kicker: 'MuzicMania Premium',
    title: 'Sube el nivel de tu experiencia',
    subtitle: 'Sin anuncios, más historial, skins exclusivas y acceso anticipado. El juego sigue siendo gratis.',
    beta: 'Beta abierta',
    betaNote: 'El checkout se habilitará al salir de beta. Mientras tanto puedes revisar los planes y tu facturación.',
    plans: 'Planes',
    monthly: 'Mensual',
    annual: 'Anual',
    perMonth: '/mes',
    perYear: '/año',
    oneTime: 'pago único',
    off: 'OFF',
    original: 'Antes',
    checkoutSoon: 'Checkout al salir de beta',
    billing: 'Gestionar facturación',
    popular: 'Popular',
    free: 'Gratis',
    features: 'Incluye',
    trust: 'Pagos y confianza',
    refundTitle: 'Reembolsos',
    refundBody: 'No existe un sistema de reembolsos. Los pagos son definitivos.',
    termsBody: 'Los planes mensuales y anuales se renuevan automáticamente hasta que los canceles. El plan Lifetime es un pago único. Los precios pueden cambiar con aviso previo.',
    terms: 'Leer términos',
    privacy: 'Privacidad',
    support: 'Soporte',
    back: 'Volver al inicio',
    stats: ['planes', 'pago seguro', 'soporte', 'sin permanencia'],
  },
  en: {
    kicker: 'MuzicMania Premium',
    title: 'Level up your experience',
    subtitle: 'No ads, more history, exclusive skins and early access. The game stays free.',
    beta: 'Open beta',
    betaNote: 'Checkout will open when the beta ends. Meanwhile you can review the plans and your billing.',
    plans: 'Plans',
    monthly: 'Monthly',
    annual: 'Annual',
    perMonth: '/month',
    perYear: '/year',
    oneTime: 'one-time',
    off: 'OFF',
    original: 'Was',
    checkoutSoon: 'Checkout after beta',
    billing: 'Manage billing',
    popular: 'Popular',
    free: 'Free',
    features: 'Includes',
    trust: 'Payments and trust',
    refundTitle: 'Refunds',
    refundBody: 'There is no refund system. Payments are final.',
    termsBody: 'Monthly and annual plans renew automatically until you cancel. Lifetime is a one-time payment. Prices may change with prior notice.',
    terms: 'Read terms',
    privacy: 'Privacy',
    support: 'Support',
    back: 'Back home',
    stats: ['plans', 'secure payment', 'support', 'no lock-in'],
  },
} as const;

const usd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);

export default function PremiumPage() {
  usePageTitle('PREMIUM');
  const lang = useAppStore((state: { lang: string }) => state.lang);
  const isEn = lang.startsWith('en');
  const t = COPY[isEn ? 'en' : 'es'];
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <MainLayout>
      <div className="relative min-h-screen px-4 pb-24 pt-24">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[1000px] -translate-x-1/2 rounded-full blur-[220px]"
          style={{ background: '#7c3aed18' }}
        />

        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neon-cyan hover:underline">
            <Icon name="arrow-back" size={16} /> {t.back}
          </Link>

          <header className="mx-auto mt-8 max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-neon-purple">{t.kicker}</p>
            <h1 className="mt-3 font-header text-4xl font-black tracking-tight text-white md:text-6xl">{t.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55">{t.subtitle}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Icon name="clock" size={12} /> {t.beta}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <Icon name="shield" size={12} /> {t.betaNote}
              </span>
            </div>
          </header>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: '4', label: t.stats[0] },
              { value: 'PCI', label: t.stats[1] },
              { value: '24/7', label: t.stats[2] },
              { value: '0', label: t.stats[3] },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="font-header text-xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-neon-cyan">{t.plans}</h2>
                <p className="mt-1 text-sm text-white/45">{t.betaNote}</p>
              </div>
              <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
                {(['monthly', 'annual'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCycle(item)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                      cycle === item ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {item === 'monthly' ? t.monthly : t.annual}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const isLifetime = plan.id === 'lifetime';
                const price = isLifetime ? plan.lifetime : cycle === 'annual' ? plan.annual : plan.monthly;
                const original = !isLifetime && cycle === 'annual' && plan.monthly !== null ? plan.monthly * 12 : null;
                return (
                  <article
                    key={plan.id}
                    className={`relative overflow-hidden rounded-3xl border p-6 transition hover:-translate-y-1 ${
                      plan.popular ? 'border-cyan-400/50 shadow-[0_0_50px_-20px_rgba(34,211,238,0.6)]' : 'border-white/10'
                    } bg-black/40`}
                    style={{ backgroundImage: `linear-gradient(145deg, ${plan.colorFrom}22, transparent 55%)` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white"
                        style={{ background: `linear-gradient(90deg, ${plan.colorFrom}, ${plan.colorTo})` }}
                      >
                        {plan.name}
                      </span>
                      {plan.popular && <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300">{t.popular}</span>}
                    </div>
                    <h3 className="mt-4 font-header text-lg font-black text-white">{plan.tagline}</h3>
                    <div className="mt-5 flex items-end gap-2">
                      <span className="font-header text-4xl font-black text-white">
                        {price === 0 ? t.free : price !== null ? usd(price) : '—'}
                      </span>
                      {!isLifetime && price !== null && price > 0 && (
                        <span className="pb-1 text-[10px] uppercase tracking-widest text-white/40">
                          {cycle === 'annual' ? t.perYear : t.perMonth}
                        </span>
                      )}
                    </div>
                    {!isLifetime && plan.discount > 0 && original !== null && price !== null && (
                      <p className="mt-1 text-xs text-white/35">
                        {t.original}: <span className="line-through">{usd(original)}</span>{' '}
                        <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black text-emerald-300">
                          -{plan.discount}% {t.off}
                        </span>
                      </p>
                    )}
                    {isLifetime && (
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{t.oneTime}</p>
                    )}
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/45">{t.features}</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/65">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Icon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      disabled
                      className="mt-6 w-full cursor-not-allowed rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-4 py-3 font-header text-[10px] font-black uppercase tracking-widest text-white opacity-40"
                    >
                      {t.checkoutSoon}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-neon-cyan">{t.trust}</h2>
              <PaymentTrustBadges lang={isEn ? 'en' : 'es'} showHeader={false} className="mt-4" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/terms" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">
                  {t.terms}
                </Link>
                <Link href="/policy" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">
                  {t.privacy}
                </Link>
                <Link href="/support" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">
                  {t.support}
                </Link>
                <Link href="/settings" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white">
                  {t.billing}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/5 p-6 text-xs text-white/55">
              <p className="font-bold uppercase tracking-widest text-rose-300">{t.refundTitle}</p>
              <p className="mt-2">{t.refundBody}</p>
              <p className="mt-2">{t.termsBody}</p>
              <Link href="/terms" className="mt-3 inline-flex text-xs font-bold text-rose-200 underline">
                {t.terms}
              </Link>
            </div>
          </section>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
