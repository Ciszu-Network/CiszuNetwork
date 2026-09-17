'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  balance: number;
  bank: number;
  total: number;
}

const LIFEbuoyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="22" />
    <line x1="2" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="22" y2="12" />
  </svg>
);

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.section>
);

export default function LeaderboardPage() {
  usePageTitle('LEADERBOARD');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy, sortDir, search });
      const res = await fetch(`/api/leaderboard?${params}`, { cache: 'no-store' });
      const { data, count } = await res.json();
      setEntries(data);
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [page, sortBy, sortDir, search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const rankColor = (index: number) => {
    if (index === 0) return 'text-amber-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-400';
    return 'text-white/20';
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* --- HERO --- */}
        <Section className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
              <LIFEbuoyIcon />
            </div>
            <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent">
              LEADERBOARD
            </h1>
          </div>
          <p className="text-muted max-w-xl mx-auto text-sm uppercase tracking-widest">
            Top usuarios por economía de CiszuBot
          </p>
        </Section>

        {/* --- SEARCH --- */}
        <Section className="mb-10">
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple rounded-[3rem] blur-xl opacity-10 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-black/80 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] p-2 pl-8 pr-4">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="LOCALIZAR_USUARIO..."
                className="flex-1 bg-transparent text-white font-header font-bold text-xl uppercase outline-none"
              />
              <button onClick={fetchLeaderboard} className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </div>
        </Section>

        {/* --- FILTERS --- */}
        <Section className="mb-10">
          <div className="bg-surface border border-white/10 p-4 rounded-[2.5rem] flex flex-wrap justify-center gap-3">
            {[
              { key: 'total', label: 'TOTAL' },
              { key: 'balance', label: 'BOLSILLO' },
              { key: 'bank', label: 'BANCO' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => handleSort(f.key)}
                className={`px-6 py-3 rounded-2xl border transition-all font-header font-black text-xs uppercase tracking-widest ${
                  sortBy === f.key
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-black border-transparent shadow-lg'
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        {/* --- LEADERBOARD --- */}
        <Section>
          {loading ? (
            <div className="text-center py-20 text-muted">Cargando ranking...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 text-muted">Sin resultados</div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase tracking-[0.5em] text-muted mb-4">
                <div className="col-span-1 text-center">RANK</div>
                <div className="col-span-5">USUARIO</div>
                <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('balance')}>BOLSILLO</div>
                <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('bank')}>BANCO</div>
                <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('total')}>TOTAL</div>
              </div>

              {entries.map((entry, index) => {
                const globalIndex = (page - 1) * pageSize + index;
                const isTop3 = globalIndex < 3;
                const rankDisplay = (globalIndex + 1).toString().padStart(2, '0');

                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 gap-4 p-6 items-center rounded-[2rem] border transition-all ${
                      isTop3
                        ? 'bg-gradient-to-r from-white/5 to-transparent border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.03)]'
                        : 'bg-surface border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Rank */}
                    <div className={`col-span-1 text-center font-header font-black text-3xl italic ${rankColor(globalIndex)}`}>
                      {rankDisplay}
                    </div>

                    {/* User */}
                    <div className="col-span-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl p-1 bg-black border-2 ${isTop3 ? `border-${rankColor(globalIndex).replace('text-', '')}` : 'border-white/10'}`}>
                        {entry.avatarUrl ? (
                          <Image src={entry.avatarUrl} alt={entry.displayName || entry.username} width={48} height={48} className="rounded-lg object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                            <LIFEbuoyIcon />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-lg font-header font-black text-white uppercase italic truncate">
                          {entry.displayName || entry.username}
                        </h4>
                        <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] truncate">
                          @{entry.username}
                        </p>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="col-span-2 text-right font-header font-black text-white">
                      {entry.balance.toLocaleString()}
                    </div>

                    {/* Bank */}
                    <div className="col-span-2 text-right font-header font-black text-white">
                      {entry.bank.toLocaleString()}
                    </div>

                    {/* Total */}
                    <div className={`col-span-2 text-right font-header font-black text-xl italic ${isTop3 ? rankColor(globalIndex) : 'text-white'}`}>
                      {entry.total.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Section>

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <Section className="flex justify-center items-center gap-6 pt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="flex gap-3 bg-surface/50 p-3 rounded-[2.5rem] border border-white/5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-14 h-14 rounded-2xl font-header font-black text-xl transition-all ${
                      page === pNum
                        ? 'bg-white text-black shadow-2xl scale-110'
                        : 'bg-black/40 text-white/20 hover:text-white'
                    }`}
                  >
                    {pNum.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </Section>
        )}

        <QuickDocks />
      </div>
    </div>
  );
}
