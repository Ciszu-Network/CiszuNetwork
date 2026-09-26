'use client';

import React from 'react';
import { InfoHero, InfoCtaRow, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import HelpCenter from './HelpCenter';

/**
 * Centro de ayuda del portfolio.
 *
 * Sigue el sistema de ayuda del ecosistema: buscador en vivo, índice por
 * categorías (chips) y tarjetas que abren un modal central con detalle, pasos
 * y CTA. Estructura y shell canónicos (InfoHero + PageAmbience + PageReveal).
 */
const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

export default function HelpPage() {
  usePageTitle('HELP');
  const dict = useDict();

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="help"
          title={dict.help.title}
          subtitle={dict.help.subtitle}
          theme={THEME}
        />

        <HelpCenter theme={THEME} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.help.ctaTicket, href: '/support', icon: 'support' },
            { label: dict.help.ctaContact, href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
