'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import QuickDocks from '@/components/molecules/QuickDocks';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { CHANGELOG_DATA as CHANGELOG_STATIC } from '@/data/changelog';
import { I, TAG_CONFIG } from '@/config/changelogIcons';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAppStore } from '@/store';
import { useChangelogLikes, usePublishedChangelogs, useToast } from '@ciszu/ui';
import {
  getChangelogById,
  getMostRecentId,
  getRelatedChangelog,
  mergeChangelogSources,
} from '@ciszunetwork/utils/changelog';


/** Icono de una entrada: usa el icono publicado (devcon) si existe. */
const entryIcon = (item: { icon?: string; types: string[] }) =>
  (item.icon && (I as Record<string, React.ReactNode>)[item.icon]) ||
  TAG_CONFIG[item.types[0] as keyof typeof TAG_CONFIG]?.icon ||
  I.history;

export default function ChangelogDetailPage() {
  usePageTitle('CHANGELOG');
  const params = useParams<{ id: string }>();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user } = useAppStore();
  const { toast } = useToast();
  const likes = useChangelogLikes();
  // Entradas publicadas desde el devcon (almacén en vivo) + las del código.
  const published = usePublishedChangelogs('ciszubot');
  const CHANGELOG_DATA = useMemo(
    () => mergeChangelogSources(published.entries, CHANGELOG_STATIC),
    [published.entries],
  );
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);

  const item = useMemo(() => getChangelogById(CHANGELOG_DATA, idParam), [idParam, CHANGELOG_DATA]);
  const mostRecentId = useMemo(() => getMostRecentId(CHANGELOG_DATA), [CHANGELOG_DATA]);
  const related = useMemo(
    () => (item ? getRelatedChangelog(item, CHANGELOG_DATA, 3) : []),
    [item, CHANGELOG_DATA],
  );

  const handleLike = () => {
    if (!item) return;
    if (!user) {
      setIsAuthWarningOpen(true);
      return;
    }
    likes.toggleLike(item.id);
    if (!likes.isLiked(item.id)) {
      toast('Like guardado en este dispositivo.', 'info');
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 text-white/20">{I.alert}</div>
          <h1 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">
            VERSIÓN NO ENCONTRADA
          </h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
            La entrada solicitada no existe en el registro
          </p>
          <Link
            href="/changelog"
            className="text-neon-blue font-black tracking-widest uppercase text-xs pb-1 border-b border-neon-blue/40 hover:border-neon-blue transition-all"
          >
            Volver al registro maestro
          </Link>
        </div>
      </div>
    );
  }

  const primaryTag = TAG_CONFIG[item.types[0]] || TAG_CONFIG.feat;
  const isNew = item.id === mostRecentId;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* --- BACK --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Link
            href="/changelog"
            className={`inline-flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.4em] group ${primaryTag.color}`}
          >
            <div className="w-5 h-5 group-hover:-translate-x-2 transition-transform">{I.back}</div>
            VOLVER AL REGISTRO
          </Link>
        </motion.div>

        {/* --- HERO --- */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-16"
        >
          <div className={`absolute -inset-1 bg-gradient-to-r ${primaryTag.gradient} rounded-[3.5rem] blur opacity-10`} />
          <div className="relative bg-black/80 border border-white/5 rounded-[3.5rem] p-10 md:p-14 flex flex-col items-center text-center space-y-8 overflow-hidden">
            {isNew && (
              <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-full h-10 bg-green-500 text-black text-[11px] font-black flex items-center justify-center uppercase tracking-[0.4em] rotate-[-45deg] translate-x-[-30%] translate-y-[45%]">
                  NUEVO
                </div>
              </div>
            )}

            <div className={`w-20 h-20 p-5 rounded-3xl bg-black/60 border border-white/10 ${primaryTag.color} flex items-center justify-center relative z-10`}>
              <div className="w-full h-full">{entryIcon(item)}</div>
            </div>

            <div className="space-y-5 relative z-10 w-full">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className={`px-5 py-1.5 rounded-full bg-white/5 ${primaryTag.color} text-[10px] font-black uppercase tracking-widest border border-white/10`}>
                  VERSIÓN {item.version}
                </span>
                <span className="text-white/30 font-black uppercase text-[11px] tracking-widest italic">{item.date}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {item.code}
                </span>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  <div className="w-3 h-3 text-neon-blue">{I.user}</div>
                  <span>{item.author}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-header font-black text-white italic tracking-tighter uppercase leading-none">
                {item.title}
              </h1>
            </div>

            {/* LIKES + TAGS */}
            <div className="flex flex-wrap justify-center items-center gap-6 relative z-10">
              <button
                onClick={handleLike}
                aria-pressed={likes.isLiked(item.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border transition-all group/like ${
                  likes.isLiked(item.id) ? 'border-neon-pink text-neon-pink' : 'border-white/10 hover:border-neon-pink'
                }`}
              >
                <div className="w-5 h-5 group-hover/like:scale-110 transition-all">{I.heart}</div>
                <span className="text-[12px] font-mono font-black text-white/50 group-hover/like:text-neon-pink">
                  {likes.getLikes(item.id, item.likes)} LIKES
                </span>
              </button>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex flex-wrap gap-2">
                {item.types.map((type) => {
                  const tCfg = TAG_CONFIG[type];
                  if (!tCfg) return null;
                  return (
                    <div key={type} className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 ${tCfg.color}`}>
                      <div className="w-4 h-4">{tCfg.icon}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{tCfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="max-w-3xl w-full mx-auto p-8 bg-black/40 rounded-[2.5rem] border border-white/5 relative">
              <div className={`absolute -top-4 -left-4 w-10 h-10 opacity-20 transform rotate-12 ${primaryTag.color}`}>
                {entryIcon(item)}
              </div>
              <p className="text-gray-300 text-lg md:text-xl font-bold italic leading-relaxed tracking-tight">
                &quot;{item.description}&quot;
              </p>
            </div>
          </div>
        </motion.header>

        {/* --- BITÁCORA TÉCNICA --- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="p-10 md:p-12 bg-black/60 border border-white/10 rounded-[3.5rem] space-y-10 relative overflow-hidden mb-12"
        >
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${primaryTag.gradient} opacity-40`} />
          <div className="flex items-center gap-5">
            <div className={`w-10 h-10 ${primaryTag.color}`}>{I.code}</div>
            <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">
              BITÁCORA TÉCNICA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {item.details.map((detail, i) => {
              const dCfg = TAG_CONFIG[detail.type] || primaryTag;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group/detail"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover/detail:scale-110 transition-transform ${dCfg.color}`}>
                      <div className="w-4 h-4">{dCfg.icon}</div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dCfg.color}`}>{dCfg.label}</span>
                  </div>
                  <p className="text-white/60 font-bold text-sm leading-relaxed tracking-tight group-hover/detail:text-white transition-colors">
                    {detail.text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* --- INFO ENLAZADA --- */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-6 mb-12"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 text-neon-cyan">{I.layers}</div>
              <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">
                INFO ENLAZADA
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => {
                const relTag = TAG_CONFIG[rel.types[0]] || primaryTag;
                return (
                  <Link
                    key={rel.id}
                    href={`/changelog/${rel.id}`}
                    className="group p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-neon-blue/40 hover:bg-white/10 transition-all flex flex-col gap-3"
                  >
                    <div className={`w-8 h-8 ${relTag.color}`}>{relTag.icon}</div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{rel.version}</span>
                    <span className="text-sm font-header font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-neon-cyan transition-colors">
                      {rel.title}
                    </span>
                    <span className="text-[10px] font-bold text-white/40 line-clamp-2">{rel.description}</span>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* --- PROTOCOLOS / DOCS CTA --- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="p-px rounded-[4rem] bg-gradient-to-r from-neon-blue/30 via-neon-blue/20 to-transparent mb-20"
        >
          <div className="bg-black/60 p-12 rounded-[3.9rem] text-center border border-white/5 relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute inset-0 bg-neon-blue/5 animate-pulse pointer-events-none" />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">
                ¿NECESITAS EL CONTEXTO COMPLETO?
              </h2>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest max-w-md mx-auto italic">
                Los protocolos de documentación explican la arquitectura y el flujo de despliegue detrás de cada entrada.
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
        </motion.section>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </div>
    </div>
  );
}
