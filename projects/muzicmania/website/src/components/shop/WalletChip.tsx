import { formatMzP } from '@/lib/economy/format';

export function WalletChip({ points }: { points: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-300">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
      {formatMzP(points)}
    </span>
  );
}
