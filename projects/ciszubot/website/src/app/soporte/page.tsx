import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import Image from 'next/image';
import {
  DISCORD_SERVER,
  BUY_ME_A_COFFEE,
  DISCORD_BOT_LIST_BOT,
  DISCORD_BOT_LIST_SERVER,
  DISBOARD_SERVER,
  KO_FI,
  PATREON,
  TOP_GG_BOT,
  TOP_GG_BOT_VOTE,
  TOP_GG_SERVER,
  TOP_GG_WIDGET_BOT,
  TOP_GG_WIDGET_SERVER,
  getDict,
  type Lang,
} from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'CiszuBot | SUPPORT',
  description:
    'Soporte de CiszuBot: servidor de Discord, preguntas frecuentes, contacto y cómo apoyar el proyecto.',
};

const BOT_LISTS = [
  { name: 'Top.gg', href: TOP_GG_BOT, vote: TOP_GG_BOT_VOTE },
  { name: 'Discord Bot List', href: DISCORD_BOT_LIST_BOT },
];

const SERVER_LISTS = [
  { name: 'Top.gg', href: TOP_GG_SERVER },
  { name: 'Discord Bot List', href: DISCORD_BOT_LIST_SERVER },
  { name: 'Disboard', href: DISBOARD_SERVER },
];

const DONATIONS = [
  {
    name: 'Patreon',
    href: PATREON,
    desc: 'Suscripción mensual con recompensas exclusivas',
    color: 'bg-[#FF424D]/12 text-[#FF424D]',
    icon: 'heart' as const,
  },
  {
    name: 'Ko-fi',
    href: KO_FI,
    desc: 'Compra un café a CiszukoAntony',
    color: 'bg-[#29ABE0]/12 text-[#29ABE0]',
    icon: 'gift' as const,
  },
  {
    name: 'Buy Me a Coffee',
    href: BUY_ME_A_COFFEE,
    desc: 'Donación única, sin suscripción',
    color: 'bg-[#FFDD00]/15 text-[#B8860B] dark:text-[#FFDD00]',
    icon: 'star' as const,
  },
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

        {/* Widgets Top.gg */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-14">
          <a href={TOP_GG_BOT} target="_blank" rel="noopener noreferrer" className="soft-card rounded-2xl p-4 hover-card">
            <Image
              src={TOP_GG_WIDGET_BOT}
              alt="CiszuBot en Top.gg"
              width={140}
              height={96}
              className="h-auto w-auto max-w-[240px]"
              unoptimized
            />
          </a>
          <a
            href={TOP_GG_SERVER}
            target="_blank"
            rel="noopener noreferrer"
            className="soft-card rounded-2xl p-4 hover-card"
          >
            <Image
              src={TOP_GG_WIDGET_SERVER}
              alt="Ciszu Gamens en Top.gg"
              width={240}
              height={96}
              className="h-auto w-auto max-w-[360px]"
              unoptimized
            />
          </a>
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
            <div className="flex flex-col gap-2.5">
              {DONATIONS.map((d) => (
                <a
                  key={d.name}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-brand-400/40 transition-colors"
                >
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${d.color}`}>
                    <Icon name={d.icon} size={16} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-ink">{d.name}</span>
                    <span className="text-xs text-muted truncate">{d.desc}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Server lists */}
        <div className="max-w-3xl mx-auto mt-14">
          <h2 className="text-xl md:text-2xl font-bold text-ink text-center mb-6">{t.supportPage.serverListsTitle}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVER_LISTS.map((list) => (
              <a
                key={list.name}
                href={list.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-ghost"
              >
                <Icon name="flag" size={15} />
                {list.name} · {t.supportPage.server}
              </a>
            ))}
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
