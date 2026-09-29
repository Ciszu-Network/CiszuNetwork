'use client';

import { EcosystemSection } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';
import { useClientI18n } from '@/hooks/useClientI18n';
import { BOT_PREFIX } from '@/lib/i18n';
import type { BotStatus } from '@/lib/botStatus';
import HeroBanner from './HeroBanner';
import StatsStrip from './StatsStrip';
import FeaturesSection from './FeaturesSection';
import CommandTabs from './CommandTabs';
import PlatformsSection from './PlatformsSection';
import ChangelogStrip from './ChangelogStrip';
import ReviewsStrip from './ReviewsStrip';
import CtaSection from './CtaSection';

interface HomeContentProps {
  status: BotStatus | null;
  /** Timestamp del render servidor: evita desajustes de hidratación en el uptime. */
  serverNow: number;
}

/**
 * HOME de CiszuBot — nivel MuzicMania, solo con datos reales:
 * estado en vivo de Supabase, comandos del repositorio del bot, changelog del
 * código/publicado y reseñas reales. Todas las secciones usan el diccionario
 * i18n existente; sin datos disponibles se muestra "—", nunca cifras falsas.
 *
 * Fase 4 (STATIC_MIGRATION_PLAN §4.5): el idioma se resuelve en cliente
 * (`useClientI18n`) para que el home pueda ser ISR real sin `cookies()`.
 */
export default function HomeContent({ status, serverNow }: HomeContentProps) {
  usePageTitle('HOME');
  const { lang, dict } = useClientI18n();
  const prefix = status?.prefix ?? BOT_PREFIX;

  return (
    <>
      <div className="bg-bg relative overflow-hidden">
        <HeroBanner dict={dict} status={status} serverNow={serverNow} />
        <StatsStrip dict={dict} lang={lang} status={status} serverNow={serverNow} />
        <FeaturesSection dict={dict} />
        <CommandTabs dict={dict} prefix={prefix} />
        <PlatformsSection dict={dict} />
        <ChangelogStrip dict={dict} />
        <ReviewsStrip dict={dict} lang={lang} />
        <CtaSection dict={dict} />

        <EcosystemSection
          title={dict.ecosystem.providedTitle}
          description={dict.ecosystem.providedDesc}
          visitHref="https://ciszunetwork.vercel.app"
          projectsHref="https://ciszunetwork.vercel.app/projects"
        />
      </div>

      <QuickDocks />
    </>
  );
}
