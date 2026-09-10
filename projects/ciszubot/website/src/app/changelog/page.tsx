'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CHANGELOG_DATA, ChangelogType } from '@/data/changelog';
import { useAppStore } from '@/store';
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

export default function ChangelogPage() {
  usePageTitle('CHANGELOG');
  const { user } = useAppStore();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ChangelogType[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);

  const handleLike = (id: string) => {
    if (!user) {
      setIsAuthWarningOpen(true);
      return;
    }
    toast('Función de likes próximamente disponible.', 'info');
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
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* --- HERO --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-blue/12 text-neon-blue mb-6 shadow-[0_0_20px_rgba(0,212,255,0.25)]">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4">
              Changelog
            </h1>
            <p className="text-muted max-w-xl mx-auto text-sm uppercase tracking-widest">
              Historial de actualizaciones / Update History
            </p>
          </motion.div>

          {/* --- SEARCH --- */}
          <div className="relative group max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-white/20 group-focus-within:text-neon-blue transition-colors">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="BUSCAR VERSIÓN, PARCHE O NODO..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-20 pr-8 text-white font-header font-black uppercase italic tracking-[0.2em] focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/10 transition-all placeholder:text-white/10 text-sm"
            />
          </div>

          {/* --- FILTERS & SORT --- */}
          <div className="space-y-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all font-black text-[12px] tracking-[0.2em] group ${showTagSelector ? 'bg-neon-blue border-neon-blue text-black shadow-lg' : 'bg-black/40 border-white/10 text-white/40'}`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
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
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      RECIENTES
                   </button>
                   <button
                     onClick={() => setSortBy('likes')}
                     className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'likes' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/20 hover:text-white/40'}`}
                   >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      VALORADOS
                   </button>
                </div>

                <button
                  onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:border-white/30"
                >
                   <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-transform duration-500 ${sortDir === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                </button>
              </div>
            </div>

            {/* TAG DISTRIBUTION STATS */}
             <div className="flex flex-wrap gap-4 px-6">
                {Object.entries(tagStats).map(([tag, count]) => {
                  const isActive = filters.includes(tag as ChangelogType);
                  return (
                   <div key={tag} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'}`}>
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
          </div>

          {/* --- CHANGELOG LIST --- */}
          <div className="space-y-10 mb-16">
             {paginatedData.length === 0 ? (
                <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center space-y-6">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
                                       <svg viewBox="0 0 24 24" className="w-3 h-3 text-neon-blue"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                                <button
                                  onClick={() => toast('Detalle de versión próximamente.', 'info')}
                                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-neon-blue hover:text-black hover:border-neon-blue transition-all group/btn flex items-center gap-3"
                                >
                                   EXPLORAR
                                   <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </button>

                                <button
                                  onClick={(e) => { e.preventDefault(); handleLike(item.id); }}
                                  className="flex flex-col items-center gap-1 group/like p-2 hover:text-neon-pink transition-colors"
                                >
                                   <svg viewBox="0 0 24 24" className="w-6 h-6 group-hover/like:scale-125 transition-transform" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                   <span className="text-[10px] font-mono font-black text-white/30 group-hover/like:text-neon-pink">{item.likes || 0}</span>
                                </button>
                             </div>
                          </div>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* --- PAGINATION --- */}
          <div className="flex items-center justify-center gap-3 mb-20">
             <button
               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
               disabled={currentPage === 1}
               className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white disabled:opacity-0 transition-all"
             >
                <svg viewBox="0 0 24 24" className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
             </button>
          </div>

          {/* --- GLOSSARY --- */}
          <div className="p-12 bg-black/40 border border-white/5 rounded-[4rem] space-y-12 relative overflow-hidden mb-20">
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
          </div>

          <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
          <QuickDocks />
        </div>
      </div>
    </div>
  );
}
