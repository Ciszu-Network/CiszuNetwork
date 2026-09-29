'use client';

import {
  CopyWithButton,
  Icon,
  InfoHero,
  InfoCtaRow,
} from '@ciszu/ui';
import {
  DISCORD_BOT_LIST_BOT,
  DISCORD_BOT_LIST_BOT_VOTE,
  DISCORD_BOT_LIST_SERVER,
  DISCORD_SERVER,
  DISBOARD_SERVER,
  INVITE_URL,
  TOP_GG_BOT,
  TOP_GG_BOT_VOTE,
  TOP_GG_SERVER,
  TOP_GG_WIDGET_BOT,
  TOP_GG_WIDGET_SERVER,
  type Dict,
} from '@/lib/i18n';
import { useClientI18n } from '@/hooks/useClientI18n';
import { BOT_ID } from '@/lib/botStatus';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

type PlatformKey = keyof Dict['explorePage']['platforms'];
type ActionKey = 'visit' | 'vote' | 'join';
type GroupKey = 'bots' | 'servers' | 'community';

interface PlatformAction {
  label: ActionKey;
  href: string;
}

interface PlatformLink {
  key: PlatformKey;
  group: GroupKey;
  icon: string;
  href: string;
  actions: PlatformAction[];
}

/**
 * Plataformas reales del ecosistema. Las listas de bots (Top.gg, Discord Bot
 * List) van en "bots"; las fichas del servidor comunitario (Top.gg server,
 * DBL server, Disboard) en "servers"; y el servidor de soporte en "community".
 * DiscordBots.gg NO se incluye: no existe URL ni constante en el repo.
 */
const PLATFORMS: PlatformLink[] = [
  {
    key: 'topggBot',
    group: 'bots',
    icon: 'trophy',
    href: TOP_GG_BOT,
    actions: [
      { label: 'visit', href: TOP_GG_BOT },
      { label: 'vote', href: TOP_GG_BOT_VOTE },
    ],
  },
  {
    key: 'dblBot',
    group: 'bots',
    icon: 'robot',
    href: DISCORD_BOT_LIST_BOT,
    actions: [
      { label: 'visit', href: DISCORD_BOT_LIST_BOT },
      { label: 'vote', href: DISCORD_BOT_LIST_BOT_VOTE },
    ],
  },
  {
    key: 'topggServer',
    group: 'servers',
    icon: 'server',
    href: TOP_GG_SERVER,
    actions: [{ label: 'visit', href: TOP_GG_SERVER }],
  },
  {
    key: 'dblServer',
    group: 'servers',
    icon: 'server',
    href: DISCORD_BOT_LIST_SERVER,
    actions: [{ label: 'visit', href: DISCORD_BOT_LIST_SERVER }],
  },
  {
    key: 'disboard',
    group: 'servers',
    icon: 'search',
    href: DISBOARD_SERVER,
    actions: [
      { label: 'visit', href: DISBOARD_SERVER },
      { label: 'join', href: DISCORD_SERVER },
    ],
  },
  {
    key: 'ciszugamens',
    group: 'community',
    icon: 'people',
    href: DISCORD_SERVER,
    actions: [{ label: 'join', href: DISCORD_SERVER }],
  },
];

const GROUP_ORDER: GroupKey[] = ['bots', 'servers', 'community'];

const ACTION_ICONS: Record<ActionKey, string> = {
  visit: 'external',
  vote: 'favorite',
  join: 'discord',
};

function PlatformCard({
  platform,
  name,
  desc,
  ctaLabel,
}: {
  platform: PlatformLink;
  name: string;
  desc: string;
  ctaLabel: Record<ActionKey, string>;
}) {
  return (
    <article
      className={`group flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} ${THEME.card}`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${THEME.accentBg} ${THEME.accent}`}
      >
        <Icon name={platform.icon} size={22} />
      </span>
      <h3 className="font-header font-bold text-white mb-2">{name}</h3>
      <p className="flex-1 text-sm text-white/60 leading-relaxed mb-5">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {platform.actions.map((action) => {
          const icon = ACTION_ICONS[action.label];
          return (
            <a
              key={`${platform.key}-${action.label}`}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent} hover:scale-105 active:scale-95`}
            >
              <Icon
                name={icon}
                size={13}
                className={icon === 'discord' ? '[&>g]:fill-current' : undefined}
              />
              {ctaLabel[action.label]}
            </a>
          );
        })}
      </div>
    </article>
  );
}

function WidgetCard({
  href,
  name,
  src,
  alt,
  code,
  copyLabel,
  copiedLabel,
  width,
  height,
}: {
  href: string;
  name: string;
  src: string;
  alt: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
  width?: number;
  height?: number;
}) {
  return (
    <article className={`flex flex-col rounded-2xl border p-6 ${THEME.border} ${THEME.card}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={alt}
        className={`flex flex-1 items-center justify-center rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} bg-black/30`}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="h-[197px] w-auto max-w-full rounded-xl object-contain"
        />
      </a>
      <h3 className="font-header font-bold text-white mt-5 mb-3">{name}</h3>
      <CopyWithButton
        value={code}
        label={copyLabel}
        copiedLabel={copiedLabel}
        size="sm"
        className={`w-full rounded-xl border px-3 py-2.5 ${THEME.border} bg-black/30`}
      >
        <code className="block max-h-24 flex-1 overflow-auto whitespace-pre text-[10px] leading-relaxed text-white/50">
          {code}
        </code>
      </CopyWithButton>
    </article>
  );
}

export default function ExplorePage() {
  const { dict: t } = useClientI18n();

  const ctaLabel: Record<ActionKey, string> = {
    visit: t.explorePage.visit,
    vote: t.explorePage.vote,
    join: t.explorePage.join,
  };

  const groupTitles: Record<GroupKey, string> = {
    bots: t.explorePage.botsTitle,
    servers: t.explorePage.serversTitle,
    community: t.explorePage.communityTitle,
  };

  // Mismos snippets canónicos de shared/widgets/topgg-{bot,server}.html: se
  // copian tal cual para que cualquiera los pegue en su web, foro o README.
  const widgetBotCode = `<a href="${TOP_GG_BOT}">\n  <img src="${TOP_GG_WIDGET_BOT}" alt="${t.explorePage.widgetBotAlt}" />\n</a>`;
  const widgetServerCode = `<a href="${TOP_GG_SERVER}">\n  <img src="${TOP_GG_WIDGET_SERVER}" alt="${t.explorePage.widgetServerAlt}" />\n</a>`;

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

        <div className="space-y-14">
          {GROUP_ORDER.map((group) => (
            <section key={group}>
              <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
                {groupTitles[group]}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {PLATFORMS.filter((platform) => platform.group === group).map((platform) => {
                  const copy = t.explorePage.platforms[platform.key];
                  return (
                    <PlatformCard
                      key={platform.key}
                      platform={platform}
                      name={copy.name}
                      desc={copy.desc}
                      ctaLabel={ctaLabel}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <section>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
              {t.explorePage.widgetsTitle}
            </h2>
            <p className="mb-6 max-w-2xl text-sm text-white/60 leading-relaxed">
              {t.explorePage.widgetsDesc}
            </p>

            <div className={`rounded-3xl border p-6 md:p-8 ${THEME.border} ${THEME.card}`}>
              <h3 className="font-header text-xl font-black text-white mb-2">
                {t.explorePage.codeTitle}
              </h3>
              <p className="mb-6 max-w-2xl text-sm text-white/60 leading-relaxed">
                {t.explorePage.codeDesc}
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <WidgetCard
                  href={TOP_GG_BOT}
                  name={t.explorePage.platforms.topggBot.name}
                  src={TOP_GG_WIDGET_BOT}
                  alt={t.explorePage.widgetBotAlt}
                  code={widgetBotCode}
                  copyLabel={t.explorePage.copyWidgetBot}
                  copiedLabel={t.explorePage.copied}
                  width={276}
                  height={197}
                />
                <WidgetCard
                  href={TOP_GG_SERVER}
                  name={t.explorePage.platforms.topggServer.name}
                  src={TOP_GG_WIDGET_SERVER}
                  alt={t.explorePage.widgetServerAlt}
                  code={widgetServerCode}
                  copyLabel={t.explorePage.copyWidgetServer}
                  copiedLabel={t.explorePage.copied}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <CopyWithButton
                  value={BOT_ID}
                  label={t.explorePage.botIdLabel}
                  copiedLabel={t.explorePage.copied}
                  size="sm"
                  className={`rounded-full border px-4 py-2 ${THEME.border} bg-black/30`}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-white/70">
                    <Icon name="copy" size={13} className={THEME.accent} />
                    {t.explorePage.botIdLabel}:{' '}
                    <code className={`tabular-nums ${THEME.accent}`}>{BOT_ID}</code>
                  </span>
                </CopyWithButton>
                <span className="text-xs text-white/40">{t.explorePage.botIdHint}</span>
              </div>
            </div>
          </section>
        </div>

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
