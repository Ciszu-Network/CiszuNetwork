import { getDonationMethods } from "@ciszunetwork/payments";
import { KoFiEmbed, InfoHero, type InfoTheme } from "@ciszu/ui";
import DonateButtons from "./DonateButtons";
import QuickDocks from "@/components/molecules/QuickDocks";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default function DonatePage() {
  const methods = getDonationMethods();

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="heart"
          title="Donar"
          subtitle="Apoya el ecosistema de Ciszu Network: tus donaciones mantienen las webs, el bot de Discord, MuzicMania y la comunidad CiszuGamens funcionando."
          kicker="Apoyo"
          theme={THEME}
        />

        <DonateButtons methods={methods} />

        {/* Widget iframe OFICIAL de Ko-fi (`hidefeed&widget&embed&preview`), el
            único embed que Ko-fi autoriza incrustar. Se usa KoFiEmbed directo
            para que el iframe esté SIEMPRE presente, independientemente del panel. */}
        <section className="mt-12 rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Apoya en Ko-fi</h3>
          <KoFiEmbed handle="ciszukoantony" title="Apoya a Ciszu Network en Ko-fi" />
        </section>

        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Cripto (NOWPayments)</h3>
          <iframe
            src="https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb"
            width="100%"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", border: "none" }}
            title="Donaciones en cripto (NOWPayments)"
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            ¿Prefieres apoyar de otra forma? Escríbenos a{" "}
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">
              ciszunetwork@gmail.com
            </a>
          </p>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
