'use client';

import Link from 'next/link';
import {
  Icon,
  InfoHero,
  InfoCardGrid,
  InfoCtaRow,
  type InfoCardItem,
  type InfoTheme,
} from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import Reveal from '@/components/home/Reveal';
import QuickDocks from '@/components/molecules/QuickDocks';

export interface ComingSoonCopy {
  title: string;
  kicker: string;
  subtitle: string;
  badge: string;
  statusTitle: string;
  statusBody: string;
  items: { title: string; body: string }[];
  ctaDiscord: string;
  ctaHome: string;
}

interface ComingSoonInviteProps {
  icon: string;
  theme: InfoTheme;
  copy: ComingSoonCopy;
}

/**
 * Página de invitación "próximamente" para canales que todavía no tienen
 * integración oficial. Discord sigue siendo el destino principal.
 */
export default function ComingSoonInvite({ icon, theme, copy }: ComingSoonInviteProps) {
  const items: InfoCardItem[] = copy.items.map((item, index) => ({
    icon: ['terminal', 'group', 'clock'][index] ?? 'check',
    title: item.title,
    body: item.body,
  }));

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon={icon}
            iconStyle="brand"
            title={copy.title}
            subtitle={copy.subtitle}
            kicker={copy.kicker}
            theme={theme}
          />
        </PageReveal>

        <Reveal className="relative -mt-6 mb-14">
          <div className={`relative overflow-hidden rounded-[3rem] border p-8 sm:p-12 ${theme.border} ${theme.card}`}>
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className={`absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] ${theme.accentBg}`} />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] ${theme.accentBorder} ${theme.accentBg} ${theme.accent}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${theme.accentBg}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${theme.accent}`} style={{ backgroundColor: 'currentColor' }} />
                </span>
                {copy.badge}
              </span>
              <span className={`mt-7 inline-flex h-20 w-20 items-center justify-center rounded-3xl ${theme.accentBg} ${theme.accent}`}>
                <Icon name={icon} style="brand" size={42} />
              </span>
              <h2 className="mt-6 text-2xl sm:text-3xl font-header font-black text-ink">{copy.statusTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{copy.statusBody}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/invite"
                  className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${theme.accentBorder} ${theme.accentBg} ${theme.accent}`}
                >
                  <Icon name="discord" size={17} />
                  {copy.ctaDiscord}
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-muted transition-all hover:-translate-y-0.5 hover:text-ink"
                >
                  <Icon name="home" size={16} />
                  {copy.ctaHome}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <InfoCardGrid title={copy.statusTitle} items={items} theme={theme} columns={3} />
        </Reveal>

        <InfoCtaRow
          theme={theme}
          actions={[
            { label: copy.ctaDiscord, href: '/invite', icon: 'discord' },
            { label: copy.ctaHome, href: '/', icon: 'home', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
