'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import QuickDocks from '@/components/molecules/QuickDocks';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import {
  CHANGELOG_DATA as CHANGELOG_STATIC,
  CHANGELOG_GLOSSARY,
  CHANGELOG_STATUS,
  type ChangelogType,
} from '@/data/changelog';
import { I, TAG_CONFIG } from '@/config/changelogIcons';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAppStore } from '@/store';
import { useChangelogLikes, usePublishedChangelogs, useToast } from '@ciszu/ui';
import {
  CHANGELOG_PAGE_SIZE,
  filterChangelog,
  getCurrentPhase,
  getMostRecentId,
  getOverallProgress,
  getPhaseProgress,
  getTagStats,
  mergeChangelogSources,
  paginate,
  type ChangelogNode,
  type ChangelogSortBy,
  type ChangelogSortDir,
} from '@ciszunetwork/utils/changelog';


/** Icono de una entrada: usa el icono publicado (devcon) si existe. */
const entryIcon = (item: { icon?: string; types: ChangelogType[] }) =>
  (item.icon && (I as Record<string, React.ReactNode>)[item.icon]) ||
  TAG_CONFIG[item.types[0]]?.icon ||
  I.history;

const NODE_ICON: Record<ChangelogNode['status'], React.ReactNode> = {
  done: I.check,
  next: I.zap,
  locked: I.lock,
};

const TypeTag = ({ type, active = false, onClick }: { type: ChangelogType; active?: boolean; onClick?: () => void }) => {
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

export default function ChangelogPage() {
  usePageTitle('CHANGELOG');
  const { user } = useAppStore();
  const { toast } = useToast();
  const likes = useChangelogLikes();
  // Entradas publicadas desde el devcon (almacén en vivo) + las del código.
  const published = usePublishedChangelogs('ciszubot');
  const CHANGELOG_DATA = useMemo(
    () => mergeChangelogSources(published.entries, CHANGELOG_STATIC),
    [published.entries],
  );

  const [filters, setFilters] = useState<ChangelogType[]>([]);
  const [sortBy, setSortBy] = useState<ChangelogSortBy>('date');
  const [sortDir, setSortDir] = useState<ChangelogSortDir>('desc');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);

  const filteredData = useMemo(
    () => filterChangelog(CHANGELOG_DATA, { search: searchQuery, tags: filters, sortBy, sortDir }),
    [searchQuery, filters, sortBy, sortDir, CHANGELOG_DATA],
  );

  const tagStats = useMemo(() => getTagStats(CHANGELOG_DATA), [CHANGELOG_DATA]);
  const sortedTagStats = useMemo(
    () => Object.entries(tagStats).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [tagStats],
  );

  const page = useMemo(
    () => paginate(filteredData, currentPage, CHANGELOG_PAGE_SIZE),
    [filteredData, currentPage],
  );
  const paginatedData = page.items;

  const mostRecentId = useMemo(() => getMostRecentId(CHANGELOG_DATA), [CHANGELOG_DATA]);

  const { phases } = CHANGELOG_STATUS;
  const currentPhase = useMemo(() => getCurrentPhase(phases), [phases]);
  const globalProgress = useMemo(
    () => getOverallProgress(phases, CHANGELOG_STATUS.progress),
    [phases],
  );

  const hasActiveQuery = searchQuery.trim().length > 0 || filters.length > 0;
  const clearAll = () => {
    setSearchQuery('');
    setFilters([]);
    setCurrentPage(1);
  };

  const toggleFilter = (tag: ChangelogType) => {
    setFilters((prev) => (prev.includes(tag) ? prev.filter((f) => f !== tag) : [...prev, tag]));
    setCurrentPage(1);
  };

  const handleLike = (id: string) => {
    if (!user) {
      setIsAuthWarningOpen(true);
      return;
    }
    likes.toggleLike(id);
    if (!likes.isLiked(id)) {
      toast('Like guardado en este dispositivo.', 'info');
    }
  };

  return (
    <div className="bg-bg py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* --- HERO --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-blue/12 text-neon-blue mb-6 shadow-[0_0_20px_rgba(0,212,255,0.25)]">
            {I.history}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4">
            Changelog
          </h1>
          <p className="text-muted max-w-xl mx-auto text-sm uppercase tracking-widest">
            Historial de actualizaciones / Update History
          </p>
        </motion.div>

        {/* --- ESTADO ACTUAL / PROGRESS BAR --- */}
        <Section className="mb-10 p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10 gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-header font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                <div className="w-5 h-5 text-neon-cyan">{I.zap}</div>
                {CHANGELOG_STATUS.headline}
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Estado actual de despliegue
              </p>
            </div>
            <div className="text-4xl font-header font-black text-neon-blue italic">
              {CHANGELOG_STATUS.progress}%
            </div>
          </div>
          <div
            className="h-4 bg-black/60 rounded-full overflow-hidden border border-white/5"
            role="progressbar"
            aria-valuenow={CHANGELOG_STATUS.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del despliegue actual"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${CHANGELOG_STATUS.progress}%` }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-neon-blue to-neon-blue"
            />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
            <span>{CHANGELOG_STATUS.progressStartLabel}</span>
            <span>{CHANGELOG_STATUS.progressEndLabel}</span>
          </div>
        </Section>

        {/* --- PROJECT STATUS --- */}
        <Section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              {I.code}
            </div>
            <div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Versión</div>
              <div className="text-sm font-header font-black text-white uppercase italic">{CHANGELOG_STATUS.version}</div>
            </div>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              {I.server}
            </div>
            <div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Servidores</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="text-sm font-header font-black text-white uppercase italic">{CHANGELOG_STATUS.deploy}</div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              {I.user}
            </div>
            <div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Developers</div>
              <div className="text-sm font-header font-black text-white uppercase italic">{CHANGELOG_STATUS.developer}</div>
            </div>
          </div>
        </Section>

        {/* --- PRÓXIMOS NODOS --- */}
        <Section className="mb-16">
          <div className="p-10 bg-black/60 border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden">
            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">
                PRÓXIMOS NODOS
              </h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                Despliegue arquitectónico de Ciszu Network
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/5 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-neon-blue to-neon-blue animate-pulse" />
              </div>

              {CHANGELOG_STATUS.nodes.map((step) => (
                <div key={step.label} className="relative flex flex-col items-center gap-4 w-full md:w-1/4 group/node">
                  <div
                    className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                      step.status === 'done'
                        ? 'bg-neon-blue/20 border-neon-blue text-neon-blue group-hover/node:scale-110'
                        : step.status === 'next'
                          ? 'bg-neon-blue/20 border-neon-blue text-white animate-pulse group-hover/node:scale-110'
                          : 'bg-black/90 border-white/10 text-white/40 group-hover/node:border-white/30'
                    }`}
                  >
                    <div className="w-8 h-8">{NODE_ICON[step.status]}</div>
                    {step.status === 'next' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-blue text-black text-[8px] font-black px-3 py-1 rounded-full animate-bounce z-20">
                        ACTUAL
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-1 bg-black/95 p-4 rounded-3xl border border-white/10 w-full z-10 group-hover/node:bg-white/10 transition-colors">
                    <div
                      className={`text-[11px] font-black uppercase tracking-tighter italic ${
                        step.status === 'done' ? 'text-neon-blue' : step.status === 'next' ? 'text-neon-cyan' : 'text-white/40'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[9px] font-bold text-white/50 tracking-widest uppercase">{step.desc}</div>
                    <div
                      className={`text-[7px] font-black uppercase tracking-[0.2em] mt-2 pt-2 border-t border-white/10 ${
                        step.status === 'done' ? 'text-neon-blue' : step.status === 'next' ? 'text-neon-cyan' : 'text-white/20'
                      }`}
                    >
                      {step.status === 'done' ? 'Completado' : step.status === 'next' ? 'En Despliegue' : 'Codificado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* --- SEARCH --- */}
        <Section className="mb-8">
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-white/20 group-focus-within:text-neon-blue transition-colors">
              <div className="w-6 h-6">{I.search}</div>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="BUSCAR VERSIÓN, CÓDIGO, PARCHE O NODO..."
              aria-label="Buscar en el registro de cambios"
              className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-20 pr-8 text-white font-header font-black uppercase italic tracking-[0.2em] focus:outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/10 transition-all placeholder:text-white/10 text-sm"
            />
          </div>
        </Section>

        {/* --- FILTERS & SORT --- */}
        <Section className="space-y-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTagSelector(!showTagSelector)}
                aria-expanded={showTagSelector}
                className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all font-black text-[12px] tracking-[0.2em] group ${
                  showTagSelector ? 'bg-neon-blue border-neon-blue text-black shadow-lg' : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500">{I.filter}</div>
                GESTIONAR FILTROS
                {filters.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px]">{filters.length}</span>
                )}
              </button>

              {hasActiveQuery && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-black text-neon-pink uppercase tracking-widest hover:underline"
                >
                  LIMPIAR TODO
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex p-1 bg-black/60 rounded-2xl border border-white/5">
                <button
                  onClick={() => setSortBy('date')}
                  aria-pressed={sortBy === 'date'}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    sortBy === 'date' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  <div className="w-3.5 h-3.5">{I.clock}</div>
                  RECIENTES
                </button>
                <button
                  onClick={() => setSortBy('likes')}
                  aria-pressed={sortBy === 'likes'}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    sortBy === 'likes' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  <div className="w-3.5 h-3.5 text-yellow-500">{I.star}</div>
                  VALORADOS
                </button>
              </div>

              <button
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                aria-label={sortDir === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:border-white/30"
              >
                <div className={`w-6 h-6 transition-transform duration-500 ${sortDir === 'asc' ? 'rotate-180' : ''}`}>
                  {I.sort}
                </div>
              </button>
            </div>
          </div>

          {/* TAG DISTRIBUTION STATS (clickables) */}
          <div className="flex flex-wrap gap-4 px-6">
            {sortedTagStats.map(([tag, count]) => {
              const isActive = filters.includes(tag as ChangelogType);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilter(tag as ChangelogType)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                      : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${TAG_CONFIG[tag as ChangelogType]?.gradient}`} />
                  <span>{TAG_CONFIG[tag as ChangelogType]?.label || tag}</span>
                  <span className="text-neon-cyan/60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Mostrando {page.start}–{page.end} de {page.totalItems} {page.totalItems === 1 ? 'entrada' : 'entradas'}
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
                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest italic">
                        Selecciona una etiqueta para filtrar los resultados
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Object.entries(TAG_CONFIG).map(([key, config]) => (
                        <TypeTag
                          key={key}
                          type={key as ChangelogType}
                          active={filters.includes(key as ChangelogType)}
                          onClick={() => toggleFilter(key as ChangelogType)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* --- CHANGELOG LIST --- */}
        <div className="space-y-10 mb-16">
          {paginatedData.length === 0 ? (
            <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <div className="w-8 h-8">{I.alert}</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">SIN RESULTADOS</h3>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                  Ninguna entrada coincide con tu búsqueda
                </p>
              </div>
              <button
                onClick={clearAll}
                className="px-8 py-3 bg-neon-blue text-black font-header font-black uppercase italic tracking-widest rounded-2xl hover:shadow-lg hover:shadow-neon-blue/20 transition-all"
              >
                REINICIAR BÚSQUEDA
              </button>
            </div>
          ) : (
            paginatedData.map((item) => (
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
                      <div
                        className={`w-24 h-24 rounded-[2.5rem] bg-gradient-to-br ${TAG_CONFIG[item.types[0]]?.gradient || 'from-white/10 to-transparent'} p-px group-hover:scale-105 transition-transform shadow-lg shadow-black/40`}
                      >
                        <div className="w-full h-full rounded-[2.4rem] bg-black/80 flex items-center justify-center backdrop-blur-xl">
                          <div className={`w-10 h-10 ${TAG_CONFIG[item.types[0]]?.color || 'text-white'}`}>
                            {entryIcon(item)}
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
                            {item.types.map((t) => (
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
                          <h2 className="text-3xl md:text-4xl font-header font-black text-white group-hover:text-neon-cyan transition-colors uppercase italic tracking-tighter leading-none">
                            {item.title}
                          </h2>
                          <p className="text-white/40 text-sm font-bold italic leading-relaxed max-w-xl">{item.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {item.details.slice(0, 4).map((detail, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/detail"
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 group-hover/detail:scale-150 transition-transform ${
                                  TAG_CONFIG[detail.type]?.color || 'bg-white/40'
                                }`}
                              />
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
                        DETALLES
                        <div className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform">{I.arrow}</div>
                      </Link>

                      <button
                        onClick={() => handleLike(item.id)}
                        aria-pressed={likes.isLiked(item.id)}
                        aria-label={`Me gusta de ${item.version}`}
                        className={`flex flex-col items-center gap-1 group/like p-2 transition-colors ${
                          likes.isLiked(item.id) ? 'text-neon-pink' : 'hover:text-neon-pink'
                        }`}
                      >
                        <div className="w-6 h-6 group-hover/like:scale-125 transition-transform">{I.heart}</div>
                        <span className="text-[10px] font-mono font-black text-white/30 group-hover/like:text-neon-pink">
                          {likes.getLikes(item.id, item.likes)}
                        </span>
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
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={page.page === 1}
            aria-label="Página anterior"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white disabled:opacity-0 transition-all"
          >
            <div className="w-5 h-5 rotate-180">{I.arrow}</div>
          </button>

          {Array.from({ length: page.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              aria-current={n === page.page ? 'page' : undefined}
              className={`w-12 h-12 rounded-xl font-header font-black transition-all border ${
                n === page.page ? 'bg-neon-purple border-neon-purple text-white shadow-neon-purple' : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(page.totalPages, prev + 1))}
            disabled={page.page === page.totalPages}
            aria-label="Página siguiente"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white disabled:opacity-0 transition-all"
          >
            <div className="w-5 h-5">{I.arrow}</div>
          </button>
        </div>

        {/* --- HOJA DE RUTA --- */}
        <Section className="space-y-8 mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter flex items-center justify-center md:justify-start gap-3">
                <div className="w-8 h-8 text-neon-pink">{I.target}</div>
                HOJA DE RUTA
              </h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
                El futuro de Ciszu Network en construcción
              </p>
            </div>
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Progreso Global</span>
              </div>
              <div className="text-neon-blue font-black">{globalProgress}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {phases.map((phase) => {
              const isCurrent = phase.status === 'current';
              const progress = getPhaseProgress(phase);
              return (
                <div
                  key={phase.id}
                  className={`p-8 rounded-[2.5rem] relative overflow-hidden group transition-colors ${
                    isCurrent
                      ? 'bg-gradient-to-br from-neon-blue/20 to-transparent border border-neon-blue/30'
                      : 'bg-white/5 border border-white/5 hover:border-neon-blue/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h3 className={`text-2xl font-header font-black uppercase italic ${isCurrent ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors`}>
                        {phase.name}
                      </h3>
                      <span
                        className={`text-[10px] font-black tracking-[0.3em] uppercase ${
                          isCurrent ? 'text-neon-blue' : 'text-white/20 group-hover:text-neon-cyan'
                        } transition-colors`}
                      >
                        {isCurrent ? 'En Desarrollo' : 'Planificado'}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/5 text-white/20'}`}>
                      <div className="w-5 h-5">{isCurrent ? I.settings : I.layers}</div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div
                      className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progreso de ${phase.name}`}
                    >
                      <div
                        className={`h-1.5 rounded-full ${isCurrent ? 'bg-neon-blue' : 'bg-white/20'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="space-y-3">
                      {phase.tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-3 group/task">
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                              task.done
                                ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                                : 'bg-white/5 border-white/10 text-white/20 group-hover/task:border-white/30'
                            }`}
                          >
                            {task.done ? <div className="w-3 h-3">{I.check}</div> : <div className="w-2 h-2 rounded-sm bg-white/20" />}
                          </div>
                          <p
                            className={`text-xs font-bold leading-relaxed ${
                              task.done ? 'text-white/60 line-through decoration-white/20' : 'text-white/80'
                            }`}
                          >
                            {task.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {currentPhase && (
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Fase activa: {currentPhase.name} · {getPhaseProgress(currentPhase)}%
            </p>
          )}
        </Section>

        {/* --- GLOSARIO --- */}
        <Section className="p-12 bg-black/40 border border-white/5 rounded-[4rem] space-y-12 relative overflow-hidden mb-20">
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">GLOSARIO DE NODOS</h2>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
              Diccionario técnico de actualizaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {CHANGELOG_GLOSSARY.map((cat) => (
              <div
                key={cat.type}
                className="flex gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group"
              >
                <div className="shrink-0 pt-1 group-hover:scale-110 transition-transform">
                  <div className={`w-8 h-8 ${TAG_CONFIG[cat.type]?.color || 'text-white'}`}>
                    {TAG_CONFIG[cat.type]?.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-header font-black text-white uppercase italic tracking-tighter text-sm">
                    {TAG_CONFIG[cat.type]?.label || cat.type}
                  </h4>
                  <p className="text-[10px] text-white/40 font-bold leading-tight">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* --- PROTOCOLOS / DOCS CTA --- */}
        <Section className="p-px rounded-[4rem] bg-gradient-to-r from-neon-blue/30 via-neon-blue/20 to-transparent mb-20">
          <div className="bg-black/60 p-12 rounded-[3.9rem] text-center border border-white/5 relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute inset-0 bg-neon-blue/5 animate-pulse pointer-events-none" />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">
                ¿SISTEMA EN EVOLUCIÓN?
              </h2>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest max-w-md mx-auto italic">
                Antes de iniciar un dock rápido, revisa los protocolos de documentación: arquitectura, convenciones y
                flujo de despliegue del ecosistema.
              </p>
              <Link
                href="/documentation"
                className="inline-flex items-center gap-3 text-neon-blue font-black uppercase text-[10px] tracking-[0.4em] pb-1 border-b-2 border-neon-blue/30 hover:border-neon-blue hover:gap-6 transition-all group"
              >
                VER PROTOCOLOS
                <div className="w-4 h-4">{I.arrow}</div>
              </Link>
            </div>
          </div>
        </Section>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </div>
    </div>
  );
}
