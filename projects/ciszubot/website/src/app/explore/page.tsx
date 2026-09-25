import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  Icon,
  InfoHero,
  InfoCtaRow,
} from '@ciszu/ui';
import {
  DISCORD_BOT_LIST_BOT,
  DISCORD_BOT_LIST_SERVER,
  DISCORD_SERVER,
  DISBOARD_SERVER,
  INVITE_URL,
  TOP_GG_BOT,
  TOP_GG_BOT_VOTE,
  TOP_GG_SERVER,
  TOP_GG_WIDGET_BOT,
  TOP_GG_WIDGET_SERVER,
  getDict,
  parseLang,
  type Dict,
} from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | EXPLORE',
  description:
    'CiszuBot y Ciszu Network en Top.gg, Discord Bot List y Disboard: vota, deja tu reseña y usa los widgets de estado.',
};

type PlatformKey = keyof Dict['explorePage']['platforms'];
type ActionKey = 'visit' | 'vote' | 'join';

interface PlatformLink {
  key: PlatformKey;
  icon: string;
  href: string;
  actions: { label: ActionKey; href: string }[];
}

const PLATFORMS: PlatformLink[] = [
  {
    key: 'topggBot',
    icon: 'trophy',
    href: TOP_GG_BOT,
    actions: [
      { label: 'visit', href: TOP_GG_BOT },
      { label: 'vote', href: TOP_GG_BOT_VOTE },
    ],
  },
  {
    key: 'topggServer',
    icon: 'server',
    href: TOP_GG_SERVER,
    actions: [
      { label: 'visit', href: TOP_GG_SERVER },
      { label: 'vote', href: TOP_GG_SERVER },
    ],
  },
  {
    key: 'dblBot',
    icon: 'robot',
    href: DISCORD_BOT_LIST_BOT,
    actions: [
      { label: 'visit', href: DISCORD_BOT_LIST_BOT },
      { label: 'vote', href: `${DISCORD_BOT_LIST_BOT}/upvote` },
    ],
  },
  {
    key: 'dblServer',
    icon: 'server',
    href: DISCORD_BOT_LIST_SERVER,
    actions: [{ label: 'visit', href: DISCORD_BOT_LIST_SERVER }],
  },
  {
    key: 'disboard',
    icon: 'search',
    href: DISBOARD_SERVER,
    actions: [{ label: 'visit', href: DISBOARD_SERVER }],
  },
  {
    key: 'ciszugamens',
    icon: 'people',
    href: DISCORD_SERVER,
    actions: [{ label: 'join', href: DISCORD_SERVER }],
  },
];

export default async function ExplorePage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  const ctaLabel: Record<ActionKey, string> = {
    visit: t.explorePage.visit,
    vote: t.explorePage.vote,
    join: t.explorePage.join,
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="globe"
            title={t.explorePage.title}
            subtitle={t.explorePage.subtitle}
            kicker={t.explorePage.kicker}
            theme={THEME}
          />
        </PageReveal>

        <section>
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            {t.explorePage.platformsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((platform) => {
              const copy = t.explorePage.platforms[platform.key];
              return (
                <article
                  key={platform.key}
                  className={`group flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} ${THEME.card}`}
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${THEME.accentBg} ${THEME.accent}`}
                  >
                    <Icon name={platform.icon} size={22} />
                  </span>
                  <h3 className="font-header font-bold text-white mb-2">{copy.name}</h3>
                  <p className="flex-1 text-sm text-white/60 leading-relaxed mb-5">{copy.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {platform.actions.map((action) => (
                      <a
                        key={`${platform.key}-${action.label}`}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent} hover:scale-105 active:scale-95`}
                      >
                        {action.label === 'vote' ? (
                          <Icon name="favorite" size={13} />
                        ) : action.label === 'join' ? (
                          <Icon name="discord" size={13} className="[&>g]:fill-current" />
                        ) : (
                          <Icon name="external" size={13} />
                        )}
                        {ctaLabel[action.label]}
                      </a>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            {t.explorePage.widgetsTitle}
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-white/60 leading-relaxed">
            {t.explorePage.widgetsDesc}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <a
              href={TOP_GG_BOT}
              target="_blank"
              rel="noopener noreferrer"
              title={t.explorePage.widgetBotAlt}
              className={`flex items-center justify-center rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} ${THEME.card}`}
            >
              <img
                src={TOP_GG_WIDGET_BOT}
                alt={t.explorePage.widgetBotAlt}
                width={276}
                height={197}
                loading="lazy"
                className="h-[197px] w-auto max-w-full rounded-xl"
              />
            </a>
            <a
              href={TOP_GG_SERVER}
              target="_blank"
              rel="noopener noreferrer"
              title={t.explorePage.widgetServerAlt}
              className={`flex items-center justify-center rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} ${THEME.card}`}
            >
              <img
                src={TOP_GG_WIDGET_SERVER}
                alt={t.explorePage.widgetServerAlt}
                loading="lazy"
                className="max-h-[197px] w-auto max-w-full rounded-xl"
              />
            </a>
          </div>
        </section>

        <section className={`mt-14 rounded-3xl border p-8 text-center md:p-10 ${THEME.border} ${THEME.card}`}>
          <h2 className="font-header text-2xl font-black text-white mb-3">{t.explorePage.ctaTitle}</h2>
          <p className="mx-auto max-w-xl text-sm text-white/60 leading-relaxed">
            {t.explorePage.ctaDesc}
          </p>
          <InfoCtaRow
            theme={THEME}
            actions={[
              { label: t.explorePage.ctaButton, href: INVITE_URL, icon: 'discord', external: true },
              {
                label: t.supportPage.joinCta,
                href: DISCORD_SERVER,
                icon: 'globe',
                external: true,
                variant: 'ghost',
              },
            ]}
          />
        </section>
      </div>

      <QuickDocks />
    </div>
  );
}
