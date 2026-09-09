import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | HELP',
  description:
    'Centro de ayuda de CiszuBot: FAQ, tutoriales y recursos para usar el bot.',
};

export default async function HelpPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.helpPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.helpPage.subtitle}</p>
          <div className="mt-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-400/12 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.25)]">
            <Icon name="help" size={26} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto soft-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted leading-relaxed">
            {t.helpPage.comingSoon}
          </p>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost">
              {t.helpPage.back}
            </Link>
          </div>
        </div>

        <QuickDocks />
      </div>
    </div>
  );
}
