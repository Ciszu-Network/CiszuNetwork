'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Button } from '@/components/atoms/Button';
import { supabase } from '@/config/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons ---
const I = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V14"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  server: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  friend: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>,
  block: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  report: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
};

export default function StatsPage() {
  usePageTitle('STATS');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [session] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '2026-04-01', end: '2026-04-26' });
  const [activeTab, setActiveTab] = useState('global');
  const [activeMetric, setActiveMetric] = useState('Usuarios');
  const [serverHealth, setServerHealth] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [globalCounts, setGlobalCounts] = useState({ users: 0, tracks: 0, scores: 0, changes: 0 });

  useEffect(() => {
    fetchGlobalCounts();
    fetchServerHealth();
  }, [dateRange]);

  const fetchGlobalCounts = async () => {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: scores } = await supabase.from('scores').select('*', { count: 'exact', head: true });
    
    setGlobalCounts({
      users: users || 0,
      tracks: 4, 
      scores: scores || 0,
      changes: 3 
    });

    const { data: trendData } = await supabase
      .from('scores')
      .select('created_at')
      .order('created_at', { ascending: true });
    
    if (trendData) {
      const mockTrend = Array.from({ length: 12 }, (_, i) => {
        return trendData.filter((s: any) => new Date(s.created_at).getMonth() === i).length;
      });
      setChartData(mockTrend);
    } else {
      setChartData(new Array(12).fill(0));
    }
  };

  const fetchServerHealth = async () => {
    setServerHealth([
      { region: 'Latin America', status: 'online', load_percent: 12, latency_ms: 32, id: 'srv-latam-node-01' }
    ]);
  };

  const handleSearch = async () => {
    const cleanSearch = search.replace(/\s/g, '').replace('@', '');
    if (!cleanSearch) return;
    
    setIsSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${cleanSearch}%`)
      .limit(5);
    
    setSearchResults(data || []);
    setIsSearching(false);
  };

  const resetSearch = () => {
    setSearch('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 space-y-20">
        
        {/* --- HEADER --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-green flex items-center justify-center">
                   {I.chart}
                </div>
                <h1 className="text-5xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  ESTADÍSTICAS
                </h1>
             </div>
             <p className="text-neon-blue font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Sincronización Regional Activa
             </p>
          </div>
        </motion.header>

           {/* SEARCH BAR - GREEN & BLUE STYLE */}
           <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue rounded-[3rem] blur-xl opacity-10 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center bg-black/60 backdrop-blur-2xl border-2 border-neon-blue/20 rounded-[2.5rem] p-2 pl-8 pr-4 shadow-2xl group-focus-within:border-neon-green/50 transition-all">
                 <span className="text-2xl font-header font-black text-neon-green mr-1">@</span>
                 <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value.replace(/\s/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="USERNAME_SIN_ESPACIOS" 
                    className="flex-1 bg-transparent border-none outline-none text-white font-header font-bold text-xl uppercase tracking-widest placeholder:text-white/5"
                 />
                 <button onClick={handleSearch} className="w-12 h-12 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center hover:bg-neon-green hover:text-black transition-all active:scale-90">
                    {I.search}
                 </button>
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              <AnimatePresence>
                 {searchResults.length > 0 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 w-full mt-4 bg-doc-dark border-2 border-neon-blue/30 rounded-[2.5rem] overflow-hidden z-50 shadow-2xl backdrop-blur-3xl"
                   >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center px-8">
                         <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Coincidencias de Red</span>
                         <button onClick={resetSearch} className="text-white/20 hover:text-neon-red transition-colors">{I.refresh}</button>
                      </div>
                      {searchResults.map((user) => (
                        <button 
                          key={user.id} 
                          onClick={() => { setSelectedUser(user); setSearchResults([]); }}
                          className="w-full flex items-center gap-6 p-6 hover:bg-neon-blue/10 border-b border-white/5 last:border-0 transition-all text-left group"
                        >
                           <div className="w-12 h-12 rounded-full border-2 border-neon-blue p-1">
                              {user.avatar_url ? <Image src={user.avatar_url} alt="" width={48} height={48} className="rounded-full" /> : <div className="w-full h-full rounded-full bg-white/5" />}
                           </div>
                           <div className="flex-1">
                              <h4 className="text-lg font-header font-black text-white group-hover:text-neon-green transition-colors uppercase italic">{user.display_name}</h4>
                              <p className="text-[9px] text-neon-blue font-black tracking-widest uppercase">@{user.username}</p>
                           </div>
                           <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 group-hover:border-neon-green/30 transition-all">
                              <span className="text-[10px] font-black text-white italic uppercase">VER STATS</span>
                           </div>
                        </button>
                      ))}
                   </motion.div>
                 )}
                 {search && searchResults.length === 0 && !isSearching && selectedUser === null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-full left-0 w-full mt-4 text-center p-8 bg-black/60 rounded-[2.5rem] border border-neon-red/20">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">No se encontraron ciudadanos</p>
                       <button onClick={resetSearch} className="px-6 py-3 bg-neon-blue/10 border border-neon-blue/30 rounded-xl text-[9px] font-black text-neon-blue hover:bg-neon-blue hover:text-black transition-all">REINICIAR BÚSQUEDA</button>
                    </motion.div>
                 )}
              </AnimatePresence>
            </div>

        {/* --- TABS --- */}
        <div className="flex justify-center gap-4">
           {[
             { id: 'global', label: 'Global', icon: I.chart, color: 'green' },
             { id: 'server', label: 'Servidor', icon: I.server, color: 'blue' },
             { id: 'user', label: 'Mis Estadísticas', icon: I.lock, color: 'blue' }
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-4 px-10 py-4 rounded-2xl font-header font-black uppercase tracking-[0.2em] transition-all border-2 ${activeTab === tab.id ? `bg-neon-${tab.color} text-black border-neon-${tab.color} shadow-neon-${tab.color}/30` : 'bg-black border-white/5 text-white/30 hover:border-white/20'}`}
             >
               <div className="w-5 h-5">{tab.icon}</div>
               {tab.label}
             </button>
           ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* LEFT PANEL: FILTERS & GLOBAL STATS */}
           <div className="lg:col-span-8 space-y-12">
              
              <AnimatePresence mode="wait">
                 {activeTab === 'global' && (
                   <motion.div key="global" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                      
                      {/* DATE & METRIC SELECTORS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-doc-dark border border-white/10 p-8 rounded-[3rem] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 text-neon-green drop-shadow-neon-green">{I.calendar}</div>
                               <span className="font-header font-black uppercase tracking-widest text-lg italic">Fecha</span>
                            </div>
                            <div className="flex items-center gap-3 bg-black/60 p-2 rounded-2xl border border-white/5">
                               <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent text-white font-bold uppercase text-[9px] outline-none" />
                               <div className="w-2 h-px bg-white/20" />
                               <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent text-white font-bold uppercase text-[9px] outline-none" />
                            </div>
                         </div>

                         <div className="bg-doc-dark border border-white/10 p-8 rounded-[3rem] flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 text-neon-blue drop-shadow-neon-blue">{I.zap}</div>
                               <span className="font-header font-black uppercase tracking-widest text-lg italic">Filtro Maestro</span>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center">
                               {['Usuarios', 'Tracks', 'Puntajes', 'Registros'].map(m => (
                                 <button 
                                   key={m} 
                                   onClick={() => setActiveMetric(m)} 
                                   className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${activeMetric === m ? 'bg-neon-green text-black shadow-neon-green/20 scale-105' : 'bg-black text-white/40 border border-white/5 hover:border-neon-blue/40'}`}
                                 >
                                   {m}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* MAIN CHART */}
                      <div className="bg-doc-dark border-2 border-white/5 p-12 rounded-[4rem] relative overflow-hidden group shadow-2xl">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-neon-green/5 rounded-full blur-[100px]" />
                         <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl font-header font-black text-white italic uppercase tracking-tighter">ANÁLISIS DE TRANSMISIÓN</h2>
                            
                            <div className="h-80 w-full bg-black/40 rounded-[3rem] border border-white/5 p-10 flex items-end justify-between relative group/chart">
                               {chartData.map((h, i) => (
                                 <motion.div 
                                   key={`${activeMetric}-${i}`}
                                   initial={{ height: 0 }}
                                   animate={{ height: `${h}%` }}
                                   transition={{ delay: i * 0.05, duration: 1 }}
                                   className="w-10 bg-gradient-to-t from-neon-blue/20 to-neon-green rounded-t-xl relative group/bar"
                                 >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neon-green text-black px-2 py-1 rounded-md text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                      {h} UNIDADES
                                    </div>
                                 </motion.div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* STATS GRID - GREEN/BLUE */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         {[
                           { label: 'Jugadores Activos', value: '0', color: 'green' },
                           { label: 'Canciones Hoy', value: globalCounts.scores.toString(), color: 'blue' },
                           { label: 'Cambios Log', value: globalCounts.changes.toString(), color: 'green' },
                           { label: 'Multiplicador', value: 'x1.0', color: 'blue' },
                           { label: 'Cuentas Totales', value: globalCounts.users.toString(), color: 'green' },
                           { label: 'Récords Máximos', value: globalCounts.scores.toString(), color: 'blue' },
                           { label: 'Tiempo Total', value: '0h', color: 'green' },
                           { label: 'Tracks en Red', value: globalCounts.tracks.toString(), color: 'blue' },
                         ].map((m, i) => (
                           <div key={i} className={`bg-doc-dark border border-white/5 p-6 rounded-3xl text-center space-y-2 hover:border-neon-${m.color}/40 transition-all shadow-xl`}>
                              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{m.label}</p>
                              <h4 className={`text-2xl font-header font-black text-neon-${m.color}`}>{m.value}</h4>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                 )}

                 {activeTab === 'server' && (
                    <motion.div key="server" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                       <div className="flex flex-col items-center gap-4 text-center">
                          <h2 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">NODO REGIONAL</h2>
                          <p className="text-neon-green font-black uppercase text-[10px] tracking-[0.5em] opacity-40">Unica Instancia Activa en la Red</p>
                       </div>
                       
                       <div className="flex justify-center">
                          {serverHealth.map((srv, i) => (
                            <div key={i} className="max-w-xl w-full bg-doc-dark border-4 border-neon-blue/20 p-12 rounded-[4rem] space-y-10 relative overflow-hidden group">
                               <div className={`absolute top-0 right-0 w-3 h-full bg-neon-green animate-pulse shadow-[0_0_20px_rgba(0,255,0,0.3)]`} />
                               <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                     <h3 className="text-4xl font-header font-black text-white uppercase italic">{srv.region}</h3>
                                     <p className="text-[10px] text-white/20 font-black tracking-widest">ID: {srv.id}</p>
                                  </div>
                                  <Badge status={srv.status} />
                               </div>
                               <div className="space-y-4">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                     <span className="text-white/40">Sincronización Supabase</span>
                                     <span className="text-neon-green font-black">ACTIVA</span>
                                  </div>
                                  <div className="h-4 bg-black rounded-full overflow-hidden border border-white/5 p-1">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} className="h-full bg-gradient-to-r from-neon-blue to-neon-green rounded-full shadow-neon-blue" />
                                  </div>
                                </div>
                               <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                  <div className="space-y-1">
                                     <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Latencia de Red</p>
                                     <p className="text-3xl font-header font-black text-neon-green">{srv.latency_ms}ms</p>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Integridad DB</p>
                                     <p className="text-3xl font-header font-black text-white">ÓPTIMA</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'user' && !session && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-40 text-center space-y-10 bg-black/40 border-2 border-neon-green/20 rounded-[4rem] backdrop-blur-xl">
                       <div className="w-24 h-24 bg-neon-green/10 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto text-neon-green animate-pulse">
                          <div className="w-12 h-12">{I.lock}</div>
                       </div>
                       <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">SINCRONIZACIÓN REQUERIDA</h3>
                       <Link href="/login" className="inline-block">
                          <Button className="!bg-neon-blue !text-black !rounded-2xl px-12 h-16 font-header font-black uppercase tracking-widest italic">INICIAR SESIÓN</Button>
                       </Link>
                    </motion.div>
                 )}
              </AnimatePresence>

           </div>

           {/* RIGHT PANEL: USER DETAIL */}
           <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                 {selectedUser ? (
                    <motion.div key="selected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-doc-dark border-4 border-neon-green/30 rounded-[4rem] p-10 space-y-10 sticky top-12 shadow-[0_0_80px_rgba(0,255,0,0.1)]">
                       <div className="text-center space-y-6">
                          <div className="relative w-32 h-32 mx-auto">
                             <div className="absolute inset-0 bg-neon-green rounded-full blur-2xl opacity-20" />
                             <div className="relative w-full h-full rounded-full border-4 border-neon-green p-1 bg-black">
                                {selectedUser.avatar_url ? (
                                   <Image src={selectedUser.avatar_url} alt="" width={120} height={120} className="rounded-full" />
                                ) : (
                                   <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-neon-green font-header font-black text-5xl italic">
                                      {selectedUser.display_name.charAt(0)}
                                   </div>
                                )}
                             </div>
                          </div>
                          <div className="space-y-1">
                             <h3 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">{selectedUser.display_name}</h3>
                             <p className="text-neon-blue font-black uppercase text-[10px] tracking-[0.4em]">@{selectedUser.username}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <StatBox label="Máx Score" value={selectedUser.highest_score?.toLocaleString() || '---'} color="green" />
                          <StatBox label="Rango" value={`#${selectedUser.global_rank || '---'}`} color="blue" />
                          <StatBox label="Mult." value={`x${selectedUser.max_multiplier || '1.0'}`} color="green" />
                          <StatBox label="Tiempo" value={`${Math.floor((selectedUser.total_playtime_minutes || 0) / 60)}h`} color="blue" />
                       </div>

                       <div className="space-y-3 pt-6 border-t border-white/5">
                          <div className="grid grid-cols-2 gap-3">
                             <ActionButton icon={I.friend} label="AMIGO" color="blue" />
                             <ActionButton icon={I.block} label="BLOQUEAR" color="red" />
                             <ActionButton icon={I.report} label="DENUNCIAR" color="red" />
                             <ActionButton icon={I.share} label="COMPARTIR" color="blue" />
                          </div>
                          <div className="grid grid-cols-1 gap-4 pt-4">
                             <button onClick={() => navigator.clipboard.writeText(selectedUser.id)} className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest group">
                                <span className="opacity-50">IDENTIFICADOR (UUID)</span>
                                <div className="flex items-center gap-3">
                                   <span className="text-white font-mono">{selectedUser.id.slice(0,8)}...</span>
                                   <div className="w-5 h-5 group-hover:scale-110 transition-transform">{I.copy}</div>
                                </div>
                             </button>
                             <button onClick={() => navigator.clipboard.writeText(selectedUser.username)} className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest group">
                                <span className="opacity-50">NOMBRE DE USUARIO</span>
                                <div className="flex items-center gap-3">
                                   <span className="text-white font-mono">{selectedUser.username}</span>
                                   <div className="w-5 h-5 group-hover:scale-110 transition-transform">{I.copy}</div>
                                </div>
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="bg-black/20 border-2 border-dashed border-white/5 rounded-[4rem] p-16 text-center space-y-6 opacity-30 sticky top-12">
                       <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                          {I.users}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-[12rem] mx-auto">Selecciona un ciudadano de los resultados para desplegar métricas</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}

const Badge = ({ status }: { status: string }) => (
  <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border ${status === 'online' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' : 'bg-neon-red/10 text-neon-red border-neon-red/20'}`}>
    <div className={`w-2 h-2 rounded-full bg-current ${status === 'online' ? 'animate-pulse shadow-neon-green' : ''}`} />
    {status}
  </div>
);

const StatBox = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-1 group hover:border-neon-blue/30 transition-all">
     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
     <p className={`text-xl font-header font-black italic text-neon-${color}`}>{value}</p>
  </div>
);

const ActionButton = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <button className={`flex items-center justify-center gap-3 px-4 py-3 bg-black border border-white/5 rounded-xl hover:border-neon-${color}/50 hover:bg-neon-${color}/5 transition-all group`}>
     <div className={`w-4 h-4 text-neon-${color} group-hover:scale-110 transition-transform`}>{icon}</div>
     <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{label}</span>
  </button>
);
