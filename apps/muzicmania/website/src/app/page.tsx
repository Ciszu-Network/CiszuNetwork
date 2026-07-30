"use client";
import { supabase } from '@/config/supabase';
import { resolveAssetPath } from '@ciszunetwork/cdn';

import React, { useState, useEffect } from 'react';
import { FloatingSymbols } from "@/components/molecules/FloatingSymbols";
import { StatsTicker } from "@/components/molecules/StatsTicker";
import { Music, Star, MessageSquare, ArrowRight, Keyboard, Target, Users, FileText, History, Play } from 'lucide-react';
import QuickDocks from '@/components/molecules/QuickDocks';
import Image from "next/image";
import Link from "next/link";
import { CHANGELOG_DATA } from '@/data/changelog';
import { TRACKS_DATA } from '@/data/tracks';
import { FlagVE } from '@/components/atoms/FlagVE';
import { I, TAG_CONFIG } from '@/config/changelogIcons';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import { isTauri } from '@/lib/isTauri';
import AuthWarningModal from '@/components/shared/AuthWarningModal';

export default function Home() {
  const router = useRouter();
  const { showToast, isMusicPlaying, playGlobalMusic } = useAppStore();
  const [realStats, setRealStats] = useState<Record<string, { plays: number, likes: number }>>({});
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);

  useEffect(() => {
    setIsDesktopApp(isTauri());
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAuthWarningOpen(true);
  };

  const handleStartMusic = () => {
    if (!isMusicPlaying) {
      playGlobalMusic();
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('track_stats')
        .select('track_id, play_count, like_count');
      
      if (!error && data) {
        const statsMap: Record<string, { plays: number, likes: number }> = {};
        data.forEach((s: any) => {
          statsMap[s.track_id] = { plays: s.play_count, likes: s.like_count };
        });
        setRealStats(statsMap);
      }
    };
    fetchStats();
  }, []);

  return (
    <div onClick={handleStartMusic} className="cursor-default min-h-screen">
      <FloatingSymbols />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Deep radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(40,0,90,0.45)_0%,rgba(0,10,30,0.2)_60%,transparent_100%)] pointer-events-none" />


          {/* Animated reticular grid & glass notes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* CSS-only decorative visualizer bars edge-to-edge */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-25 pointer-events-none">
              <div className="w-full h-full flex items-end gap-[2px]">
                {Array.from({ length: 96 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-transparent to-neon-blue/40"
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 25 + Math.cos(i * 1.1) * 15 + 20}%`,
                      animation: `visualizerWave ${1.5 + Math.sin(i * 0.4) * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.04}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Base Light Grid */}
          <div className="absolute inset-0 animate-grid-shift opacity-50"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.15) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Varied Colored Overlay Grid (Blue/Purple) */}
          <div className="absolute inset-0 animate-grid-shift opacity-20 mix-blend-color"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,212,255,0.8) 0px, rgba(0,212,255,0.8) 48px, rgba(145,70,255,0.8) 48px, rgba(145,70,255,0.8) 96px)',
              backgroundSize: '96px 96px',
            }}
          />

          {/* Floating color blobs that shift */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-blue/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-neon-pink/10 rounded-full blur-[80px] animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-4 flex-wrap group cursor-pointer">
            <Image
              src={resolveAssetPath('apps/muzicmania/content/logos/imagen/not outline/logotipo/degradado/color/muzicmania_logotipo_degradado_color.svg')}
              alt="MuzicMania"
              width={380}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(0,128,255,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(0,128,255,0.8)] group-hover:drop-shadow-[0_0_60px_rgba(145,70,255,0.6)] transition-all duration-500 animate-float"
            />
            <Image
              src={resolveAssetPath('apps/muzicmania/content/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
              alt="Logo"
              width={100}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(145,70,255,0.5)] group-hover:drop-shadow-[0_0_40px_rgba(145,70,255,0.8)] group-hover:drop-shadow-[0_0_60px_rgba(0,128,255,0.6)] transition-all duration-500 animate-float-delayed"
            />
          </div>

          <p className="text-xl md:text-2xl text-neon-sky font-accent mb-4 text-shadow-neon-cyan">
            Música, neón y precisión competitiva. Domina el bit en la dimensión definitiva donde cada nota cuenta.
          </p>

          <div className="flex gap-4 flex-wrap justify-center mb-5">
            <Link
              href="/play"
              className="flex items-center gap-2 px-8 py-4 bg-green-950/40 text-white font-black rounded-lg border-2 border-green-500 hover:bg-green-800 hover:scale-105 transition-all text-lg font-header shadow-[0_0_20px_rgba(0,255,100,0.3)] hover:shadow-[0_0_30px_rgba(0,255,100,0.5)]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              JUGAR COMO INVITADO
            </Link>
            <Link href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-red-950/40 text-white font-black rounded-lg border-2 border-red-500 hover:bg-red-800 hover:scale-105 transition-all text-lg font-header shadow-[0_0_20px_rgba(255,0,80,0.3)] hover:shadow-[0_0_30px_rgba(255,0,80,0.5)]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              REGISTRARSE O INGRESAR
            </Link>
          </div>

          {/* BOTÓN DESCARGAR MUZICMANIA */}
          {!isDesktopApp && (
            <div className="flex justify-center mt-2">
              <Link
                href="/download"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-neon-purple/20 text-white font-black rounded-2xl border-2 border-neon-purple/50 hover:bg-neon-purple hover:border-neon-purple transition-all duration-300 text-base font-header shadow-[0_0_25px_rgba(145,70,255,0.2)] hover:shadow-[0_0_45px_rgba(145,70,255,0.5)] hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="relative z-10 tracking-[0.15em]">DESCARGAR MUZICMANIA</span>
              </Link>
            </div>
          )}

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-5">
            <Link href="#ecosystem" className="w-10 h-10 border-2 border-neon-blue rounded-full flex items-center justify-center text-neon-blue animate-bounce hover:text-neon-pink hover:border-neon-pink transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <StatsTicker />

      {/* Ecosystem Section */}
      <section id="ecosystem" className="pt-24 pb-12 container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center gap-6 mb-2">
            <Star className="w-16 h-16 text-neon-blue drop-shadow-neon-blue shrink-0" />
            <h2 className="text-4xl md:text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent py-2 uppercase leading-none whitespace-nowrap flex items-center justify-center gap-4">
              El Ecosistema Rítmico
            </h2>
          </div>
          <p className="text-white max-w-2xl mx-auto opacity-90 uppercase text-xs tracking-widest">Descubre un mundo diseñado para los amantes de la música y la estética retro-futurista.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {([
            {
              icon: () => <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2v20"/><path d="M12 18H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8"/><circle cx="8" cy="12" r="3"/><path d="M16 12V2l4 2"/></svg>,
              title: 'Visuales Reactivos', color: 'cyan',
              desc: 'Cada beat se traduce en espectrogramas y ondas de neón que reaccionan en tiempo real a la música.'
            },
            {
              icon: Keyboard,
              title: 'Mecánica Mania', color: 'purple',
              desc: 'Un sistema de 4 teclas diseñado para desafiar tu precisión y velocidad al máximo nivel.'
            },
            {
              icon: () => <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
              title: 'Sincronía Global', color: 'pink',
              desc: 'Sube en el ranking mundial y demuestra quién es el verdadero maestro del ritmo.'
            },
          ] as { icon: React.FC<{className?:string}>|typeof Keyboard; title: string; color: string; desc: string }[]).map((f, i) => (
            <div key={i} className={`p-10 rounded-3xl bg-doc-dark border-2 border-white/5 backdrop-blur-xl transition-all group active-depth hover:-translate-y-2 hover-glow-${f.color} border-neon-${f.color}/20`}>
              <div className={`mb-6 flex justify-center text-neon-${f.color} drop-shadow-neon-${f.color}`}>
                <f.icon className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-header font-bold mb-4 text-center text-white italic">{f.title}</h3>
              <p className="text-gray-400 text-center uppercase text-[10px] tracking-widest">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Community Section */}
      <section className="pt-12 pb-12 bg-gradient-to-b from-transparent to-black/80">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 rounded-3xl bg-doc-dark border-2 border-neon-blue/30 backdrop-blur-xl hover:hover-glow-blue transition-all group active-depth">
            <h2 className="text-4xl font-header font-bold mb-8 flex items-center justify-center gap-6 text-neon-blue uppercase tracking-tight text-center italic">
              <div className="p-4 bg-neon-blue/10 rounded-2xl drop-shadow-neon-blue">
                <Target className="w-10 h-10" />
              </div>
              Nuestra Misión
            </h2>
            <div className="space-y-6">
              <p className="text-gray-200 text-lg leading-relaxed text-center italic">
              En MuzicMania, el ritmo es el lenguaje universal del alma digital. Una plataforma de alto rendimiento diseñada por **Ciszu Network**, donde la precisión técnica y el arte visual convergen en una experiencia audiovisual definitiva.
              </p>
              <p className="text-gray-400 leading-relaxed text-center uppercase text-[10px] tracking-widest opacity-60">
                Optimizamos cada milisegundo de respuesta para que tu pulso sea uno con el beat.
              </p>
            </div>
          </div>

          <div className="p-10 rounded-3xl bg-doc-dark border-2 border-neon-pink/30 backdrop-blur-xl hover:hover-glow-pink transition-all group active-depth">
            <h2 className="text-4xl font-header font-bold mb-8 flex items-center justify-center gap-6 text-neon-pink uppercase tracking-tight text-center italic">
              <div className="p-4 bg-neon-pink/10 rounded-2xl drop-shadow-neon-pink">
                <Users className="w-10 h-10" />
              </div>
              Nexo de la Comunidad
            </h2>
            <div className="space-y-6 text-center">
              <p className="text-gray-200 text-lg leading-relaxed italic">
                MuzicMania es alimentado por una comunidad global de ritmistas, desarrolladores y artistas. Tu feedback directo moldea el futuro de cada innovación que liberamos.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-6">
                {[
                  { name: 'Discord', href: 'https://discord.gg/W3kMtMMj6E', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>, cls: 'btn-social-discord hover-glow-discord' },
                  { name: 'X / Twitter', href: 'https://x.com/CiszukoAntony', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={`${props.className} w-4 h-4`}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, cls: 'btn-social-x hover-glow-x' },
                  { name: 'YouTube', href: 'https://www.youtube.com/@CiszuNetwork', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432 L15.818 12l-6.273 3.568z"/></svg>, cls: 'btn-social-youtube hover-glow-youtube' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all active-depth group font-black uppercase text-xs tracking-widest ${s.cls}`}>
                    <s.icon className="w-5 h-5" />
                    <span>{s.name === 'Discord' ? 'Discord Server' : s.name}</span>
                  </a>
                ))}
              </div>
              <div className="pt-8 border-t border-white/5 mt-8 flex justify-center">
                <Link href="/about" className="block w-full text-center py-4 bg-electric-blue text-white font-black rounded-xl shadow-lg hover-glow-blue hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs max-w-sm mx-auto flex items-center justify-center gap-3">
                  VER MÁS INFORMACIÓN
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identification & Trending Section */}
      <section className="pt-12 pb-24 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-header font-black flex items-center gap-4 text-white uppercase tracking-tighter italic">
                <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple drop-shadow-neon-purple">
                  <History className="w-8 h-8" />
                </div>
                Nuevas Innovaciones
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              {CHANGELOG_DATA.slice(0, 3).map((item, i) => (
                <div 
                  key={item.id} 
                  onClick={() => router.push(`/changelog/${item.id}`)}
                  className="group relative p-1 rounded-3xl bg-gradient-to-br from-white/5 to-transparent hover:from-neon-purple/20 transition-all duration-500 overflow-hidden cursor-pointer"
                >
                  <div className="bg-doc-dark/80 backdrop-blur-xl p-5 rounded-[1.4rem] border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
                    {i === 0 && (
                      <div className="absolute -right-8 top-4 rotate-45 bg-neon-pink text-black font-header font-black px-8 py-0.5 text-[8px] tracking-[0.2em] shadow-neon-pink z-20">
                        NUEVO
                      </div>
                    )}
                    
                    {/* Like Button */}
                    <button onClick={handleLike} className="flex flex-col items-center justify-center min-w-[50px] p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-neon-pink/30 hover:bg-neon-pink/5 transition-all group/like z-10 cursor-pointer">
                      <div className="text-neon-pink mb-1 w-5 h-5 group-hover/like:scale-110 transition-transform">{I.heart}</div>
                      <span className="text-xs font-black text-white group-hover/like:text-neon-pink transition-colors">{item.likes || 0}</span>
                    </button>

                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                         <span className="px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple text-[8px] font-black uppercase tracking-widest border border-neon-purple/20">
                            {item.version}
                         </span>
                         <span className="text-white/20 text-[8px] font-black uppercase tracking-widest italic">{item.date}</span>
                         {/* Tags */}
                         <div className="flex gap-2 ml-auto md:ml-0 flex-wrap">
                            {item.types.slice(0, 2).map((type, idx) => {
                              const tagCfg = TAG_CONFIG[type];
                              if (!tagCfg) return null;
                              return (
                                <span key={idx} className={`px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/10 ${tagCfg.color}`}>
                                  {tagCfg.label}
                                </span>
                              );
                            })}
                         </div>
                      </div>
                      <h4 className="font-black text-white text-lg lg:text-xl uppercase tracking-tight italic group-hover:text-neon-cyan transition-colors truncate">
                         {item.title}
                      </h4>
                      <p className="text-white/40 text-xs font-medium leading-relaxed line-clamp-1 md:line-clamp-2">
                         {item.description}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:bg-neon-purple group-hover:text-white transition-all shrink-0 self-end md:self-center">
                       <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/changelog" className="group relative flex items-center justify-center gap-4 w-full py-6 bg-doc-dark border-2 border-neon-blue/30 rounded-[2rem] text-white font-header font-black uppercase tracking-[0.3em] text-[10px] overflow-hidden hover:border-neon-blue hover:shadow-neon-blue/20 transition-all">
              <div className="absolute inset-0 bg-neon-blue/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">EXPLORAR REGISTRO COMPLETO</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="space-y-6 flex flex-col">
            <h2 className="text-3xl font-header font-black mb-4 flex items-center gap-4 text-white uppercase tracking-tighter italic">
              <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan drop-shadow-neon-cyan">
                <Music className="w-8 h-8" />
              </div>
              Trending Tracks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {TRACKS_DATA.slice(0, 4).map((track, i) => (
                <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl bg-doc-dark border-2 border-white/5 transition-all group active-depth hover-glow-${track.colorKey} border-neon-${track.colorKey}/20 cursor-default`}>
                  <Link href={`/library?track=${track.id}`} className="w-12 h-12 shrink-0 relative block cursor-pointer">
                    <img src={`/music/albums/genesis_neon/${track.id}/disc.svg`} alt=""
                      className="absolute inset-0 w-full h-full -translate-y-1.5 z-0 transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:z-20"
                    />
                    <img src={`/music/albums/genesis_neon/${track.id}/cover.png`} alt={track.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-500 ease-out z-10 shadow-lg group-hover:opacity-15"
                    />
                  </Link>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/library?track=${track.id}`} className="block cursor-pointer">
                      <h4 className="font-black text-white truncate text-sm tracking-tight italic group-hover:text-neon-cyan transition-colors flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        {track.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-x-1.5">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-gray-400 font-black uppercase text-[7px] tracking-wider">Autor:</span>
                      <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[7px] tracking-wider normal-case hover:text-neon-cyan transition-colors">Ciszuko Antony</Link>
                      <div className="w-2 h-2 text-blue-400 shrink-0">{I.verified}</div>
                    </div>
                    <div className="flex items-center gap-x-1.5">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-gray-400 font-black uppercase text-[7px] tracking-wider">Subido Por:</span>
                      <Link href="/profile/@muzicmania" className="text-white font-bold text-[7px] tracking-wider normal-case hover:text-neon-cyan transition-colors">MuzicMania</Link>
                      <div className="w-2 h-2 text-blue-400 shrink-0">{I.verified}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 text-gray-500 fill-current" />
                        <span className="text-[8px] font-black text-gray-400 tabular-nums">{(realStats[track.id]?.plays || 0).toLocaleString()}</span>
                      </div>
                      <button onClick={handleLike} className="flex items-center gap-1 text-gray-400 hover:text-neon-pink transition-colors cursor-pointer">
                        <div className="w-2.5 h-2.5">{I.heart}</div>
                        <span className="text-[8px] font-black tabular-nums">{(realStats[track.id]?.likes ?? track.likes).toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/library" className="group relative inline-flex items-center justify-center gap-3 w-full py-5 bg-neon-pink rounded-xl text-white font-black uppercase text-sm tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,128,0.3)] hover:shadow-[0_0_50px_rgba(255,0,128,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
              <span className="relative z-10">VER TODAS LAS CANCIONES</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* GitHub Idea Section -> Reviews Page */}
        <div className="mt-12 p-12 rounded-[2.5rem] bg-doc-dark border-2 border-white/5 text-center space-y-6 relative overflow-hidden group hover:border-neon-blue/50 transition-all hover-glow-blue">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-neon-blue drop-shadow-neon-blue mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4.5c1.1-1.1 2.54-1.5 4.5-1.5"/><path d="M15 5s.3 3.4 2 5c1.1 1.1 2.54 1.5 4.5 1.5"/><path d="M11.5 15.5 10 17l-1-1 1-1.5.5-1.5Z"/></svg>
          <h2 className="text-4xl font-header font-black text-white uppercase tracking-tighter italic">¿TIENES UNA IDEA REVOLUCIONARIA?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed uppercase text-[10px] tracking-widest opacity-80">
            MuzicMania no solo evoluciona por nuestro código, sino por vuestra visión. Si tienes una propuesta de mecánica o un reto para el motor rítmico, queremos escucharte.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Star className="w-6 h-6 text-neon-cyan animate-spin-slow opacity-40" />
            <Star className="w-4 h-4 text-neon-cyan animate-pulse opacity-20" />
            <Link href="/reviews" className="inline-block px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-neon-cyan hover:scale-105 transition-all active-depth uppercase tracking-[0.3em] text-sm shadow-xl">
              DEJAR UNA RESEÑA
            </Link>
            <Star className="w-4 h-4 text-neon-cyan animate-pulse opacity-20" />
            <Star className="w-6 h-6 text-neon-cyan animate-spin-slow opacity-40" />
          </div>
        </div>

        {/* Hero Bottom Section (Play Now) */}
        <div className="mt-12 relative p-12 rounded-[3.5rem] bg-gradient-to-r from-neon-purple/20 via-neon-blue/10 to-transparent border-2 border-neon-purple/30 overflow-hidden text-center lg:text-left hover:border-neon-purple/60 transition-all hover-glow-purple group active-depth">
          <svg viewBox="0 0 24 24" className="absolute -top-10 -right-10 w-96 h-96 text-neon-purple/5 pointer-events-none rotate-12" fill="none" stroke="currentColor" strokeWidth={1}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-header font-black mb-8 bg-gradient-to-r from-white via-neon-purple to-neon-pink bg-clip-text text-transparent uppercase tracking-tighter italic">
              El Futuro es Ahora
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-10 font-medium uppercase text-xs tracking-[0.2em]">
              MuzicMania representa la evolución de los juegos de ritmo en el navegador. Con tecnología de punta y una estética synthwave inigualable.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <Link href="/play" className="inline-flex items-center gap-3 px-10 py-5 bg-neon-purple text-white font-black rounded-2xl shadow-neon-purple hover:scale-105 active-depth transition-all uppercase tracking-widest border-2 border-white/20">
                EMPEZAR AHORA
                <ArrowRight className="w-6 h-6 animate-bounce-x" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EL PORTAL Section */}
      <section className="pt-12 pb-24 bg-doc-dark border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10 pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-header font-black tracking-tighter bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent py-4 mb-4 uppercase leading-none italic">
            El Portal
          </h2>
          <p className="text-neon-cyan font-black mb-16 uppercase tracking-[0.6em] text-xs drop-shadow-neon-cyan opacity-80">Transciende las dimensiones rítmicas</p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              {
                name: 'BIBLIOTECA',
                sub: 'Música & Canciones',
                color: 'cyan',
                href: '/library',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                ),
              },
              {
                name: 'JUGAR',
                sub: 'Modo Rítmico',
                color: 'purple',
                href: '/play',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                ),
              },
              {
                name: 'PERFIL',
                sub: 'Tu Identidad Digital',
                color: 'pink',
                href: '/profile',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                name: 'RANKING',
                sub: 'Tabla Global',
                color: 'yellow',
                href: '/leaderboard',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <path d="M8 21V10M12 21V3M16 21v-7"/><path d="M4 21h16"/>
                  </svg>
                ),
              },
              {
                name: 'FORO',
                sub: 'Comunidad Global',
                color: 'green',
                href: '/forum',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                ),
              },
              {
                name: 'CHANGELOG',
                sub: 'Novedades & Parches',
                color: 'orange',
                href: '/changelog',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 group-hover:scale-125 transition-transform duration-500">
                    <path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
                  </svg>
                ),
              },
            ] as { name: string; sub: string; color: string; href: string; icon: React.ReactNode }[]).map((p, i) => {
              const stylesMap: Record<string, { border: string, hoverBorder: string, glow: string, bg: string, text: string, shadow: string, hoverText: string }> = {
                cyan: { border: 'border-neon-cyan/40', hoverBorder: 'hover:border-neon-cyan', glow: 'hover-glow-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', shadow: 'drop-shadow-neon-cyan', hoverText: 'group-hover:text-neon-cyan' },
                purple: { border: 'border-neon-purple/40', hoverBorder: 'hover:border-neon-purple', glow: 'hover-glow-purple', bg: 'bg-neon-purple/10', text: 'text-neon-purple', shadow: 'drop-shadow-neon-purple', hoverText: 'group-hover:text-neon-purple' },
                pink: { border: 'border-neon-pink/40', hoverBorder: 'hover:border-neon-pink', glow: 'hover-glow-pink', bg: 'bg-neon-pink/10', text: 'text-neon-pink', shadow: 'drop-shadow-neon-pink', hoverText: 'group-hover:text-neon-pink' },
                blue: { border: 'border-neon-blue/40', hoverBorder: 'hover:border-neon-blue', glow: 'hover-glow-blue', bg: 'bg-neon-blue/10', text: 'text-neon-blue', shadow: 'drop-shadow-neon-blue', hoverText: 'group-hover:text-neon-blue' },
                green: { border: 'border-neon-green/40', hoverBorder: 'hover:border-neon-green', glow: 'hover-glow-green', bg: 'bg-neon-green/10', text: 'text-neon-green', shadow: 'drop-shadow-neon-green', hoverText: 'group-hover:text-neon-green' },
                orange: { border: 'border-neon-orange/40', hoverBorder: 'hover:border-neon-orange', glow: 'hover-glow-orange', bg: 'bg-neon-orange/10', text: 'text-neon-orange', shadow: 'drop-shadow-neon-orange', hoverText: 'group-hover:text-neon-orange' },
                yellow: { border: 'border-neon-yellow/40', hoverBorder: 'hover:border-neon-yellow', glow: 'hover-glow-yellow', bg: 'bg-neon-yellow/10', text: 'text-neon-yellow', shadow: 'drop-shadow-neon-yellow', hoverText: 'group-hover:text-neon-yellow' }
              };
              const s = stylesMap[p.color];
              
              const hoverColorsHex: Record<string, string> = {
                cyan: '#68cfff', purple: '#b400ff', pink: '#ff33cc',
                blue: '#59b4ff', green: '#00ff9d', orange: '#ff6600',
                yellow: '#ffd900'
              };
              const hc = hoverColorsHex[p.color];

              return (
                <Link 
                  key={i} href={p.href} 
                  className={`group relative flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-black/40 border-2 transition-all active-depth hover:-translate-y-2 ${s.border}`}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.borderColor = hc; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${hc}66`; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center ${s.text} mb-4 mx-auto ${s.shadow}`}>
                    {p.icon}
                  </div>
                  <h4 className={`text-2xl font-header font-bold text-white mb-1 ${s.hoverText} transition-colors uppercase tracking-tight italic`}>{p.name}</h4>
                  <p className="text-[9px] text-white font-bold uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">{p.sub}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </section>
    </div>
  );
}
