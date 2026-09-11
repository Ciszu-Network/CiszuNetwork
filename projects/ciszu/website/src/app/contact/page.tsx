'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';
import Link from 'next/link';

// --- Icons ---
const I = {
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"/></svg>,
  map: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  globe: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.046c0 2.121.54 4.191 1.566 6.04L0 24l6.105-1.602a11.832 11.832 0 005.94 1.604h.005c6.634 0 12.043-5.412 12.046-12.047a11.8 11.8 0 00-3.483-8.39z"/></svg>,
  team: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

// --- WhatsApp Button ---
function WhatsAppButton({ phone }: { phone: string }) {
  return (
    <Link 
      href={`https://wa.me/${phone.replace(/\+/g, '').replace(/-/g, '').replace(/\s/g, '')}`}
      target="_blank"
      className="p-3 rounded-xl bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all group/wa"
    >
      <div className="w-5 h-5 group-hover/wa:scale-110 transition-transform">{I.whatsapp}</div>
    </Link>
  );
}

// --- Reusable Copy Field Component ---
function CopyField({ value, label, subValue, icon, theme = 'blue', showWhatsApp = false }: { value: string, label: string, subValue?: string, icon?: React.ReactNode, theme?: 'blue' | 'green' | 'purple', showWhatsApp?: boolean }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = {
    blue: 'border-brand-light/20 bg-brand-light/5 text-brand-light',
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green',
    purple: 'border-neon-purple/20 bg-neon-purple/5 text-neon-purple',
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded-3xl transition-all group/field hover:border-opacity-50 ${themes[theme]}`}>
      {icon && (
        <div className="w-10 h-10 p-2 rounded-xl bg-white/5 group-hover/field:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-base md:text-lg font-header font-black text-white tracking-widest break-all">{value}</span>
        {subValue && <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-1">{subValue}</span>}
      </div>
      <div className="flex gap-2">
        {showWhatsApp && <WhatsAppButton phone={value} />}
        <button 
          onClick={handleCopy}
          className={`p-3 rounded-xl transition-all ${copied ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-gray-400 hover:bg-white hover:text-black'}`}
        >
          <div className="w-4 h-4">{copied ? I.check : I.copy}</div>
        </button>
      </div>
    </div>
  );
}

export default function ContactPage() {
  usePageTitle('CONTACT');
  const [selectedDiscord, setSelectedDiscord] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-neon-cyan/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-neon-blue/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-20">
        
        {/* --- HERO HEADER --- */}
        <motion.header id="hero" initial="hidden" animate="visible" className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-brand-light flex items-center justify-center">
                   {I.globe}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-brand-light via-brand-accent to-brand-light bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                   CONTACTO
                </h1>
             </div>
             <p className="text-brand-accent font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
                Núcleo de Asistencia y Canales de Comunicación
             </p>
          </div>
        </motion.header>

        {/* --- MAIN CONTACT GRID --- */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="p-10 md:p-14 bg-doc-dark border border-white/5 rounded-[3rem] space-y-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">
                ¿TIENES DUDAS?
              </h2>
              <p className="text-white/80 font-bold text-xl md:text-2xl leading-relaxed tracking-tight group-hover:text-white transition-colors">
                Establece una conexión directa con nuestra matriz corporativa. Estamos listos para sincronizar soluciones y responder a tus requerimientos globales.
              </p>
              
              <div className="pt-10 border-t border-white/5 space-y-6">
                <CopyField label="Email de Consulta Primaria" value="ciszunetwork@gmail.com" icon={I.mail} theme="blue" />
                <CopyField label="Localidad de Operaciones" value="Coro, Falcón" subValue="Venezuela" icon={I.map} theme="purple" />
                <CopyField label="Línea Directa WhatsApp" value="+58 412 6858111" subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />
                
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple/70 pl-2">Emails secundarios</p>
                  <div className="grid grid-cols-1 gap-4">
                    <CopyField label="Outlook" value="ciszunetwork@outlook.com" icon={I.mail} theme="purple" />
                    <CopyField label="Hotmail" value="ciszunetwork@hotmail.com" icon={I.mail} theme="purple" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
             <div className="h-full min-h-[500px] p-10 bg-doc-dark border border-white/10 rounded-[3rem] overflow-hidden relative shadow-2xl group">
                <div className="flex flex-col h-full justify-center items-center text-center space-y-8">
                   <div className="w-20 h-20 text-brand-light p-5 bg-brand-accent/5 rounded-[2rem] border border-brand-accent/20">
                      {I.map}
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter">
                         Nuestra Localidad
                      </h3>
                      <p className="text-xl font-header font-black text-brand-accent italic uppercase tracking-tighter">
                         Coro, Falcón
                      </p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-md">
                         Base de Operaciones Suramericana - Venezuela (GMT-4)
                      </p>
                   </div>
                   <div className="flex flex-wrap justify-center gap-4 pt-8">
                      <CopyField label="Email de Consulta" value="ciszunetwork@gmail.com" icon={I.mail} theme="blue" />
                      <CopyField label="WhatsApp Directo" value="+58 412 6858111" icon={I.phone} theme="green" showWhatsApp={true} />
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* --- OPERATIONAL INFO --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-black/40 border-2 border-neon-green/20 rounded-[3rem] space-y-6 flex flex-col items-center text-center group hover:border-neon-green transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <div className="relative">
                <div className="w-16 h-16 text-neon-green p-4 bg-neon-green/5 rounded-[2rem] border border-neon-green/20 group-hover:bg-neon-green group-hover:text-black transition-all">{I.clock}</div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-black animate-pulse" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-header font-black text-white italic uppercase tracking-tighter">DISPONIBILIDAD 24/7</h3>
                 <p className="text-neon-green font-black text-xs uppercase tracking-[0.5em] opacity-80 flex items-center justify-center gap-2">ONLINE AHORA</p>
              </div>
              <p className="text-gray-400 font-bold text-sm leading-relaxed max-w-sm uppercase tracking-widest italic flex items-center justify-center flex-wrap gap-2 text-center">
                Atención ininterrumpida los 365 días del año en horario <span className="text-white">Venezuela (GMT-4)</span>.
              </p>
           </div>
           <div className="p-10 bg-black/40 border-2 border-brand-accent/20 rounded-[3rem] space-y-6 flex flex-col items-center text-center group hover:border-brand-accent transition-all">
              <div className="w-16 h-16 text-brand-accent p-4 bg-brand-accent/5 rounded-[2rem] border border-brand-accent/20 group-hover:bg-brand-accent group-hover:text-black transition-all">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-header font-black text-white italic uppercase tracking-tighter">ESTRUCTURA TÉCNICA</h3>
                 <p className="text-brand-accent font-black text-xs uppercase tracking-[0.5em] opacity-80">Codex Digital Architecture</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                 {['React', 'Next.js', 'Supabase', 'Tailwind', 'Framer Motion', 'Vercel'].map(tech => (
                   <span key={tech} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-default">{tech}</span>
                 ))}
              </div>
           </div>
        </motion.section>

        {/* --- CEO SECTION --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="relative py-12">
            <div className="flex flex-col md:flex-row items-center gap-12 p-12 bg-gradient-to-br from-indigo-950/40 to-black border-2 border-brand-accent/30 rounded-[4rem] relative overflow-hidden group hover:border-brand-light transition-all duration-700">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,240,255,0.15)_0%,transparent_60%)] pointer-events-none" />
               <div className="w-48 h-48 md:w-64 md:h-64 bg-black border-2 border-brand-accent/30 rounded-[4rem] shrink-0 transform rotate-6 group-hover:rotate-0 transition-transform duration-700 shadow-2xl overflow-hidden flex items-center justify-center p-12 text-white">
                  {I.user}
               </div>
               <div className="space-y-6 text-center md:text-left relative z-10 w-full">
                  <div>
                    <h3 className="text-5xl md:text-7xl font-header font-black text-white italic tracking-tighter uppercase leading-none">CISZUKO ANTONY</h3>
                    <p className="text-brand-light font-black tracking-[0.6em] uppercase text-xs md:text-sm pt-2 flex items-center justify-center md:justify-start gap-3">
                       CEO & CREADOR · NÚCLEO CISZU
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                     <CopyField label="Email Personal" value="fplayersoffcial@gmail.com" icon={I.mail} theme="blue" />
                     <CopyField label="WhatsApp Personal" value="+58 412 6858111" subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5 pt-6">
                    <button onClick={() => window.open('https://ciszukoantony.vercel.app', '_blank')} className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:text-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4">
                      <div className="w-4 h-4">{I.globe}</div> Portafolio Personal
                    </button>
                    <Link href="/team#ceo" className="px-8 py-4 bg-transparent border-2 border-brand-light text-brand-light font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:text-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4 group">
                       <div className="w-4 h-4 group-hover:scale-110 transition-transform">{I.team}</div> Perfil Completo
                    </Link>
                  </div>
               </div>
            </div>
        </motion.section>

        {/* --- SOCIAL GALAXY --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="space-y-12 bg-black/40 p-12 md:p-20 rounded-[5rem] border border-white/5">
           <div className="text-center space-y-2 mb-12">
             <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">SISTEMA SOCIAL UNIFICADO</h3>
             <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-2">Conexión Global</p>
           </div>

           <div className="space-y-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[1px] flex-1 bg-brand-light/10" /><span className="text-brand-light font-black text-[10px] uppercase tracking-widest px-4">Ecosistema Ciszu Network</span><div className="h-[1px] flex-1 bg-brand-light/10" />
                </div>
                   <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { name: 'Discord', href: 'https://discord.gg/W3kMtMMj6E', color: 'neon-purple' },
                      { name: 'YouTube', href: 'https://www.youtube.com/@CiszuNetwork', color: 'red' },
                      { name: 'Instagram', href: 'https://www.instagram.com/ciszunetwork/', color: 'pink' },
                      { name: 'TikTok', href: 'https://www.tiktok.com/@ciszunetwork', color: 'cyan' },
                      { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61572023767657', color: 'blue' },
                      { name: 'GitHub', href: 'https://github.com/Ciszu-Network', color: 'gray' },
                    ].map(s => {
                      type ColorMap = typeof colorMap;
                      const colorMap = {
                        'neon-purple': { border: 'border-neon-purple/40', bg: 'bg-neon-purple/10', text: 'text-neon-purple', hoverBg: 'hover:bg-neon-purple', hoverText: 'hover:text-white' },
                        'red': { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-500', hoverBg: 'hover:bg-red-500', hoverText: 'hover:text-white' },
                        'pink': { border: 'border-pink-500/40', bg: 'bg-pink-500/10', text: 'text-pink-500', hoverBg: 'hover:bg-pink-500', hoverText: 'hover:text-white' },
                        'cyan': { border: 'border-neon-cyan/40', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', hoverBg: 'hover:bg-neon-cyan', hoverText: 'hover:text-white' },
                        'blue': { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-500', hoverBg: 'hover:bg-blue-500', hoverText: 'hover:text-white' },
                        'gray': { border: 'border-white/30', bg: 'bg-white/5', text: 'text-gray-300', hoverBg: 'hover:bg-gray-700', hoverText: 'hover:text-white' },
                      } as const;
                      const style = colorMap[s.color as keyof typeof colorMap];
                      return (
                        <button key={s.name} onClick={() => window.open(s.href, '_blank')}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all hover:scale-105 ${style.border} ${style.bg} ${style.text} ${style.hoverBg} ${style.hoverText}`}
                        >
                           <div className="w-5 h-5">{I.globe}</div>
                           <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
              </div>
           </div>
        </motion.section>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
