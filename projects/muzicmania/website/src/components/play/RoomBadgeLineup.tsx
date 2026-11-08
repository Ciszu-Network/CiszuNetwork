'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@ciszu/ui';

interface PlayerLike {
  user_id: string;
  profile?: { username?: string | null; display_name?: string | null } | null;
}

interface Badge {
  id: string;
  title: string;
  level: number;
  maxLevel: number;
  style: string;
  rarity: { key: string; label: string };
  percent: number;
}

interface Payload {
  badges?: Badge[];
  favorites?: string[];
}

const RARITY: Record<string, string> = {
  mythic: 'border-fuchsia-400/45 bg-fuchsia-500/10 text-fuchsia-200',
  legendary: 'border-amber-400/45 bg-amber-500/10 text-amber-200',
  epic: 'border-violet-400/45 bg-violet-500/10 text-violet-200',
  rare: 'border-cyan-400/45 bg-cyan-500/10 text-cyan-200',
  uncommon: 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200',
  common: 'border-white/15 bg-white/[0.04] text-white/70',
};

const STYLE: Record<string, string> = {
  cyan: 'from-cyan-400/30 to-blue-500/10 text-cyan-200',
  blue: 'from-blue-400/30 to-indigo-500/10 text-blue-200',
  purple: 'from-violet-400/30 to-fuchsia-500/10 text-violet-200',
  pink: 'from-pink-400/30 to-rose-500/10 text-pink-200',
  gold: 'from-amber-400/30 to-orange-500/10 text-amber-200',
  green: 'from-emerald-400/30 to-teal-500/10 text-emerald-200',
  legendary: 'from-fuchsia-400/30 via-amber-400/20 to-cyan-400/15 text-amber-100',
};

async function fetchFavorites(userId: string): Promise<Badge[]> {
  const response = await fetch(`/api/badges/${userId}`, { cache: 'no-store' });
  if (!response.ok) return [];
  const data = (await response.json()) as Payload;
  const byId = new Map((data.badges ?? []).filter((badge) => badge.level > 0).map((badge) => [badge.id, badge]));
  return (data.favorites ?? []).map((id) => byId.get(id)).filter((badge): badge is Badge => Boolean(badge)).slice(0, 3);
}

export default function RoomBadgeLineup({ players, currentUserId }: { players: PlayerLike[]; currentUserId: string | null }) {
  const [badges, setBadges] = useState<Record<string, Badge[]>>({});
  const [loading, setLoading] = useState(true);
  const playerIds = players.map((player) => player.user_id).join('|');
  const ids = useMemo(() => playerIds ? playerIds.split('|') : [], [playerIds]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all(ids.slice(0, 6).map(async (id) => [id, await fetchFavorites(id)] as const))
      .then((entries) => { if (alive) setBadges(Object.fromEntries(entries)); })
      .catch(() => { if (alive) setBadges({}); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [ids]);

  return (
    <div className="rounded-2xl border border-neon-pink/20 bg-neon-pink/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[8px] font-black uppercase tracking-widest text-neon-pink">Badges favoritos</p>
        <p className="text-[7px] font-black uppercase tracking-widest text-white/30">Top 3 de cada jugador</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {players.map((player) => {
          const name = player.profile?.display_name || player.profile?.username || player.user_id.slice(0, 8);
          const list = badges[player.user_id] ?? [];
          return (
            <div key={player.user_id} className="rounded-xl border border-white/10 bg-black/40 p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-[9px] font-black uppercase tracking-widest text-white/70">{name}{player.user_id === currentUserId ? ' · TÚ' : ''}</p>
                <span className="text-[7px] font-black uppercase tracking-widest text-white/25">{loading ? '···' : `${list.length}/3`}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((index) => {
                  const badge = list[index];
                  if (!badge) return <div key={index} className="flex min-h-16 items-center justify-center rounded-lg border border-dashed border-white/10 text-[7px] uppercase tracking-widest text-white/20">Vacío</div>;
                  return (
                    <div key={badge.id} title={`${badge.rarity.label} · ${badge.percent.toFixed(2)}%`} className={`min-h-16 rounded-lg border p-1.5 text-center ${RARITY[badge.rarity.key] ?? RARITY.common}`}>
                      <span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br ${STYLE[badge.style] ?? STYLE.cyan}`}><Icon name="medal" size={13} /></span>
                      <p className="mt-1 line-clamp-2 text-[6px] font-black uppercase leading-tight text-white">{badge.title}</p>
                      <p className="text-[6px] uppercase tracking-widest opacity-60">LVL {badge.level}/{badge.maxLevel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
