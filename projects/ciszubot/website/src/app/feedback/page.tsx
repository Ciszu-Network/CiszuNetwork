import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon, FabRestore } from '@ciszu/ui';
import FeedbackForm, { OpenReportButton } from '@/components/FeedbackForm';
import { DISCORD_SERVER, FEEDBACK_EMAIL, getDict, parseLang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'CiszuBot | FEEDBACK',
  description:
    'Envía feedback, reporta errores o sugiere comandos para CiszuBot. Formulario, email y reporte de problemas.',
};

export default async function FeedbackPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.feedbackPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.feedbackPage.subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Formulario */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neon-blue/12 text-neon-blue">
                <Icon name="mail" size={20} />
              </span>
              <div>
                <h2 className="font-bold text-xl text-ink">{t.feedbackPage.sections.form}</h2>
                <p className="text-xs text-muted">{t.feedbackPage.sections.formDesc}</p>
              </div>
            </div>
            <FeedbackForm
              t={{
                name: t.feedbackPage.name,
                namePlaceholder: t.feedbackPage.namePlaceholder,
                email: t.feedbackPage.email,
                emailPlaceholder: t.feedbackPage.emailPlaceholder,
                message: t.feedbackPage.message,
                messagePlaceholder: t.feedbackPage.messagePlaceholder,
                messageRequired: t.feedbackPage.messageRequired,
                emailInvalid: t.feedbackPage.emailInvalid,
                submit: t.feedbackPage.submit,
                submitted: t.feedbackPage.submitted,
              }}
            />
            <a
              href={`mailto:${FEEDBACK_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-neon-blue transition-colors"
            >
              <Icon name="external" size={13} />
              {t.feedbackPage.alternative}: {FEEDBACK_EMAIL}
            </a>
          </div>

          {/* Reporte de problemas (Sentry) */}
          <div className="flex flex-col gap-6">
            <div className="soft-card rounded-2xl overflow-hidden hover-card">
              <div className="h-1 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue" />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neon-pink/12 text-neon-pink">
                    <Icon name="warning" size={20} />
                  </span>
                  <div>
                    <h2 className="font-bold text-xl text-ink">{t.feedbackPage.sections.report}</h2>
                    <p className="text-xs text-muted">{t.feedbackPage.sections.reportDesc}</p>
                  </div>
                </div>
                <OpenReportButton
                  dict={{
                    openReport: t.feedbackPage.openReport,
                    openReportDesc: t.feedbackPage.openReportDesc,
                    noSentry: t.feedbackPage.noSentry,
                  }}
                />
              </div>
            </div>

            {/* Soporte directo */}
            <div className="soft-card rounded-2xl p-7 hover-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#5865F2]/12 text-[#5865F2]">
                  <Icon name="discord" size={20} className="[&>g]:fill-current" />
                </span>
                <h2 className="font-bold text-lg text-ink">{t.feedbackPage.sections.form}</h2>
              </div>
              <a
                href={DISCORD_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-semibold btn-discord"
              >
                <Icon name="discord" size={16} className="[&>g]:fill-current" />
                {t.supportPage.joinCta}
              </a>
            </div>

            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost">
                {t.feedbackPage.back}
              </Link>
            </div>
          </div>
        </div>

        {/* Restaurar botones flotantes */}
        <div className="max-w-3xl mx-auto mt-12 soft-card rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-sm text-ink mb-1">¿Cerraste el botón flotante?</p>
            <p className="text-xs text-muted">El botón de reporte rápido de abajo a la izquierda se puede volver a mostrar cuando quieras.</p>
          </div>
          <FabRestore accent="#22d3ee" keys={['ciszu-feedback-dismissed']} />
        </div>
      </div>
    </div>
  );
}