'use client';

import { InfoHero, InfoCtaRow } from '@ciszu/ui';
import { DISCORD_SERVER } from '@/lib/i18n';
import { useClientI18n } from '@/hooks/useClientI18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import HelpCenter from './HelpCenter';

export default function HelpPage() {
  const { dict: t } = useClientI18n();

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero icon="help" title={t.helpPage.title} subtitle={t.helpPage.subtitle} theme={THEME} />
        </PageReveal>

        <HelpCenter theme={THEME} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Abrir incidencia', href: '/support', icon: 'support' },
            { label: 'Servidor de Discord', href: DISCORD_SERVER, icon: 'discord', external: true, variant: 'ghost' },
            { label: 'Documentación', href: '/documentation', icon: 'policies', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
