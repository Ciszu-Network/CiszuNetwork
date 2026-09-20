import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | FAQ',
  description:
    'Preguntas frecuentes sobre CiszuBot: invitación, prefijo, privacidad, soporte y más.',
};

export default async function FAQPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.faqPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.faqPage.subtitle}</p>
          <div className="mt-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-400/12 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Icon name="help" size={26} />
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {t.faqPage.items.map((item, idx) => (
            <details
              key={idx}
              className="soft-card rounded-2xl p-6 group"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-ink">
                <span className="pr-4">{item.q}</span>
                <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-4 text-sm text-muted leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost">
            {t.faqPage.back}
          </Link>
        </div>

        <QuickDocks />
      </div>
    </div>
  );
}
