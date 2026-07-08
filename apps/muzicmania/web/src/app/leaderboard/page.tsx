'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { supabase } from '@/config/supabase';
import Image from 'next/image';
import Link from 'next/link';

// --- Icons ---
const I = {
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6"/></svg>,
  arrowRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m9 18 6-6-6-6"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
};

interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  highest_score: number;
  max_multiplier: number;
  accuracy: number;
  total_playtime_minutes: number;
  tracks_created: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('highest_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const pageSize = 10;

  useEffect(() => {
    fetchLeaderboard();
  }, [page, sortBy, sortDir, search]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      const cleanSearch = search.replace('@', '').replace(/\s/g, '');
      query = query.ilike('username', `%${cleanSearch}%`);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (data) {
      setEntries(data as any);
      if (count) setTotalPages(Math.ceil(count / pageSize));
    }
    setLoading(false);
  };

  const getRankColor = (index: number) => {
    const globalIndex = (page - 1) * pageSize + index;
    if (globalIndex === 0) return 'neon-yellow'; // 1st
    if (globalIndex === 1) return 'neon-blue';   // 2nd
    if (globalIndex === 2) return 'neon-orange'; // 3rd
    return 'white/40';
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 space-y-20">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-yellow flex items-center justify-center">
                   {I.trophy}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-yellow via-white to-neon-orange bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  RANKINGS
                </h1>
             </div>
             <p className="text-neon-yellow font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               La Élite de la Transmisión — Datos en Tiempo Real
             </p>
          </div>
        </motion.header>

          {/* SEARCH BAR - PREMIUM STYLE */}
          <div className="relative max-w-2xl mx-auto group">
             <div className="absolute -inset-1 bg-gradient-to-r from-neon-yellow via-neon-blue to-neon-orange rounded-[3rem] blur-xl opacity-10 group-hover:opacity-40 transition-opacity duration-500" />
             <div className="relative flex items-center bg-black/80 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] p-2 pl-8 pr-4 shadow-2xl">
                <span className="text-2xl font-header font-black text-neon-yellow mr-1">@</span>
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value.replace(/\s/g, ''))}
                  placeholder="LOCALIZAR_USUARIO..." 
                  className="flex-1 bg-transparent border-none outline-none text-white font-header font-bold text-xl uppercase tracking-widest placeholder:text-white/5"
                />
                <button onClick={fetchLeaderboard} className="w-14 h-14 bg-white/5 text-white/40 rounded-full flex items-center justify-center hover:bg-neon-yellow hover:text-black transition-all">
                  {I.search}
                </button>
             </div>
          </div>

        {/* --- FILTER DOCK (REVIEW STYLE) --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="bg-doc-dark border border-white/10 p-8 rounded-[3.5rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-yellow via-neon-blue to-neon-orange opacity-30" />
           
           <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 text-neon-yellow drop-shadow-neon-yellow">{I.trophy}</div>
                 <div className="space-y-0.5">
                    <span className="font-header font-black uppercase tracking-[0.2em] text-xl italic text-white">Filtro de Élite</span>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Sincronización por Parámetros</p>
                 </div>
              </div>

              <div className="flex gap-3 overflow-x-auto flex-nowrap pb-2 justify-center w-full max-w-full scrollbar-hide">
                 {[
                   { id: 'highest_score', label: 'SCORE', icon: I.trophy, color: 'yellow' },
                   { id: 'accuracy', label: 'PRECISIÓN', icon: I.target, color: 'blue' },
                   { id: 'max_multiplier', label: 'COMBO', icon: I.zap, color: 'pink' },
                   { id: 'total_playtime_minutes', label: 'TIEMPO', icon: I.clock, color: 'cyan' },
                 ].map(filter => (
                   <button 
                     key={filter.id}
                     onClick={() => setSortBy(filter.id)}
                     className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-header font-black text-[10px] tracking-[0.2em] transition-all uppercase shadow-lg ${sortBy === filter.id ? `bg-neon-${filter.color} text-black shadow-neon-${filter.color}/40 scale-105` : 'bg-black/40 text-white/20 border border-white/5 hover:border-white/20'}`}
                   >
                     <div className="w-4 h-4">{filter.icon}</div>
                     {filter.label}
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 group/sort"
              >
                <div className={`w-4 h-4 transition-transform duration-500 ${sortDir === 'asc' ? 'rotate-180' : ''}`}>
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></svg>
                </div>
                {sortDir === 'desc' ? 'DESCENDENTE' : 'ASCENDENTE'}
              </button>
           </div>
        </motion.section>

        {/* --- LEADERBOARD GRID --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-6">
           <div className="grid grid-cols-12 gap-4 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-5">USUARIO</div>
              <div className="col-span-2 text-right">PUNTUACIÓN</div>
              <div className="col-span-1 text-right">COMBO</div>
              <div className="col-span-1 text-right">TIEMPO</div>
              <div className="col-span-2 text-right">PRECISIÓN</div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                 {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-28 bg-doc-dark/40 border border-white/5 rounded-[2.5rem] animate-pulse" />
                    ))
                 ) : entries.map((entry, index) => {
                    const rankColor = getRankColor(index);
                    const isTop3 = (page - 1) * pageSize + index < 3;
                    
                    return (
                      <Link href={`/user/${entry.username}`} key={entry.id}>
                        <motion.div 
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`grid grid-cols-12 gap-4 p-8 items-center bg-doc-dark border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group rounded-[2.5rem] ${isTop3 ? `border-${rankColor}/40 shadow-[0_0_50px_rgba(255,255,255,0.05)]` : 'border-white/5 hover:border-white/20'}`}
                        >
                           {/* RANK */}
                           <div className={`col-span-1 text-center font-header font-black text-4xl italic tracking-tighter ${isTop3 ? `text-${rankColor} drop-shadow-${rankColor}` : 'text-white/20'}`}>
                              {((page - 1) * pageSize + index + 1).toString().padStart(2, '0')}
                           </div>

                           {/* USER */}
                           <div className="col-span-5 flex items-center gap-6">
                              <div className={`relative w-16 h-16 rounded-2xl p-1 bg-black border-2 transition-all group-hover:rotate-6 ${isTop3 ? `border-${rankColor}` : 'border-white/10'}`}>
                                 {entry.avatar_url ? (
                                    <Image src={entry.avatar_url} alt="" width={64} height={64} className="rounded-xl object-cover" />
                                 ) : (
                                    <div className={`w-full h-full rounded-xl flex items-center justify-center font-header font-black text-2xl ${isTop3 ? `text-${rankColor}` : 'text-white/20'}`}>
                                       {entry.display_name.charAt(0)}
                                    </div>
                                 )}
                              </div>
                              <div>
                                 <h4 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter group-hover:text-neon-cyan transition-colors">{entry.display_name}</h4>
                                 <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">@{entry.username}</p>
                              </div>
                           </div>

                           {/* SCORE */}
                           <div className={`col-span-2 text-right font-header font-black text-3xl italic tracking-tighter ${isTop3 ? `text-${rankColor}` : 'text-white'}`}>
                              {entry.highest_score.toLocaleString()}
                           </div>

                           {/* COMBO */}
                           <div className="col-span-1 text-right font-mono text-neon-pink font-black text-lg">
                              x{entry.max_multiplier}
                           </div>

                           {/* TIME */}
                           <div className="col-span-1 text-right font-mono text-white/40 font-bold text-xs uppercase">
                              {Math.floor(entry.total_playtime_minutes / 60)}H
                           </div>

                           {/* ACCURACY + RAINBOW BAR */}
                           <div className="col-span-2 text-right space-y-2">
                              <span className={`text-2xl font-header font-black italic tracking-tighter drop-shadow-neon-cyan ${entry.accuracy >= 99 ? 'text-white' : 'text-neon-cyan'}`}>
                                 {entry.accuracy.toFixed(1)}%
                              </span>
                              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${entry.accuracy}%` }}
                                   className={`h-full relative overflow-hidden`}
                                   style={{ 
                                      background: `linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)`,
                                      backgroundSize: '200% 100%'
                                   }}
                                 >
                                    <motion.div 
                                      animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                                      transition={{ duration: entry.accuracy > 95 ? 1 : 3, repeat: Infinity, ease: 'linear' }}
                                      className="absolute inset-0 bg-inherit"
                                    />
                                    {/* Overlay to clear it as precision increases */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" style={{ opacity: Math.max(0, 1 - entry.accuracy / 100) }} />
                                 </motion.div>
                              </div>
                           </div>
                        </motion.div>
                      </Link>
                    );
                 })}
              </AnimatePresence>
           </div>
        </motion.section>

        {/* --- PAGINATION --- */}
        <div className="flex justify-center items-center gap-6 pt-12">
           <button 
             onClick={() => setPage(p => Math.max(1, p - 1))}
             disabled={page === 1}
             className="w-16 h-16 rounded-[2rem] bg-doc-dark border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
           >
              <div className="w-8 h-8">{I.arrowLeft}</div>
           </button>
           
           <div className="flex gap-3 bg-doc-dark/50 p-3 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                 const pNum = i + 1;
                 return (
                    <button 
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-14 h-14 rounded-2xl font-header font-black text-xl transition-all ${page === pNum ? 'bg-white text-black shadow-2xl scale-110' : 'bg-black/40 text-white/20 hover:text-white'}`}
                    >
                       {pNum.toString().padStart(2, '0')}
                    </button>
                 );
              })}
              {totalPages > 5 && <span className="px-4 flex items-center text-white/10 font-black">...</span>}
              {totalPages > 5 && (
                 <button 
                    onClick={() => setPage(totalPages)}
                    className={`w-14 h-14 rounded-2xl font-header font-black text-xl transition-all ${page === totalPages ? 'bg-white text-black' : 'bg-black/40 text-white/20'}`}
                 >
                    {totalPages.toString().padStart(2, '0')}
                 </button>
              )}
           </div>

           <button 
             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
             disabled={page === totalPages}
             className="w-16 h-16 rounded-[2rem] bg-doc-dark border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
           >
              <div className="w-8 h-8">{I.arrowRight}</div>
           </button>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
