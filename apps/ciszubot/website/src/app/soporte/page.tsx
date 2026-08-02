import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { DISCORD_SERVER, getDict, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Soporte — CiszuBot',
  description:
    'Soporte de CiszuBot: servidor de Discord, preguntas frecuentes, contacto y cómo apoyar el proyecto.',
};

const DONATE_PLACEHOLDERS = ['Patreon', 'Ko-fi', 'Buy Me a Coffee'];
const BOT_LISTS = [
  { name: 'Top.gg', href: 'https://top.gg' },
  { name: 'Discord Bot List', href: 'https://discordbotlist.com' },
  { name: 'Discord Boats', href: 'https://discord.boats' },
];

export default async function SupportPage() {
  const store = await cookies();
  const lang = (store.get('ciszubot_lang')?.value ?? 'es') as Lang;
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.supportPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.supportPage.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Discord server */}
          <div className="soft-card rounded-2xl p-7 hover-card flex flex-col">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5865F2]/12 text-[#5865F2] mb-4">
              <Icon name="discord" size={24} className="[&>g]:fill-current" />
            </span>
            <h2 className="font-bold text-xl text-ink mb-2">{t.supportPage.joinTitle}</h2>
            <p className="text-sm text-muted mb-6 flex-grow leading-relaxed">{t.supportPage.joinDesc}</p>
            <a
              href={DISCORD_SERVER}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-discord"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              {t.supportPage.joinCta}
            </a>
          </div>

          {/* Contact */}
          <div className="soft-card rounded-2xl p-7 hover-card flex flex-col">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-400/12 text-brand-600 dark:text-brand-300 mb-4">
              <Icon name="mail" size={24} />
            </span>
            <h2 className="font-bold text-xl text-ink mb-2">{t.supportPage.contactTitle}</h2>
            <p className="text-sm text-muted mb-6 flex-grow leading-relaxed">
              {t.supportPage.contactDesc}{' '}
              <a href="mailto:soporte@ciszunetwork.com" className="text-brand-600 dark:text-brand-300 hover:underline font-medium">
                soporte@ciszunetwork.com
              </a>
            </p>
            <a
              href="mailto:soporte@ciszunetwork.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-ghost"
            >
              <Icon name="mail" size={16} />
              {t.supportPage.contactCta}
            </a>
          </div>

          {/* Donations */}
          <div className="soft-card rounded-2xl p-7 hover-card flex flex-col">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-400/12 text-violet-500 dark:text-violet-300 mb-4">
              <Icon name="heart" size={24} />
            </span>
            <h2 className="font-bold text-xl text-ink mb-2">{t.supportPage.donateTitle}</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">{t.supportPage.donateDesc}</p>
            <div className="flex flex-wrap gap-2">
              {DONATE_PLACEHOLDERS.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-faint"
                  title={t.supportPage.comingSoon}
                >
                  <Icon name="gift" size={14} />
                  {name}
                  <span className="text-[10px] uppercase tracking-wide bg-violet-400/15 text-violet-500 dark:text-violet-300 px-1.5 py-0.5 rounded">
                    {t.supportPage.comingSoon}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-ink text-center mb-8">{t.supportPage.faqTitle}</h2>
          <div className="space-y-3">
            {t.supportPage.faq.map((item, i) => (
              <details key={i} className="soft-card rounded-2xl p-5 group">
                <summary className="flex items-center gap-3 font-semibold text-ink list-none cursor-pointer select-none">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-400/12 text-brand-600 dark:text-brand-300 shrink-0">
                    <Icon name="faq" size={15} />
                  </span>
                  {item.q}
                  <Icon name="chevronRight" size={16} className="ml-auto text-faint group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 pl-10 text-sm text-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bot lists */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-ink text-center mb-3">{t.supportPage.listsTitle}</h2>
          <p className="text-center text-muted mb-8">{t.supportPage.listsDesc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BOT_LISTS.map((list) => (
              <a
                key={list.name}
                href={list.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-ghost"
              >
                <Icon name="star" size={15} />
                {list.name} · {t.supportPage.vote}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
