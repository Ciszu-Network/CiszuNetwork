export interface AccountRank {
  key: string;
  name: string;
  minLevel: number;
  color: string;
  border: string;
  glow: string;
}

export const ACCOUNT_RANKS: AccountRank[] = [
  { key: 'wood', name: 'Wood', minLevel: 1, color: 'text-amber-200', border: 'border-amber-700/40', glow: 'shadow-amber-700/10' },
  { key: 'stone', name: 'Stone', minLevel: 5, color: 'text-stone-200', border: 'border-stone-400/40', glow: 'shadow-stone-400/10' },
  { key: 'iron', name: 'Iron', minLevel: 10, color: 'text-slate-200', border: 'border-slate-400/40', glow: 'shadow-slate-400/10' },
  { key: 'gold', name: 'Gold', minLevel: 20, color: 'text-yellow-300', border: 'border-yellow-400/40', glow: 'shadow-yellow-400/10' },
  { key: 'platinum', name: 'Platinum', minLevel: 30, color: 'text-cyan-200', border: 'border-cyan-300/40', glow: 'shadow-cyan-300/10' },
  { key: 'diamond', name: 'Diamond', minLevel: 40, color: 'text-sky-300', border: 'border-sky-400/40', glow: 'shadow-sky-400/10' },
  { key: 'obsidian', name: 'Obsidian', minLevel: 50, color: 'text-fuchsia-300', border: 'border-fuchsia-400/40', glow: 'shadow-fuchsia-400/10' },
  { key: 'legend', name: 'Legend', minLevel: 75, color: 'text-amber-100', border: 'border-amber-300/50', glow: 'shadow-amber-300/20' },
];

export function rankForLevel(level: number | null | undefined): AccountRank {
  const value = Math.max(1, Number(level ?? 1));
  let current = ACCOUNT_RANKS[0];
  for (const rank of ACCOUNT_RANKS) {
    if (value >= rank.minLevel) current = rank;
  }
  return current;
}

export function nextRankForLevel(level: number | null | undefined): AccountRank | null {
  const value = Math.max(1, Number(level ?? 1));
  return ACCOUNT_RANKS.find((rank) => rank.minLevel > value) ?? null;
}

export function levelProgress(level: number | null | undefined, xp: number | null | undefined) {
  const current = Math.max(1, Number(level ?? 1));
  const next = nextRankForLevel(current);
  const nextLevel = next?.minLevel ?? current;
  const span = Math.max(1, nextLevel - current);
  const progress = Number(xp ?? 0) % 100;
  return {
    percent: next ? Math.min(100, Math.max(0, progress)) : 100,
    next,
    span,
  };
}
