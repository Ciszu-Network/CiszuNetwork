'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CHANGELOG_DATA } from '@/data/changelog';
import { I, TAG_CONFIG } from '@/config/changelogIcons';
import { useAppStore } from '@/store/useAppStore';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { usePageTitle } from '@/lib/usePageTitle';
 
export default function ChangelogDetail() {
  usePageTitle('CHANGELOG');
  const { id } = useParams();
  const { showToast } = useAppStore();
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const mostRecentId = useMemo(() => {
    return CHANGELOG_DATA.reduce((latest, item) =>
      new Date(item.date) > new Date(latest.date) ? item : latest
    , CHANGELOG_DATA[0]).id;
  }, []);
  const item = CHANGELOG_DATA.find(i => i.id === id);

  if (!item) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <h1 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">VERSIÓN NO ENCONTRADA</h1>
          <Link href="/changelog" className="text-neon-blue font-black tracking-widest uppercase text-xs pb-1 border-b border-neon-blue/40 hover:border-neon-blue transition-all">Volver al Registro Maestro</Link>
        </div>
      </MainLayout>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  // Primary tag for the main icon / gradient theme
  const primaryTag = TAG_CONFIG[item.types[0]] || TAG_CONFIG['feat'];

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className={`absolute top-1/2 left-0 w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-20 bg-gradient-to-tr ${primaryTag.gradient}`} />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-0 pb-32 space-y-16">
        
        {/* --- BACK BUTTON --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8">
           <Link href="/changelog" className={`inline-flex items-center gap-4 font-black uppercase text-[10px] tracking-[0.4em] group ${primaryTag.color}`}>
              <div className="w-6 h-6 group-hover:-translate-x-2 transition-transform">{I.back || I.arrow}</div>
              VOLVER AL REGISTRO
           </Link>
        </motion.div>

        {/* --- HERO / METADATA DOCK --- */}
        <motion.header initial="hidden" animate="visible" variants={sectionVariants} className="relative group">
           <div className={`absolute -inset-1 bg-gradient-to-r ${primaryTag.gradient} rounded-[4rem] blur opacity-10 group-hover:opacity-20 transition duration-1000`} />
           <div className="relative bg-doc-dark border border-white/5 rounded-[4rem] p-12 md:p-16 flex flex-col items-center text-center space-y-10 overflow-hidden shadow-2xl backdrop-blur-3xl">
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-bl ${primaryTag.gradient}`} />
              
              {/* NEW LABEL - TOP LEFT CORNER BANNER */}
              {item.id === mostRecentId && (
                 <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-full h-10 bg-green-500 text-black text-[11px] font-black flex items-center justify-center uppercase tracking-[0.4em] rotate-[-45deg] translate-x-[-30%] translate-y-[45%] shadow-lg shadow-green-500/20">
                       NUEVO
                    </div>
                 </div>
              )}

              <div className={`w-24 h-24 p-6 rounded-3xl bg-black/60 border border-white/10 ${primaryTag.color} group-hover:scale-110 transition-transform flex items-center justify-center relative z-10`}>
                 <div className="w-full h-full">{primaryTag.icon}</div>
              </div>

              <div className="space-y-6 relative z-10 w-full">
                 <div className="flex flex-wrap items-center justify-center gap-4">
                    <span className={`px-5 py-1.5 rounded-full bg-white/5 ${primaryTag.color} text-[10px] font-black uppercase tracking-widest border border-white/10`}>
                       VERSIÓN {item.version}
                    </span>
                    <span className="text-gray-600 font-black uppercase text-[11px] tracking-widest italic">{item.date}</span>
                    
                    {/* ENHANCED AUTHOR BADGE */}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-widest">
                       <div className="w-3 h-3 text-neon-blue">{I.user}</div>
                       <span>{item.author}</span>
                    </div>
                 </div>
                 
                 <h1 className="text-4xl md:text-7xl font-header font-black text-white italic tracking-tighter uppercase leading-none [-webkit-text-stroke:1px_rgba(255,255,255,0.05)]">
                    {item.title}
                 </h1>
              </div>

              {/* LIKES & ACTIONS ROW */}
              <div className="flex flex-wrap justify-center items-center gap-6 relative z-10">
                 {/* LIKE BUTTON */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAuthWarningOpen(true);
                    }}
                   className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-pink hover:bg-neon-pink/10 transition-all group/like"
                 >
                    <div className="w-5 h-5 text-white/30 group-hover/like:text-neon-pink group-hover/like:scale-110 transition-all">{I.heart}</div>
                    <span className="text-[12px] font-mono font-black text-white/50 group-hover/like:text-neon-pink">{item.likes || 0} LIKES</span>
                 </button>

                 <div className="h-8 w-px bg-white/10" />

                 {/* TAGS */}
                 <div className="flex flex-wrap gap-2">
                    {item.types.map((type) => {
                       const tCfg = TAG_CONFIG[type];
                       if(!tCfg) return null;
                       return (
                          <div key={type} className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 ${tCfg.color}`}>
                             <div className="w-4 h-4">{tCfg.icon}</div>
                             <span className="text-[10px] font-black uppercase tracking-widest italic">{tCfg.label}</span>
                          </div>
                       );
                    })}
                 </div>
              </div>

              <div className="max-w-3xl w-full mx-auto p-8 bg-black/40 rounded-[2.5rem] border border-white/5 relative group/quote mt-8">
                 <div className={`absolute -top-4 -left-4 w-10 h-10 opacity-20 transform rotate-12 ${primaryTag.color}`}>{primaryTag.icon}</div>
                 <p className="text-gray-300 text-lg md:text-xl font-bold italic leading-relaxed tracking-tight group-hover/quote:text-white transition-colors">
                    &quot;{item.description}&quot;
                 </p>
              </div>
           </div>
        </motion.header>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
           
           {/* TECHNICAL DETAILS DOCK */}
           <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="p-12 bg-doc-dark border border-white/10 rounded-[4.5rem] shadow-xl space-y-12 relative overflow-hidden flex flex-col lg:col-span-2">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${primaryTag.gradient} opacity-40`} />
              <div className="flex items-center gap-5">
                 <div className={`w-10 h-10 ${primaryTag.color}`}>{I.code}</div>
                 <h3 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">BITÁCORA TÉCNICA</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                 {item.details.map((detail, i) => {
                    const dCfg = TAG_CONFIG[detail.type] || primaryTag;
                    return (
                       <div key={i} className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group/detail">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform group-hover/detail:scale-110 ${dCfg.color}`}>
                                <div className="w-4 h-4">{dCfg.icon}</div>
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${dCfg.color}`}>
                                {dCfg.label}
                             </span>
                          </div>
                          <p className="text-white/60 font-bold text-sm leading-relaxed tracking-tight group-hover/detail:text-white transition-colors">
                             {detail.text}
                          </p>
                       </div>
                    );
                 })}
              </div>
           </motion.section>

        </div>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </div>
    </MainLayout>
  );
}
