'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CHANGELOG_DATA, ChangelogType } from '@/data/changelog';
import { useAppStore } from '@/store/useAppStore';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
 
import { I, TAG_CONFIG } from '@/config/changelogIcons';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@ciszu/ui';

const TypeTag = ({ type, active = false, onClick }: { type: ChangelogType, active?: boolean, onClick?: () => void }) => {
  const config = TAG_CONFIG[type];
  if (!config) return null;
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${active ? `bg-gradient-to-r ${config.gradient} text-black border-transparent shadow-lg` : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
    >
       <div className={`w-4 h-4 ${active ? 'text-black' : config.color}`}>{config.icon}</div>
       <span className="text-[10px] font-black uppercase tracking-widest italic">{config.label}</span>
    </button>
  );
};

const TypeLabel = ({ type }: { type: ChangelogType }) => {
  return TAG_CONFIG[type]?.label || type.toUpperCase();
};

export default function ChangelogIndex() {
  usePageTitle('CHANGELOG');
  const [filters, setFilters] = useState<ChangelogType[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const { toast } = useToast();
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);

  const handleLike = (id: string) => {
    setIsAuthWarningOpen(true);
  };

  const filteredData = CHANGELOG_DATA
    .filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.some(d => d.text.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filters.length === 0 || item.types.some(t => filters.includes(t));
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const valA = sortBy === 'date' ? new Date(a.date).getTime() : (a.likes || 0);
      const valB = sortBy === 'date' ? new Date(b.date).getTime() : (b.likes || 0);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CHANGELOG_DATA.forEach(item => {
      item.types.forEach(type => {
        stats[type] = (stats[type] || 0) + 1;
      });
    });
    return stats;
  }, []);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const mostRecentId = useMemo(() => {
    return CHANGELOG_DATA.reduce((latest, item) =>
      new Date(item.date) > new Date(latest.date) ? item : latest
    , CHANGELOG_DATA[0]).id;
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-neon-purple/5 rounded-full blur-[250px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-32 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   {I.history}
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black] whitespace-nowrap">
                  REGISTRO DE CAMBIOS
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Evolución Detallada del Nexo v2.0
             </p>
          </div>
        </motion.header>

          {/* PROGRESS BAR */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 relative overflow-hidden group">
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                   <h3 className="text-xl font-header font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <div className="w-5 h-5 text-neon-pink drop-shadow-neon-pink">{I.zap}</div> BETA PÚBLICA V2.0
                   </h3>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Estado actual de despliegue</p>
                </div>
                <div className="text-4xl font-header font-black text-neon-blue drop-shadow-neon-blue italic">89%</div>
             </div>
             <div className="h-4 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '89%' }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_20px_rgba(0,180,255,0.4)]"
                />
             </div>
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                <span>Iniciando Fase 3</span>
                <span>Despliegue Final</span>
             </div>
          </div>

          {/* PROJECT STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">{I.code}</div>
                <div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Versión</div>
                   <div className="text-sm font-header font-black text-white uppercase italic">v2.2.8</div>
                </div>
             </div>
             <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple">{I.server}</div>
                <div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Servidores</div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                      <div className="text-sm font-header font-black text-white uppercase italic">OPERATIVO / SUPABASE</div>
                   </div>
                </div>
             </div>
             <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center text-neon-pink">{I.user}</div>
                <div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Developers</div>
                   <div className="text-sm font-header font-black text-white uppercase italic">CiszukoAntony</div>
                </div>
             </div>
          </div>

          {/* NEXT STEPS DIAGRAM */}
          <div className="relative group/roadmap mt-8">
             <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-[4rem] blur opacity-10 group-hover/roadmap:opacity-30 transition duration-1000" />
             <div className="p-12 bg-doc-dark/80 backdrop-blur-2xl border border-white/10 rounded-[4rem] space-y-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="text-center space-y-2 relative z-10">
                   <h3 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      PRÓXIMOS NODOS
                   </h3>
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                      Despliegue arquitectónico de MuzicMania
                   </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                   {/* Línea conectora de fondo */}
                   <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/5 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-neon-blue to-neon-purple animate-pulse" />
                   </div>

                   {[
                     { label: 'Multijugador Real', desc: 'Sync de latencia cero', status: 'done', icon: I.check, color: 'blue' },
                     { label: 'Marketplace Alpha', desc: 'Economía integrada', status: 'next', icon: I.zap, color: 'purple' },
                     { label: 'Editor de Niveles', desc: 'Beatmapping en vivo', status: 'locked', icon: I.lock, color: 'gray' },
                     { label: 'Global Launch', desc: 'Apertura del Nexo', status: 'locked', icon: I.shield, color: 'gray' },
                   ].map((step, i) => (
                     <div key={step.label} className="relative flex flex-col items-center gap-5 w-full md:w-1/4 group/node">
                        {/* Nodo visual */}
                        <div className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 z-10 shadow-2xl
                           ${step.status === 'done' ? 'bg-neon-blue/20 border-neon-blue text-white drop-shadow-[0_0_15px_rgba(0,180,255,0.8)] group-hover/node:scale-110' : 
                             step.status === 'next' ? 'bg-neon-purple/30 border-neon-purple text-white animate-pulse drop-shadow-[0_0_20px_rgba(180,0,255,0.9)] group-hover/node:scale-110' : 
                             'bg-black/90 border-white/10 text-white/40 group-hover/node:border-white/30'}`}
                        >
                           <div className="w-8 h-8">{step.icon}</div>
                           
                           {/* Indicador "ACTUAL" mejorado */}
                           {step.status === 'next' && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-purple text-white text-[8px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(180,0,255,1)] animate-bounce z-20 border border-white/20">
                                 ACTUAL
                              </div>
                           )}
                        </div>

                        {/* Textos descriptivos — Fondo más opaco para evitar solapamiento */}
                        <div className="text-center space-y-1 bg-black/95 p-4 rounded-3xl border border-white/10 w-full z-10 group-hover/node:bg-white/10 transition-colors shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                           <div className={`text-[11px] font-black uppercase tracking-tighter italic
                              ${step.status === 'done' ? 'text-neon-blue' : step.status === 'next' ? 'text-neon-purple' : 'text-white/40'}`}>
                              {step.label}
                           </div>
                           <div className="text-[9px] font-bold text-white/50 tracking-widest uppercase line-clamp-1">
                              {step.desc}
                           </div>
                           <div className={`text-[7px] font-black uppercase tracking-[0.2em] mt-2 pt-2 border-t border-white/10
                              ${step.status === 'done' ? 'text-neon-blue' : step.status === 'next' ? 'text-neon-purple' : 'text-white/20'}`}>
                              {step.status === 'done' ? 'Completado' : step.status === 'next' ? 'En Despliegue' : 'Codificado'}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>

        {/* --- SEARCH --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="relative z-20">
           <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-white/20 group-focus-within:text-neon-blue transition-colors">
                 <div className="w-6 h-6">{I.filter}</div>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="BUSCAR VERSIÓN, PARCHE O NODO..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-20 pr-8 text-white font-header font-black uppercase italic tracking-[0.2em] focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/10 transition-all placeholder:text-white/10 text-sm"
              />
           </div>
        </motion.section>

        {/* --- FILTERS & SORT --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-6">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setShowTagSelector(!showTagSelector)}
                   className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all font-black text-[12px] tracking-[0.2em] group ${showTagSelector ? 'bg-neon-purple border-neon-purple text-white shadow-neon-purple' : 'bg-black/40 border-white/10 text-white/40'}`}
                 >
                    <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500">{I.filter}</div>
                    GESTIONAR FILTROS
                 </button>

                  {filters.length > 0 && (
                     <button 
                       onClick={() => { setFilters([]); setCurrentPage(1); }}
                       className="text-[10px] font-black text-neon-pink uppercase tracking-widest hover:underline"
                     >
                        LIMPIAR
                     </button>
                  )}
              </div>

              {/* SORT CONTROLS */}
              <div className="flex items-center gap-3">
                 <div className="flex p-1 bg-black/60 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setSortBy('date')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/20 hover:text-white/40'}`}
                    >
                       <div className="w-3.5 h-3.5">{I.clock}</div>
                       RECIENTES
                    </button>
                    <button 
                      onClick={() => setSortBy('likes')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'likes' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/20 hover:text-white/40'}`}
                    >
                       <div className="w-3.5 h-3.5 text-yellow-500">{I.star}</div>
                       VALORADOS
                    </button>
                 </div>
                 
                 <button 
                   onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                   className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:border-white/30"
                 >
                    <div className={`w-6 h-6 transition-transform duration-500 ${sortDir === 'asc' ? 'rotate-180' : ''}`}>{I.sort}</div>
                 </button>
              </div>
           </div>

           {/* TAG DISTRIBUTION STATS */}
            <div className="flex flex-wrap gap-4 px-6">
               {Object.entries(tagStats).map(([tag, count]) => {
                 const isActive = filters.includes(tag as ChangelogType);
                 return (
                  <div key={tag} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-neon-purple/20 border-neon-purple/40 text-neon-purple' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'}`}>
                     <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${TAG_CONFIG[tag as ChangelogType]?.gradient}`} />
                     <span className="transition-colors">{TAG_CONFIG[tag as ChangelogType]?.label}</span>
                     <span className="text-neon-cyan/60">{count}</span>
                  </div>
                 );
               })}
            </div>

           <AnimatePresence>
              {showTagSelector && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                    <div className="p-10 bg-black/60 border border-white/5 rounded-[3.5rem] space-y-6 shadow-2xl">
                       {/* UNIFIED TAGS SECTION */}
                       <div className="space-y-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SISTEMA DE ETIQUETADO</h4>
                             <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest italic">Selecciona una etiqueta para filtrar los resultados</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {Object.entries(TAG_CONFIG).map(([key, config]) => (
                                 <TypeTag 
                                   key={key}
                                   type={key as any}
                                   active={filters.includes(key as ChangelogType)}
                                   onClick={() => { 
                                     setFilters(prev => prev.includes(key as ChangelogType) ? prev.filter(f => f !== key) : [...prev, key as ChangelogType]); 
                                     setCurrentPage(1); 
                                   }}
                                 />
                              ))}
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </motion.section>

        {/* --- CHANGELOG LIST --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-10">
           {paginatedData.length === 0 ? (
              <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center space-y-6">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                    {I.alert}
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">SIN RESULTADOS</h3>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No hay innovaciones que coincidan con tu búsqueda</p>
                 </div>
                  <button 
                    onClick={() => { setSearchQuery(''); setFilters([]); setCurrentPage(1); }}
                    className="px-8 py-3 bg-neon-blue text-black font-header font-black uppercase italic tracking-widest rounded-2xl hover:shadow-neon-blue transition-all"
                  >
                     REINICIAR BÚSQUEDA
                  </button>
              </div>
           ) : (
              paginatedData.map((item, idx) => (
                 <div 
                   key={item.id} 
                   className="group relative p-px rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent hover:from-neon-blue/40 transition-all duration-700"
                 >
                    <div className="bg-black/80 p-8 md:p-10 rounded-[2.9rem] border border-white/5 relative overflow-hidden backdrop-blur-3xl">
                        {/* NEW LABEL - TOP LEFT CORNER BANNER */}
                        {item.id === mostRecentId && (
                          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
                             <div className="absolute top-0 left-0 w-full h-8 bg-green-500 text-black text-[9px] font-black flex items-center justify-center uppercase tracking-[0.3em] rotate-[-45deg] translate-x-[-30%] translate-y-[40%] shadow-lg shadow-green-500/20">
                                NUEVO
                             </div>
                          </div>
                       )}

                       <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                          {/* LEFT: ICON & VERSION */}
                           <div className="flex flex-col items-center gap-4 shrink-0">
                              <div className={`w-24 h-24 rounded-[2.5rem] bg-gradient-to-br ${TAG_CONFIG[item.types[0]]?.gradient || 'from-white/10 to-transparent'} p-px group-hover:scale-105 transition-transform shadow-lg shadow-black/40`}>
                                 <div className="w-full h-full rounded-[2.4rem] bg-black/80 flex items-center justify-center backdrop-blur-xl">
                                    <div className={`w-10 h-10 ${TAG_CONFIG[item.types[0]]?.color || 'text-white'}`}>
                                       {TAG_CONFIG[item.types[0]]?.icon || I.history}
                                    </div>
                                 </div>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                                 {item.code}
                              </span>
                           </div>

                           {/* CENTER: CONTENT */}
                           <div className="flex-1 space-y-6">
                              <div className="flex flex-wrap items-center gap-4">
                                 <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white font-header font-black uppercase italic tracking-widest text-[10px]">
                                       {item.version}
                                    </span>
                                    <div className="flex gap-2">
                                       {item.types.map(t => (
                                          <TypeTag key={t} type={t} active />
                                       ))}
                                    </div>
                                 </div>
                                 <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">{item.date}</span>
                                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                                    <div className="w-3 h-3 text-neon-blue">{I.user}</div>
                                    {item.author}
                                 </div>
                              </div>
                              
                              <div className="space-y-4">
                                 <div className="space-y-2">
                                    <h2 className="text-4xl font-header font-black text-white group-hover:text-neon-cyan transition-colors uppercase italic tracking-tighter leading-none">
                                       {item.title}
                                    </h2>
                                    <p className="text-white/40 text-sm font-bold italic leading-relaxed max-w-xl">
                                       {item.description}
                                    </p>
                                 </div>

                                 {/* INTERNAL CHANGES PREVIEW */}
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {item.details.slice(0, 4).map((detail, dIdx) => (
                                       <div key={dIdx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/detail">
                                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 group-hover/detail:scale-150 transition-transform ${TAG_CONFIG[detail.type]?.color || 'bg-white/40'}`} />
                                          <p className="text-[10px] font-bold text-white/60 leading-snug">
                                             <span className={`uppercase font-black tracking-widest mr-2 ${TAG_CONFIG[detail.type]?.color || 'text-white/40'}`}>
                                                [{TAG_CONFIG[detail.type]?.label || detail.type}]
                                             </span>
                                             {detail.text}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                          {/* RIGHT: ACTIONS & LIKES */}
                          <div className="flex md:flex-col items-center gap-6 self-stretch justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-12">
                             <Link 
                               href={`/changelog/${item.id}`}
                               className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-neon-blue hover:text-black hover:border-neon-blue transition-all group/btn flex items-center gap-3"
                             >
                                EXPLORAR
                                <div className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform">{I.arrow}</div>
                             </Link>
                             
                             <button 
                               onClick={(e) => { e.preventDefault(); handleLike(item.id); }}
                               className="flex flex-col items-center gap-1 group/like p-2 hover:text-neon-pink transition-colors"
                             >
                                <div className="w-6 h-6 group-hover/like:scale-125 transition-transform">{I.heart}</div>
                                <span className="text-[10px] font-mono font-black text-white/30 group-hover/like:text-neon-pink">{item.likes || 0}</span>
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              ))
           )}
        </motion.section>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-center gap-3">
           <button 
             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
             disabled={currentPage === 1}
             className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white disabled:opacity-0 transition-all"
           >
              <div className="w-5 h-5 rotate-180">{I.arrow}</div>
           </button>
           
           {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                onClick={() => setCurrentPage(page)}
                className={`w-12 h-12 rounded-xl font-header font-black transition-all border ${page === currentPage ? 'bg-neon-purple border-neon-purple text-white shadow-neon-purple' : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'}`}
              >
                 {page}
              </button>
           ))}

           <button 
             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
             disabled={currentPage === totalPages}
             className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white disabled:opacity-0 transition-all"
           >
              <div className="w-5 h-5">{I.arrow}</div>
           </button>
        </div>

        {/* --- ROADMAP / PRÓXIMAS IMPLEMENTACIONES --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                 <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter flex items-center justify-center md:justify-start gap-3">
                    <div className="w-8 h-8 text-neon-pink">{I.target}</div>
                    HOJA DE RUTA
                 </h2>
                 <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">El Futuro del Nexo en Construcción</p>
              </div>
              <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Progreso Global</span>
                 </div>
                 <div className="text-neon-cyan font-black">89%</div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BETA V2.1 */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[50px] group-hover:bg-neon-blue/20 transition-colors" />
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                       <h3 className="text-2xl font-header font-black text-white uppercase italic">BETA V2.1</h3>
                       <span className="text-[10px] font-black text-neon-blue tracking-[0.3em] uppercase">En Desarrollo</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                       <div className="w-5 h-5">{I.settings}</div>
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
                       <div className="bg-neon-blue h-1.5 rounded-full w-[89%]" />
                    </div>

                    <div className="space-y-3">
                       {[
                         { text: 'Sistema de Autenticación Definitivo con Supabase Auth', done: true },
                         { text: 'Lógica de Búsqueda y Filtrado Global en el Navbar', done: false },
                         { text: 'Página Individual de Changelog Dinámica', done: true },
                         { text: 'Optimización de métricas de rendimiento Core', done: true },
                       ].map((task, i) => (
                          <div key={i} className="flex items-start gap-3 group/task">
                             <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${task.done ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'bg-white/5 border-white/10 text-white/20 group-hover/task:border-white/30'}`}>
                                {task.done ? <div className="w-3 h-3">{I.check}</div> : <div className="w-2 h-2 rounded-sm bg-white/20" />}
                             </div>
                             <p className={`text-xs font-bold leading-relaxed ${task.done ? 'text-white/60 line-through decoration-white/20' : 'text-white/80'}`}>{task.text}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* BETA V2.2 */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden group hover:border-neon-purple/30 transition-colors">
                 <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                       <h3 className="text-2xl font-header font-black text-white/40 uppercase italic group-hover:text-white transition-colors">BETA V2.2</h3>
                       <span className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase group-hover:text-neon-purple transition-colors">Planificado</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-neon-purple group-hover:bg-neon-purple/20 transition-all">
                       <div className="w-5 h-5">{I.layers}</div>
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
                       <div className="bg-neon-purple h-1.5 rounded-full w-[0%]" />
                    </div>

                    <div className="space-y-3">
                       {[
                         { text: 'Lanzamiento de Sistema de Juego Interactivo (/play)', done: false },
                         { text: 'Integración de Cloudflare y Protección Avanzada', done: false },
                         { text: 'Sistema de Niveles y Leaderboards', done: false },
                         { text: 'Soporte Nativo para Instalación PDWA', done: false },
                       ].map((task, i) => (
                          <div key={i} className="flex items-start gap-3 group/task">
                             <div className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border bg-white/5 border-white/10 text-white/20 group-hover/task:border-white/30 transition-all">
                                <div className="w-2 h-2 rounded-sm bg-white/20" />
                             </div>
                             <p className="text-xs font-bold leading-relaxed text-white/40 group-hover/task:text-white/80 transition-colors">{task.text}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </motion.section>

        {/* --- GLOSSARY / CATEGORIES --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="p-12 bg-black/40 border border-white/5 rounded-[4rem] space-y-12 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-neon-purple/5 to-transparent pointer-events-none" />
           <div className="text-center space-y-2 relative z-10">
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">GLOSARIO DE NODOS</h2>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Diccionario Técnico de Actualizaciones</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { type: 'add', desc: 'Inyección de nuevos módulos, funciones o activos.' },
                { type: 'hotfix', desc: 'Intervención de emergencia para errores críticos.' },
                { type: 'rework', desc: 'Reestructuración profunda de mecánicas existentes.' },
                { type: 'bugfix', desc: 'Erradicación de anomalías y comportamientos erróneos.' },
                { type: 'perf', desc: 'Optimización de recursos y velocidad de respuesta.' },
                { type: 'ux', desc: 'Mejoras en el flujo de interacción y accesibilidad.' },
                { type: 'sec', desc: 'Fortalecimiento de protocolos de seguridad.' },
                { type: 'refactor', desc: 'Limpieza y reestructuración de la base de código.' },
                { type: 'build', desc: 'Mejoras en el sistema de compilación y despliegue.' },
              ].map(cat => (
                 <div key={cat.type} className="flex gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                    <div className="shrink-0 pt-1 group-hover:scale-110 transition-transform">
                       <div className={`w-8 h-8 ${TAG_CONFIG[cat.type as ChangelogType]?.color || 'text-white'}`}>
                          {TAG_CONFIG[cat.type as ChangelogType]?.icon}
                       </div>
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-header font-black text-white uppercase italic tracking-tighter text-sm">{cat.type.toUpperCase()}</h4>
                       <p className="text-[10px] text-white/40 font-bold leading-tight">{cat.desc}</p>
                    </div>
                 </div>
              ))}
           </div>
        </motion.section>

        {/* --- DOCS CTA --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="p-px rounded-[4rem] bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-transparent">
           <div className="bg-black/60 p-12 rounded-[3.9rem] text-center border border-white/5 relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute inset-0 bg-neon-blue/5 animate-pulse" />
              <div className="relative space-y-6">
                 <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">¿SISTEMA EN EVOLUCIÓN?</h2>
                 <p className="text-gray-500 font-bold uppercase text-xs tracking-widest max-w-md mx-auto italic">
                    Explora la documentación profunda de nodos y protocolos del Nexo.
                 </p>
                 <Link href="/documentation" className="inline-flex items-center gap-3 text-neon-cyan font-black uppercase text-[10px] tracking-[0.4em] pb-1 border-b-2 border-neon-cyan/30 hover:border-neon-cyan hover:gap-6 transition-all group">
                    VER PROTOCOLOS
                    <div className="w-4 h-4">{I.arrow}</div>
                 </Link>
              </div>
           </div>
        </motion.section>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </div>
    </MainLayout>
  );
}

