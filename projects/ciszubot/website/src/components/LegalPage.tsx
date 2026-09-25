'use client';

import Link from 'next/link';
import { Icon, InfoHero, LegalCiszuLink, type InfoTheme } from '@ciszu/ui';
import type { Dict } from '@/lib/i18n';

interface LegalPageProps {
  dict: Dict;
  kind: 'terms' | 'privacy';
  title: string;
}

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

export default function LegalPage({ dict, kind, title }: LegalPageProps) {
  const page = kind === 'terms' ? dict.legalPage : dict.privacyPage;

  return (
    <div className="bg-bg py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline"
        >
          <Icon name="arrow-back" size={16} />
          {page.back}
        </Link>

        <InfoHero
          icon={kind === 'terms' ? 'terms' : 'shield'}
          title={title}
          subtitle={page.updated}
          theme={THEME}
        />

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
  );
}
