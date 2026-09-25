import { CISZU_NETWORK } from '@/config/site';
import type { Metadata } from 'next';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FabRestore, InfoHero, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | FEEDBACK',
  description: 'Envíanos tu opinión, reporta un problema o abre el reporte de seguridad. Tus comentarios hacen crecer Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default function FeedbackPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="message"
          title="Feedback"
          subtitle={`Tu opinión construye ${CISZU_NETWORK.name}`}
          kicker="Sugerencias"
          theme={THEME}
        />

        <div className="mx-auto max-w-3xl">
          <FeedbackForm email={CISZU_NETWORK.email} />

          <div className="mt-10 p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-header font-bold text-sm mb-1">¿Cerraste el botón flotante?</p>
              <p className="text-gray-400 text-xs">El botón de reporte rápido de abajo a la izquierda se puede volver a mostrar cuando quieras.</p>
            </div>
            <FabRestore accent="#22d3ee" keys={['ciszu-feedback-dismissed']} />
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}