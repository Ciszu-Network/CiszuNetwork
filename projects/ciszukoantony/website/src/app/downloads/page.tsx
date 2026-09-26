import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getDict, parseLang, type Dict } from '@/lib/i18n';
import InstallPdwaInline from '@/components/layout/InstallPdwaInline';
import { FabRestore, InfoHero, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | DOWNLOADS',
  description: 'Download and install Ciszuko Antony as a desktop app (PDWA): what it is and installation steps.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const whatIsFor = (dict: Dict) => [
  { title: dict.downloads.what1Title, desc: dict.downloads.what1Desc },
  { title: dict.downloads.what2Title, desc: dict.downloads.what2Desc },
  { title: dict.downloads.what3Title, desc: dict.downloads.what3Desc },
];

const stepsFor = (dict: Dict) => [
  { title: dict.downloads.step1Title, body: dict.downloads.step1Body },
  { title: dict.downloads.step2Title, body: dict.downloads.step2Body },
  { title: dict.downloads.step3Title, body: dict.downloads.step3Body },
  { title: dict.downloads.step4Title, body: dict.downloads.step4Body },
  { title: dict.downloads.step5Title, body: dict.downloads.step5Body },
];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default async function DownloadsPage() {
  const lang = parseLang((await cookies()).get('ciszu_lang')?.value);
  const dict = getDict(lang);
  const whatIs = whatIsFor(dict);
  const steps = stepsFor(dict);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="download"
          title={dict.downloads.heroTitle}
          subtitle={dict.downloads.heroSubtitle}
          theme={THEME}
        />

        <section className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.downloads.title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {dict.downloads.pdwaBefore}<strong className="text-white">{dict.downloads.pdwaFull}</strong>{dict.downloads.pdwaAfter}{' '}
            <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">
              ciszukoantony.vercel.app
            </a>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {whatIs.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <span className="mb-4 inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-pink items-center justify-center text-white">
                  <DownloadIcon />
                </span>
                <h3 className="text-sm font-header font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="installation" className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.downloads.installSteps}
          </h2>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/40 text-neon-blue flex items-center justify-center font-header font-black text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-header font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.downloads.installNow}
          </h2>
          <InstallPdwaInline />
          <p className="text-xs text-gray-600 text-center mt-4">
            {dict.downloads.floatingNote}
          </p>
        </section>

        <section>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              {dict.downloads.notWorking}
            </p>
            <a
              href="/feedback"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/40 text-neon-pink font-header font-bold text-sm hover:bg-neon-pink/20 hover:text-white transition-all active:scale-95"
            >
              {dict.downloads.leaveFeedback}
            </a>
          </div>
        </section>

        <section className="mt-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-header font-bold text-sm mb-1">{dict.downloads.closedButton}</p>
              <p className="text-gray-500 text-xs">{dict.downloads.closedButtonBody}</p>
            </div>
            <FabRestore accent="#a78bfa" keys={['ciszu-pdwa-dismissed']} />
          </div>
        </section>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
