'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon, Modal, useToast } from '@ciszu/ui';
import { useT } from '@/hooks/useT';
import { supabase } from '@/config/supabase';

export interface BadgeItem {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  kind: string;
  level: number;
  maxLevel: number;
  progress: number;
  nextThreshold: number | null;
  obtainedAt: string | null;
  title: string;
  levelDescription: string;
  style: string;
  owners: number;
  total: number;
  percent: number;
  rarity: { key: string; label: string };
  levels: Array<Record<string, unknown>>;
}

const RARITY: Record<string, string> = {
  mythic: 'border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300',
  legendary: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
  epic: 'border-violet-400/50 bg-violet-400/10 text-violet-300',
  rare: 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300',
  uncommon: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300',
  common: 'border-white/20 bg-white/5 text-white/60',
};

const STYLES: Record<string, string> = {
  cyan: 'from-cyan-400/30 to-blue-500/10 text-cyan-300',
  blue: 'from-blue-400/30 to-indigo-500/10 text-blue-300',
  purple: 'from-violet-400/30 to-fuchsia-500/10 text-violet-300',
  pink: 'from-pink-400/30 to-rose-500/10 text-pink-300',
  gold: 'from-amber-400/30 to-orange-500/10 text-amber-300',
  green: 'from-emerald-400/30 to-teal-500/10 text-emerald-300',
  legendary: 'from-fuchsia-400/30 via-amber-400/20 to-cyan-400/20 text-amber-200',
};

function BadgeEmblem({ badge, size = 'md' }: { badge: BadgeItem; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 30 : 22;
  return (
    <span className={`relative flex ${dims} shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br ${STYLES[badge.style] ?? STYLES.cyan}`}>
      <Icon name={badge.icon || 'medal'} size={iconSize} />
      {badge.level > 1 && (
        <span className="absolute -right-1 -top-1 rounded-full border border-black bg-black px-1.5 py-0.5 text-[8px] font-black text-white">
          {badge.level}
        </span>
      )}
    </span>
  );
}

export default function BadgesSection({ userId, isOwnProfile }: { userId: string; isOwnProfile: boolean }) {
  const t = useT().pages.profile.badges;
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [sort, setSort] = useState<'relevance' | 'rarity' | 'level' | 'newest' | 'oldest'>('relevance');
  const [selected, setSelected] = useState<BadgeItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/badges/${userId}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { badges?: BadgeItem[]; favorites?: string[] } | null) => {
        if (!alive) return;
        setBadges(Array.isArray(data?.badges) ? data.badges.filter((badge) => badge.level > 0) : []);
        setFavorites(Array.isArray(data?.favorites) ? data.favorites : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const categories = useMemo(() => Array.from(new Set(badges.map((badge) => badge.category))), [badges]);
  const favoritesList = favorites
    .map((id) => badges.find((badge) => badge.id === id))
    .filter((badge): badge is BadgeItem => Boolean(badge));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = badges.filter((badge) => {
      const matchesQuery = !q || `${badge.name} ${badge.title} ${badge.description} ${badge.category}`.toLowerCase().includes(q);
      const matchesCategory = category === 'all' || badge.category === category;
      const matchesRarity = rarity === 'all' || badge.rarity.key === rarity;
      return matchesQuery && matchesCategory && matchesRarity;
    });
    return list.sort((a, b) => {
      if (sort === 'rarity') return a.percent - b.percent || b.level - a.level;
      if (sort === 'level') return b.level - a.level || a.percent - b.percent;
      if (sort === 'newest') return Date.parse(b.obtainedAt ?? '') - Date.parse(a.obtainedAt ?? '');
      if (sort === 'oldest') return Date.parse(a.obtainedAt ?? '') - Date.parse(b.obtainedAt ?? '');
      return b.level / Math.max(1, b.maxLevel) - a.level / Math.max(1, a.maxLevel) || a.percent - b.percent;
    });
  }, [badges, query, category, rarity, sort]);

  const toggleFavorite = async (badge: BadgeItem) => {
    if (!isOwnProfile || saving) return;
    const active = favorites.includes(badge.id);
    if (!active && favorites.length >= 3) {
      toast(t.favoriteLimit, 'error');
      return;
    }
    const next = active ? favorites.filter((id) => id !== badge.id) : [...favorites, badge.id];
    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`/api/badges/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session.session?.access_token ? { Authorization: `Bearer ${session.session.access_token}` } : {}),
        },
        body: JSON.stringify({ badge_ids: next }),
      });
      if (!res.ok) throw new Error('save');
      setFavorites(next);
    } catch {
      toast('No se pudo actualizar favoritos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-6 text-center text-xs font-bold uppercase tracking-widest text-white/35">{t.loading}</p>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 font-header text-3xl font-black uppercase italic tracking-tighter text-neon-blue">
            <Icon name="medal" size={30} /> {t.title}
          </h2>
          <p className="mt-1 text-xs text-white/45">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => {
          const badge = favoritesList[index];
          return (
            <div key={index} className={`flex min-h-24 items-center gap-3 rounded-3xl border p-4 ${badge ? RARITY[badge.rarity.key] ?? RARITY.common : 'border-dashed border-white/10 bg-white/[0.02]'}`}>
              {badge ? <BadgeEmblem badge={badge} /> : <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/20"><Icon name="star" size={20} /></span>}
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{t.favorites} #{index + 1}</p>
                <p className="truncate font-header text-sm font-black text-white">{badge?.title ?? t.empty}</p>
                {badge && <p className="text-[10px] opacity-70">{badge.rarity.label} · {badge.owners}/{badge.total}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Icon name="search" size={13} className="text-white/35" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-bold text-white outline-none">
          <option value="all">{t.category}: {t.all}</option>
          {categories.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </select>
        <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-bold text-white outline-none">
          <option value="all">{t.rarity}: {t.all}</option>
          {Object.keys(RARITY).map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-bold text-white outline-none">
          <option value="relevance">{t.sort}: {t.relevance}</option>
          <option value="rarity">{t.rarity}</option>
          <option value="level">{t.level}</option>
          <option value="newest">{t.newest}</option>
          <option value="oldest">{t.oldest}</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/40">{badges.length === 0 ? t.noBadges : t.noResults}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {visible.map((badge) => {
            const active = favorites.includes(badge.id);
            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => setSelected(badge)}
                title={`${badge.owners} ${t.owners} · ${badge.percent.toFixed(2)}%`}
                className={`relative rounded-3xl border p-5 text-left transition hover:-translate-y-1 ${RARITY[badge.rarity.key] ?? RARITY.common}`}
              >
                {isOwnProfile && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => { event.stopPropagation(); void toggleFavorite(badge); }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.stopPropagation(); void toggleFavorite(badge); } }}
                    className={`absolute right-3 top-3 rounded-full border p-1.5 ${active ? 'border-amber-300/60 bg-amber-400/20 text-amber-200' : 'border-white/15 text-white/40 hover:text-white'}`}
                    title={active ? t.removeFavorite : t.addFavorite}
                  >
                    <Icon name="star" size={12} />
                  </span>
                )}
                <BadgeEmblem badge={badge} />
                <p className="mt-4 line-clamp-2 font-header text-sm font-black uppercase leading-tight text-white">{badge.title}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-widest opacity-60">{badge.rarity.label} · {t.level} {badge.level}/{badge.maxLevel}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
                  <div className="h-full rounded-full bg-current" style={{ width: `${Math.min(100, (badge.progress / Math.max(1, badge.nextThreshold ?? badge.progress)) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[9px] opacity-60">{badge.progress}{badge.nextThreshold !== null ? ` / ${badge.nextThreshold}` : ` · ${t.max}`}</p>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} title={selected?.title ?? t.details}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <BadgeEmblem badge={selected} size="lg" />
              <div>
                <p className="font-header text-xl font-black uppercase text-white">{selected.title}</p>
                <p className="text-xs text-white/50">{selected.description}</p>
                <p className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${RARITY[selected.rarity.key] ?? RARITY.common}`}>{selected.rarity.label}</p>
              </div>
            </div>
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">{selected.levelDescription}</p>
            <div>
              <div className="mb-1 flex justify-between text-[10px] font-bold text-white/50"><span>{t.progress}</span><span>{selected.progress}{selected.nextThreshold !== null ? ` / ${selected.nextThreshold}` : ` · ${t.max}`}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink" style={{ width: `${Math.min(100, (selected.progress / Math.max(1, selected.nextThreshold ?? selected.progress)) * 100)}%` }} /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/55">
              <p className="font-bold text-white">{selected.owners} / {selected.total} {t.owners}</p>
              <p className="mt-1 text-[10px]">{selected.percent.toFixed(2)}% · {selected.kind === 'exclusive' ? t.exclusive : t.auto}</p>
            </div>
            {isOwnProfile && (
              <button type="button" onClick={() => void toggleFavorite(selected)} className={`w-full rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-widest ${favorites.includes(selected.id) ? 'border-amber-300/40 bg-amber-400/10 text-amber-200' : 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'}`}>
                {favorites.includes(selected.id) ? t.removeFavorite : t.addFavorite}
              </button>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
