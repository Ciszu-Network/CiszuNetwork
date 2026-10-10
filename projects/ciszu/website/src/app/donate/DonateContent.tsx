'use client';

import { KoFiEmbed, InfoHero, type InfoTheme } from "@ciszu/ui";
import type { DonationMethod } from "@ciszunetwork/payments";
import DonateButtons from "./DonateButtons";
import QuickDocks from "@/components/molecules/QuickDocks";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import { CISZU_NETWORK } from "@/config/site";
import { useDict } from "@/lib/useDict";
import { fillTemplate } from "@/lib/i18n";

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

/**
 * Contenido de /donate en cliente (Fase 4): resuelve el idioma sin `cookies()`
 * en servidor. `methods` llega resuelto del servidor (env `DONATE_*`).
 */
export default function DonateContent({ methods }: { methods: DonationMethod[] }) {
  const t = useDict();

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="heart"
          title={t.donatePage.heroTitle}
          subtitle={fillTemplate(t.donatePage.heroSubtitle, { site: 'Ciszu Network' })}
          kicker={t.donatePage.kicker}
          theme={THEME}
        />

        <DonateButtons methods={methods} />

        {/* Widget iframe OFICIAL de Ko-fi (`hidefeed&widget&embed&preview`), el
            único embed que Ko-fi autoriza incrustar. Se usa KoFiEmbed directo
            para que el iframe esté SIEMPRE presente, independientemente del panel. */}
        <section className="mt-12 rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">{t.donatePage.kofiTitle}</h3>
          <KoFiEmbed handle="ciszukoantony" title={t.donatePage.kofiEmbedTitle} />
        </section>

        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">{t.donatePage.cryptoTitle}</h3>
          <iframe
            src="https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb"
            width="100%"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", border: "none" }}
            title={t.donatePage.cryptoEmbedTitle}
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            {t.donatePage.otherQuestion}{" "}
            <a href={`mailto:${CISZU_NETWORK.email}`} className="text-brand-light underline">
              {CISZU_NETWORK.email}
            </a>
          </p>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
