import Link from "next/link";
import Image from "next/image";
import { assetResolver } from "@ciszunetwork/cdn";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { Shield, ArrowRight, ExternalLink } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import QuickDocks from "@/components/molecules/QuickDocks";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import { getServerI18n } from "@/lib/i18n-server";
import { fillTemplate } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | ABOUT',
  description: 'Conoce a Ciszu Network: nuestra misión, visión y compañía de innovación digital.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default async function AboutPage() {
  const { t } = await getServerI18n();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="info"
          title={t.aboutPage.heroTitle}
          subtitle={fillTemplate(t.aboutPage.heroSubtitle, { site: CISZU_NETWORK.name })}
          kicker={t.aboutPage.kicker}
          theme={THEME}
        />

        <div className="space-y-12">
          <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/10 via-brand-dark/5 to-transparent border border-brand/20">
            <Image
              src={assetResolver.resolve("projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg")}
              alt={CISZU_NETWORK.name}
              width={60}
              height={60}
              className="mb-6 drop-shadow-brand"
            />
            <h2 className="text-2xl md:text-3xl font-header font-bold text-white mb-4">
              {CISZU_NETWORK.name}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              {fillTemplate(t.aboutPage.intro1, { ceo: CISZUKO_ANTONY.name })}
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              {t.aboutPage.intro2}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {t.aboutPage.intro3}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h3 className="text-lg font-header font-bold text-white mb-3">{t.aboutPage.missionTitle}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.aboutPage.mission}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h3 className="text-lg font-header font-bold text-white mb-3">{t.aboutPage.visionTitle}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.aboutPage.vision}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-6">{t.aboutPage.more}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
                {t.aboutPage.contact} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={CISZU_NETWORK.social.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                <ExternalLink className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
