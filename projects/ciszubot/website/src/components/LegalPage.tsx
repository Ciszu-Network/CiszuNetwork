'use client';

import Link from 'next/link';
import { Icon, InfoHero, LegalCiszuLink } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import type { Dict } from '@/lib/i18n';

interface LegalPageProps {
  dict: Dict;
  kind: 'terms' | 'privacy';
  title: string;
}

export default function LegalPage({ dict, kind, title }: LegalPageProps) {
  const page = kind === 'terms' ? dict.legalPage : dict.privacyPage;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline"
          >
            <Icon name="arrow-back" size={16} />
            {page.back}
          </Link>

          <PageReveal>
            <InfoHero
              icon={kind === 'terms' ? 'terms' : 'shield'}
              title={title}
              subtitle={page.updated}
              theme={THEME}
            />
          </PageReveal>

          <div className="space-y-6">
            {page.sections.map((s) => (
              <section key={s.h} id={s.h} className="soft-card rounded-2xl p-6">
                <h2 className="font-bold text-ink mb-2">{s.h}</h2>
                <p className="text-sm text-muted leading-relaxed">{s.p}</p>
              </section>
            ))}
          </div>

          <LegalCiszuLink />
        </div>
      </div>
    </div>
  );
}
