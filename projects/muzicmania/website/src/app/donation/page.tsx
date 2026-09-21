'use client';

import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Icon } from '@ciszu/ui';

/**
 * Página de donaciones de MuzicMania.
 *
 * Los logos son los SVG OFICIALES de cada plataforma, servidos desde el CDN
 * (`shared/icons/svg/brands/<nombre>.svg` vía `resolveIcon(name, 'brand')`).
 * No se usan emojis ni iconos generados.
 */
const DONATION_LINKS = {
  koFi: 'https://ko-fi.com/ciszukoantony',
  buyMeACoffee: 'https://buymeacoffee.com/ciszukoantony',
  patreon: 'https://www.patreon.com/cw/ciszukoantony',
  nowPayments: 'https://nowpayments.io/donation/ciszunetwork',
};

type Method = {
  brand: string;
  label: string;
  href: string;
  note: string;
  color: string;
};

const METHODS: Method[] = [
  {
    brand: 'kofi',
    label: 'Ko-fi',
    href: DONATION_LINKS.koFi,
    note: 'Café directo · sin comisiones',
    color: '#FF5E5B',
  },
  {
    brand: 'buymeacoffee',
    label: 'Buy Me a Coffee',
    href: DONATION_LINKS.buyMeACoffee,
    note: 'Apoyo directo al creador',
    color: '#FFDD00',
  },
  {
    brand: 'patreon',
    label: 'Patreon',
    href: DONATION_LINKS.patreon,
    note: 'Suscripción mensual con recompensas',
    color: '#FF424D',
  },
  {
    brand: 'nowpayments',
    label: 'Cripto (NOWPayments)',
    href: DONATION_LINKS.nowPayments,
    note: 'Bitcoin, USDT, ETH y más · sin KYC',
    color: '#6B21A8',
  },
];

export default function DonationPage() {
  return (
    <MainLayout>
      <div className="relative min-h-screen px-4 pb-24 pt-24">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full blur-[220px]"
          style={{ background: '#ffd90014' }}
        />

        <div className="mx-auto max-w-4xl">
          <header className="mb-14 space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow">
              <Icon name="heart" size={30} />
            </div>
            <h1 className="font-header text-4xl font-black uppercase tracking-tighter text-neon-yellow md:text-6xl">
              Donar
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/45">
              Apoya el ecosistema de MuzicMania
            </p>
            <p className="mx-auto max-w-2xl pt-2 text-sm leading-relaxed text-white/45">
              Tus donaciones mantienen las webs, el bot de Discord, MuzicMania y la comunidad
              CiszuGamens en pie. Cualquier aporte, por pequeño que sea, se agradece de corazón.
            </p>
          </header>

          <section className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {METHODS.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2rem] border border-white/10 bg-black p-6 text-center transition-all hover:border-white/25"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `${method.color}22`, color: method.color }}
                >
                  <Icon name={method.brand} style="brand" size={28} color={method.color} />
                </div>
                <p className="font-header text-sm font-bold text-white">{method.label}</p>
                <p className="mt-1 text-xs text-white/45">{method.note}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-neon-yellow">
                  Abrir
                </span>
              </a>
            ))}
          </section>

          {/* Ko-fi embed oficial */}
          <section className="mb-12">
            <iframe
              src="https://ko-fi.com/ciszukoantony/?hidefeed=true&widget=true&embed=true&preview=true"
              title="Apoya a MuzicMania en Ko-fi"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.02]"
              style={{ height: 712 }}
              allow="payment"
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h2 className="mb-3 text-center font-header text-sm font-bold text-white">
              Cripto (NOWPayments)
            </h2>
            <iframe
              src="https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb"
              width="100%"
              height="623"
              scrolling="no"
              style={{ overflowY: 'hidden', border: 'none' }}
              title="Donaciones en cripto (NOWPayments)"
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </section>

          <div className="mt-12 text-center">
            <p className="text-xs text-white/40">
              ¿Prefieres apoyar de otra forma? Escríbenos a{' '}
              <a href="mailto:ciszunetwork@gmail.com" className="lowercase text-neon-yellow underline">
                ciszunetwork@gmail.com
              </a>
            </p>
            <Link
              href="/support"
              className="mt-6 inline-block rounded-2xl border border-white/15 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 transition-colors hover:text-white"
            >
              Ir a soporte
            </Link>
          </div>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
