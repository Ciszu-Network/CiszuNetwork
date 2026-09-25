import type { Metadata } from 'next';
import { InfoHero, InfoCtaRow, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import HelpCenter from './HelpCenter';

export const metadata: Metadata = {
  title: 'Ciszu Network | HELP',
  description:
    'Centro de ayuda de Ciszu Network: busca por tema, abre la guía en un modal y salta a la página o servicio que necesitas.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default function HelpPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="help"
          title="Help"
          subtitle="Centro de ayuda de Ciszu Network: guías de cuenta, navegación, descargas, servicios y soporte, con buscador y detalle en modal."
          kicker="Soporte"
          theme={THEME}
        />

        <HelpCenter theme={THEME} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Abrir incidencia', href: '/support', icon: 'support' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
            { label: 'Ver documentación', href: '/documentation', icon: 'policies', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
