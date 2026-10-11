'use client';

import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import type { Dict } from '@/lib/i18n';

/**
 * Promoción de Premium en el home (banda con CTA a /premium).
 * Durante la beta: todo gratis — se indica en el badge y en la página.
 */
export default function PremiumSection({ dict }: { dict: Dict }) {
  const t = dict.premiumPromo;

  return (
    <section className="relative px-4 py-14">
      <div className="mx-auto max-w-screen-xl">
        <div className="relative overflow-hidden rounded-3xl border border-neon-purple/40 bg-gradient-to-r from-neon-blue/10 via-[#6600ff]/10 to-neon-pink/10 p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="min-w-0 max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-purple">{t.kicker}</p>
              <h2 className="mt-2 font-header text-2xl font-black text-white md:text-3xl">{t.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t.desc}</p>
              <span className="mt-4 inline-block rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
                {t.beta}
              </span>
            </div>
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-6 py-3.5 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-105 active:scale-95"
            >
              <Icon name="crown" size={16} />
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
