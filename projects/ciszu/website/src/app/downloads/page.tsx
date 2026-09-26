import { MonitorDown, Smartphone, ShieldCheck } from 'lucide-react';
import { CISZU_NETWORK } from '@/config/site';
import type { Metadata } from 'next';
import { InstallPdwaCta } from '@/components/descargas/InstallPdwaCta';
import { FabRestore, InfoHero, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { getServerI18n } from '@/lib/i18n-server';
import { fillTemplate } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Ciszu Network | DESCARGAS',
  description: 'Instala Ciszu Network como PDWA (App de Escritorio Progresiva) en tu PC o móvil, sin pestañas ni barra de dirección.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default async function DescargasPage() {
  const { t } = await getServerI18n();

  const steps = [
    {
      icon: MonitorDown,
      title: t.downloadsPage.step1Title,
      content: t.downloadsPage.step1Content,
    },
    {
      icon: Smartphone,
      title: t.downloadsPage.step2Title,
      content: t.downloadsPage.step2Content,
    },
    {
      icon: ShieldCheck,
      title: t.downloadsPage.step3Title,
      content: fillTemplate(t.downloadsPage.step3Content, { site: CISZU_NETWORK.name }),
    },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="download"
          title={t.downloadsPage.heroTitle}
          subtitle={fillTemplate(t.downloadsPage.heroSubtitle, { site: CISZU_NETWORK.name })}
          kicker={t.downloadsPage.kicker}
          theme={THEME}
        />

        <div className="space-y-6 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-brand/10 text-brand-light flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-header font-bold text-white mb-2">{s.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/10 to-transparent border border-brand/30 text-center">
          <h2 className="text-2xl md:text-3xl font-header font-black text-white uppercase tracking-tighter mb-4">
            {fillTemplate(t.downloadsPage.installTitle, { site: CISZU_NETWORK.name })}
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
            {t.downloadsPage.installDesc}
          </p>
          <InstallPdwaCta site={CISZU_NETWORK.name} />
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-header font-bold text-sm mb-1">{t.downloadsPage.fabQuestion}</p>
            <p className="text-gray-400 text-xs">{t.downloadsPage.fabHint}</p>
          </div>
          <FabRestore accent="#22d3ee" keys={['ciszu-pdwa-dismissed']} />
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}