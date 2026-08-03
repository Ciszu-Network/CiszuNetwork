'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Pure SVG Icon Library ---
const I = {
  forum: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  messageSquare: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  arrowRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

export default function ForumPage() {
  const categories = [
    { title: 'General', desc: 'Discusión general sobre MuzicMania.', count: 124, icon: I.messageSquare, color: 'blue' },
    { title: 'Música & Charts', desc: 'Comparte tus canciones y mapeos.', count: 85, icon: I.zap, color: 'purple' },
    { title: 'Soporte Técnico', desc: 'Ayuda con errores y rendimiento.', count: 42, icon: I.users, color: 'pink' },
    { title: 'Sugerencias', desc: 'Propuestas para futuras versiones.', count: 67, icon: I.star, color: 'cyan' },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen overflow-hidden">
        {/* BLURRED CONTENT */}
        <div className="blur-[15px] pointer-events-none opacity-40 select-none transition-all duration-1000 grayscale-[0.5]">
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[200px] animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-20">
            <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
              <div className="flex flex-col items-center gap-1 text-center">
                 <div className="flex items-center justify-center gap-6 group">
                    <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                       {I.forum}
                    </div>
                    <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-purple via-white to-neon-blue bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                      FORO
                    </h1>
                 </div>
                 <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
                   El epicentro de la subcultura rítmica
                 </p>
              </div>
            </motion.header>

            <motion.section className="space-y-12">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
                <div className="relative flex-1 max-w-md group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl blur opacity-10 group-hover:opacity-25 transition" />
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500">
                      {I.search}
                    </div>
                    <input type="text" disabled placeholder="BUSCAR DISCUSIÓN..." className="w-full bg-doc-dark border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-xs font-black uppercase tracking-widest outline-none" />
                  </div>
                </div>
                <button disabled className="px-8 py-5 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                  NUEVO TEMA
                  <div className="w-4 h-4">{I.zap}</div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((cat, i) => (
                  <div key={i} className="group relative p-1 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent">
                    <div className="bg-doc-dark p-10 rounded-[2.9rem] border border-white/5 flex items-start gap-8 h-full">
                      <div className={`p-5 rounded-2xl bg-white/5 text-white/20`}>
                        <div className="w-8 h-8">{cat.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-header font-black italic uppercase tracking-tighter text-white/20">{cat.title}</h3>
                          <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.1em] mt-1">{cat.count} TEMAS</span>
                        </div>
                        <p className="text-white/10 text-sm font-bold mb-8 leading-relaxed italic">{cat.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        {/* --- COMING SOON OVERLAY --- */}
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0, y: 50 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ type: 'spring', damping: 20, stiffness: 100 }}
             className="relative w-full max-w-2xl bg-black border-4 border-neon-blue/40 p-16 rounded-[5rem] text-center space-y-10 shadow-[0_0_150px_rgba(39,158,255,0.3)] backdrop-blur-3xl overflow-hidden"
           >
              {/* Animated corner glows */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-neon-blue/20 rounded-full blur-[60px] animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-neon-purple/20 rounded-full blur-[60px] animate-pulse" />

              <div className="relative group">
                  <div className="w-32 h-32 bg-black border-4 border-neon-blue rounded-full flex items-center justify-center mx-auto text-neon-blue shadow-[0_0_40px_rgba(39,158,255,0.5)] relative z-10 animate-float">
                     <div className="w-16 h-16">{I.lock}</div>
                  </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <h2 className="text-5xl md:text-7xl font-header font-black text-white uppercase italic tracking-tighter">
                   ACCESO <span className="text-neon-blue drop-shadow-neon-blue">RESTRINGIDO</span>
                 </h2>
                 <div className="h-1 w-32 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded-full" />
                 <p className="text-white/60 font-bold uppercase text-base leading-relaxed tracking-[0.25em] max-w-md mx-auto">
                   El sistema de foros comunitarios <span className="text-white">no estará disponible</span> durante esta fase de la Beta.
                 </p>
                 <p className="text-neon-blue font-black uppercase text-[10px] tracking-[0.8em] animate-pulse">Desarrollo en curso</p>
              </div>

              <div className="flex flex-col gap-6 pt-6 relative z-10">
                 <Link href="/" className="w-full h-20 bg-neon-blue text-black rounded-[2.5rem] font-header font-black uppercase tracking-[0.3em] text-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(39,158,255,0.3)]">
                    REGRESAR AL INICIO
                 </Link>
                 <p className="text-white/20 font-black uppercase text-[9px] tracking-[0.5em]">Estado del Sistema: Hibernación Beta v0.9.0</p>
              </div>
           </motion.div>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
