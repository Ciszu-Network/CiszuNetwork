'use client';

import Link from 'next/link';
import { Icon, LegalCiszuLink } from '@ciszu/ui';
import type { Dict } from '@/lib/i18n';

interface LegalPageProps {
  dict: Dict;
  kind: 'terms' | 'privacy';
  title: string;
}

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

        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">{title}</h1>
        <p className="text-sm text-faint mb-10">{page.updated}</p>

        <div className="space-y-6">
          {page.sections.map((s) => (
            <section key={s.h} className="soft-card rounded-2xl p-6">
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
