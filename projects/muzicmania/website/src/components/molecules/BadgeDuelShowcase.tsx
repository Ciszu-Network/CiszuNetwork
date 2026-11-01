'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@ciszu/ui';
import { useT } from '@/hooks/useT';
import { supabase } from '@/config/supabase';

export interface DuelBadge {
  id: string;
  name: string;
  title: string;
  style: string;
  level: number;
  maxLevel: number;
  owners: number;
  total: number;
  percent: number;
  rarity: { key: string; label: string };
}

type BadgesPayload = { badges?: DuelBadge[]; favorites?: string[] };

const RARITY: Record<string, string> = {
  mythic: 'border-fuchsia-400/45 bg-fuchsia-500/10 text-fuchsia-200',
  legendary: 'border-amber-400/45 bg-amber-500/10 text-amber-200',
  epic: 'border-violet-400/45 bg-violet-500/10 text-violet-200',
  rare: 'border-cyan-400/45 bg-cyan-500/10 text-cyan-200',
  uncommon: 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200',
  common: 'border-white/15 bg-white/[0.04] text-white/70',
};

const EMBLEM: Record<string, string> = {
  cyan: 'from-cyan-400/40 to-blue-600/10 text-cyan-200',
  blue: 'from-blue-400/40 to-indigo-600/10 text-blue-200',
  purple: 'from-violet-400/40 to-fuchsia-600/10 text-violet-200',
  pink: 'from-pink-400/40 to-rose-600/10 text-pink-200',
  gold: 'from-amber-400/40 to-orange-600/10 text-amber-200',
  green: 'from-emerald-400/40 to-teal-600/10 text-emerald-200',
  legendary: 'from-fuchsia-400/35 via-amber-400/25 to-cyan-400/15 text-amber-100',
};

function chooseBadges(payload: BadgesPayload): DuelBadge[] {
  const badges = (payload.badges ?? []).filter((badge) => badge.level > 0);
  const byId = new Map(badges.map((badge) => [badge.id, badge]));
  return (payload.favorites ?? [])
    .map((id) => byId.get(id))
    .filter((badge): badge is DuelBadge => Boolean(badge))
    .slice(0, 3);
}

async function fetchBadges(userId: string): Promise<DuelBadge[]> {
  const response = await fetch(`/api/badges/${userId}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('badges');
  return chooseBadges((await response.json()) as BadgesPayload);
}

function BadgeSlot({ badge, empty }: { badge?: DuelBadge; empty: string }) {
  if (!badge) {
    return (
      <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-center">
        <Icon name="star" size={18} className="text-white/15" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white/25">{empty}</span>
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-3 text-center ${RARITY[badge.rarity.key] ?? RARITY.common}`}>
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br ${EMBLEM[badge.style] ?? EMBLEM.cyan}`}>
        <Icon name="medal" size={22} />
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 font-header text-[10px] font-black uppercase leading-tight text-white">{badge.title}</p>
        <p className="mt-1 text-[7px] font-black uppercase tracking-widest opacity-65">
          {badge.rarity.label} · LVL {badge.level}/{badge.maxLevel}
        </p>
      </div>
    </div>
  );
}

function PlayerCard({
  label,
  badges,
  loading,
  empty,
  accent,
}: {
  label: string;
  badges: DuelBadge[];
  loading: boolean;
  empty: string;
  accent: 'cyan' | 'pink';
}) {
  const ring = accent === 'cyan' ? 'border-neon-cyan/25 shadow-[0_0_45px_rgba(0,240,255,0.08)]' : 'border-neon-pink/25 shadow-[0_0_45px_rgba(255,51,204,0.08)]';
  const text = accent === 'cyan' ? 'text-neon-cyan' : 'text-neon-pink';

  return (
    <div className={`rounded-[1.75rem] border bg-black/45 p-4 backdrop-blur-xl ${ring}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${text}`}>{label}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-white/40">
          {loading ? '···' : `${badges.length}/3`}
        </span>
      </div>
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="min-h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      ) : badges.length === 0 ? (
        <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <Icon name="star" size={18} className="text-white/15" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{empty}</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => <BadgeSlot key={index} badge={badges[index]} empty="" />)}
        </div>
      )}
    </div>
  );
}

export default function BadgeDuelShowcase({ userId }: { userId: string | null }) {
  const t = useT().pages.play;
  const [ownBadges, setOwnBadges] = useState<DuelBadge[]>([]);
  const [ownLoading, setOwnLoading] = useState(Boolean(userId));
  const [query, setQuery] = useState('');
  const [rivalName, setRivalName] = useState('');
  const [rivalBadges, setRivalBadges] = useState<DuelBadge[]>([]);
  const [rivalLoading, setRivalLoading] = useState(false);
  const [rivalError, setRivalError] = useState('');

  useEffect(() => {
    if (!userId) {
      setOwnBadges([]);
      setOwnLoading(false);
      return;
    }
    let alive = true;
    setOwnLoading(true);
    fetchBadges(userId)
      .then((badges) => {
        if (alive) setOwnBadges(badges);
      })
      .catch(() => {
        if (alive) setOwnBadges([]);
      })
      .finally(() => {
        if (alive) setOwnLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const findRival = async () => {
    const raw = query.trim().replace(/^@/, '');
    if (!raw || rivalLoading) return;
    setRivalLoading(true);
    setRivalError('');
    setRivalName('');
    setRivalBadges([]);
    try {
      let profile: { id: string; username?: string | null; display_name?: string | null } | null = null;
      if (/^[0-9a-f-]{36}$/i.test(raw)) {
        const { data } = await supabase.from('profiles').select('id, username, display_name').eq('id', raw).maybeSingle();
        profile = data;
      } else {
        const byUsername = await supabase.from('profiles').select('id, username, display_name').eq('username', raw).maybeSingle();
        profile = byUsername.data;
        if (!profile) {
          const byDisplayName = await supabase.from('profiles').select('id, username, display_name').eq('display_name', raw).maybeSingle();
          profile = byDisplayName.data;
        }
      }
      if (!profile) {
        setRivalError(t.duelNotFound);
        return;
      }
      setRivalName(profile.display_name || profile.username || raw);
      setRivalBadges(await fetchBadges(profile.id));
    } catch {
      setRivalError(t.duelNotFound);
    } finally {
      setRivalLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-pink/30 bg-neon-pink/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.25em] text-neon-pink">
          <Icon name="radio" size={11} /> {t.soonMultiplayer}
        </span>
        <h2 className="mt-3 font-header text-3xl font-black uppercase italic tracking-tighter text-white sm:text-4xl">
          {t.duelTitle}
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{t.duelSubtitle}</p>
      </div>

      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <PlayerCard
          label={t.duelYou}
          badges={ownBadges}
          loading={ownLoading}
          empty={userId ? t.duelNoFavorites : t.duelLogin}
          accent="cyan"
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/60 font-header text-lg font-black italic text-white shadow-[0_0_30px_rgba(255,51,204,0.18)]">
          VS
        </div>
        <PlayerCard
          label={rivalName ? `${t.duelRival} · ${rivalName}` : t.duelRival}
          badges={rivalBadges}
          loading={rivalLoading}
          empty={rivalError || t.duelEmpty}
          accent="pink"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2.5">
            <Icon name="search" size={13} className="shrink-0 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void findRival();
              }}
              placeholder={t.duelSearchPlaceholder}
              maxLength={120}
              className="min-w-0 flex-1 bg-transparent text-[10px] font-bold text-white outline-none placeholder:text-white/25"
            />
          </label>
          <button
            type="button"
            onClick={() => void findRival()}
            disabled={rivalLoading || !query.trim()}
            className="rounded-xl border border-neon-pink/40 bg-neon-pink/10 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-neon-pink transition hover:bg-neon-pink/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rivalLoading ? '···' : t.duelSearch}
          </button>
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">{t.duelSearchHint}</p>
        <button
          type="button"
          disabled
          className="mt-1 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-[9px] font-black uppercase tracking-widest text-white/30"
        >
          {t.duelStartSoon}
        </button>
      </div>
    </div>
  );
}
