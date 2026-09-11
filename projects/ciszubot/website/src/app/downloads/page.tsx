import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon, FabRestore } from '@ciszu/ui';
import InstallPdwaCta from '@/components/InstallPdwaCta';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | DESCARGAS',
  description:
    'Descarga CiszuBot como PDWA (App de Escritorio Progresiva): instalación sin pestañas, con icono propio en tu escritorio y barra de tareas.',
};

export default async function DescargasPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.descargasPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.descargasPage.subtitle}</p>
          <div className="mt-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-blue/12 text-neon-blue shadow-[0_0_20px_rgba(0,212,255,0.25)]">
            <Icon name="download" size={26} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-2">
          {/* Qué es */}
          <div className="soft-card rounded-2xl p-7 hover-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neon-purple/12 text-neon-purple">
                <Icon name="info" size={20} />
              </span>
              <h2 className="font-bold text-xl text-ink">{t.descargasPage.whatTitle}</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">{t.descargasPage.whatDesc}</p>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-faint mb-3">
                {t.descargasPage.advantagesTitle}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {t.descargasPage.advantages.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-ink">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-success" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cómo instalar */}
          <div className="soft-card rounded-2xl overflow-hidden hover-card self-start">
            <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
            <div className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neon-blue/12 text-neon-blue">
                  <Icon name="terminal" size={20} />
                </span>
                <h2 className="font-bold text-xl text-ink">{t.descargasPage.howTitle}</h2>
              </div>
              <ol className="flex flex-col gap-3 mb-6">
                {t.descargasPage.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-ink">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-blue/15 text-neon-blue text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-border pt-6">
                <InstallPdwaCta
                  title={t.descargasPage.installTitle}
                  desc={t.descargasPage.installDesc}
                  notice={t.descargasPage.steps[0]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="max-w-3xl mx-auto mt-12 soft-card rounded-2xl p-7 text-center hover-card">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-pink/12 text-neon-pink mb-4">
            <Icon name="warning" size={22} />
          </span>
          <h2 className="font-bold text-xl text-ink mb-2">{t.descargasPage.feedbackTitle}</h2>
          <p className="text-sm text-muted mb-6 max-w-xl mx-auto">{t.descargasPage.feedbackDesc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-neon-pink/50 text-neon-pink bg-neon-pink/10 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,51,204,0.4)] active:scale-95"
            >
              <Icon name="message" size={16} />
              {t.descargasPage.feedbackCta}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-ghost">
              {t.descargasPage.back}
            </Link>
          </div>
        </div>

        {/* Restaurar botones flotantes */}
        <div className="max-w-3xl mx-auto mt-8 soft-card rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-sm text-ink mb-1">¿Cerraste el botón flotante?</p>
            <p className="text-xs text-muted">Los botones de instalación y feedback de abajo a la izquierda se pueden volver a mostrar cuando quieras.</p>
          </div>
          <FabRestore accent="#22d3ee" keys={['ciszu-pdwa-dismissed']} />
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}