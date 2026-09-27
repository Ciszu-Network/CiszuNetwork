'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon, useChangelogLikes, usePublishedChangelogs } from '@ciszu/ui';
import { CHANGELOG_DATA as CHANGELOG_STATIC } from '@/data/changelog';
import { TAG_CONFIG } from '@/config/changelogIcons';
import { mergeChangelogSources } from '@ciszunetwork/utils/changelog';
import { useAppStore } from '@/store';
import type { Dict } from '@/lib/i18n';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import Reveal from './Reveal';
import { track } from './track';

interface ChangelogStripProps {
  dict: Dict;
}

/**
 * Últimas entradas REALES del registro de cambios: las del código
 * (`CHANGELOG_DATA`) fusionadas con las publicadas en vivo desde el devcon.
 * Los likes funcionan igual que en `/changelog` (por dispositivo + cuenta).
 */
export default function ChangelogStrip({ dict }: ChangelogStripProps) {
  const { user } = useAppStore();
  const likes = useChangelogLikes();
  const published = usePublishedChangelogs('ciszubot');
  const [authAction, setAuthAction] = useState(false);

  const entries = useMemo(() => {
    const merged = mergeChangelogSources(published.entries, CHANGELOG_STATIC);
    return [...merged]
      .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
      .slice(0, 3);
  }, [published.entries]);

  const handleLike = (id: string) => {
    if (!user) {
      setAuthAction(true);
      return;
    }
    likes.toggleLike(id);
    track('changelog_like', { id });
  };

  return (
    <section id="changelog" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <p className="text-neon-purple font-semibold uppercase tracking-[0.25em] text-xs mb-3">
            {dict.changelogPage.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">
            {dict.changelogPage.title}
          </h2>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {entries.map((item, i) => (
            <Reveal key={item.id} delay={i * 90}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-purple/60">
                {i === 0 && (
                  <span className="absolute top-4 right-4 rounded-full bg-neon-pink px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(255,51,204,0.4)]">
                    NUEVO
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10 text-neon-purple">
                    {TAG_CONFIG[item.types[0]]?.icon ?? <Icon name="history" size={18} />}
                  </span>
                  <div>
                    <div className="font-header text-sm font-black uppercase italic tracking-wide text-ink">
                      {item.version}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                      {item.date}
                    </div>
                  </div>
                </div>

                <h3 className="font-header text-lg font-black text-ink mb-2 group-hover:text-neon-purple transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">{item.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {item.types.slice(0, 3).map((type) => {
                    const config = TAG_CONFIG[type];
                    if (!config) return null;
                    return (
                      <span
                        key={type}
                        className={`rounded-full border border-border bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${config.color}`}
                      >
                        {config.label}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Link
                    href={`/changelog/${item.id}`}
                    onClick={() => track('changelog_open', { id: item.id, from: 'home' })}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neon-blue hover:gap-3 transition-all"
                  >
                    DETALLES
                    <Icon name="chevronRight" size={14} />
                  </Link>
                  <button
                    onClick={() => handleLike(item.id)}
                    aria-pressed={likes.isLiked(item.id)}
                    aria-label={`${dict.nav.changelog} ${item.version}`}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-black transition-all hover:scale-105 ${
                      likes.isLiked(item.id)
                        ? 'border-neon-pink/60 bg-neon-pink/10 text-neon-pink'
                        : 'border-border bg-surface text-muted hover:text-neon-pink'
                    }`}
                  >
                    <Icon name="heart" size={13} />
                    <span className="tabular-nums">{likes.getLikes(item.id, item.likes)}</span>
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/changelog"
            onClick={() => track('changelog_page_click', { from: 'home' })}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold btn-ghost"
          >
            {dict.nav.changelog}
            <Icon name="chevronRight" size={16} />
          </Link>
        </div>
      </div>

      <AuthWarningModal isOpen={authAction} onClose={() => setAuthAction(false)} />
    </section>
  );
}
