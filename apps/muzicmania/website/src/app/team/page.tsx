'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { motion, AnimatePresence } from 'framer-motion';
import { SOCIALS } from '@/config/navigation';
import { useAppStore } from '@/store';
import Link from 'next/link';
import { FlagVE } from '@/components/atoms/FlagVE';
import { resolveAssetPath } from '@ciszunetwork/cdn';

const I = {
  supabase:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M21.362 9.354H12V.5L2.638 10.646H12V19.5z"/></svg>,
  react:       <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full" fill="none" stroke="currentColor"><circle r="2.05" fill="currentColor"/><g strokeWidth="1"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>,
  tailwind:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.639C13.679,10.65,15.115,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.639C16.323,6.15,14.887,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.639c1.191,1.214,2.627,2.661,5.513,2.661c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.639C10.323,13.35,8.887,12,6.001,12z"/></svg>,
  nextjs:      <svg className="w-full h-full" fill="currentColor"><use href="/icons/sprites/sprite.svg#icon-ri-outline-nextjs"/></svg>,
  typescript:  <svg className="w-full h-full" fill="currentColor"><use href="/icons/sprites/sprite.svg#icon-ri-outline-typescript"/></svg>,
  vscode:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>,
  figma:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M8 3.99A3.99 3.99 0 0 1 12 0h4a4 4 0 1 1 0 8H8V3.99zm8 4A3.99 3.99 0 0 1 12 12V8h4zm-4 4v4H8a4 4 0 1 1 0-8h4v4zm0 4h-4a4 4 0 1 0 4 4v-4z"/></svg>,
  shield:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  sparkles:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  code:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  heartHandshake: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="M19 14.1251C20.4897 12.6644 21.9961 10.92 21.9961 8.62507C21.9961 6.33014 20.2447 4.12507 18.5 4.12507C16.7553 4.12507 14.9961 6.12507 13.9961 7.12507C12.9961 6.12507 11.2447 4.12507 9.5 4.12507C7.7553 4.12507 6 6.33014 6 8.62507C6 10.92 7.50638 12.6644 8.99609 14.1251L13.9961 19.1251L19 14.1251Z"/></svg>,
  link:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  network:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M12 8v3"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.046c0 2.121.54 4.191 1.566 6.04L0 24l6.105-1.602a11.832 11.832 0 005.94 1.604h.005c6.634 0 12.043-5.412 12.046-12.047a11.8 11.8 0 00-3.483-8.39z"/></svg>,
  map: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  contact: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  team: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

function WhatsAppButton({ phone }: { phone: string }) {
  const formattedPhone = phone.replace(/\s+/g, '');
  return (
    <a href={`https://wa.me/${formattedPhone}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 text-neon-green hover:bg-neon-green/20 transition-all">
      <div className="w-4 h-4">{I.whatsapp}</div>
    </a>
  );
}

// --- Copy Component (Synced with Contact) ---
function CopyField({ value, label, subValue, icon, theme = 'blue', showWhatsApp = false }: { value: string, label: string, subValue?: string, icon?: React.ReactNode, theme?: 'blue' | 'green' | 'purple', showWhatsApp?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const themes = {
    blue: 'border-neon-blue/20 bg-neon-blue/10 text-neon-blue',
    green: 'border-neon-green/20 bg-neon-green/10 text-neon-green',
    purple: 'border-neon-purple/30 bg-neon-purple/10 text-neon-purple',
  };
  return (
    <div className={`flex items-center gap-4 p-4 border rounded-3xl transition-all group/field hover:border-opacity-50 ${themes[theme]}`}>
      {icon && <div className="w-10 h-10 p-2 rounded-xl bg-white/5">{icon}</div>}
      <div className="flex flex-col flex-1 text-left">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span>
        <span className="text-sm md:text-base font-header font-black text-white tracking-widest break-all">{value}</span>
        {subValue && <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
           {subValue.includes('Venezuela') && <FlagVE className="w-3 h-2 inline-block opacity-70" />}
           {subValue}
         </span>}
      </div>
      <div className="flex gap-2">
        {showWhatsApp && <WhatsAppButton phone={value} />}
        <button onClick={handleCopy} className={`p-3 rounded-xl transition-all ${copied ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-gray-400 hover:bg-white hover:text-black'}`}>
          <div className="w-4 h-4">{copied ? I.check : I.copy}</div>
        </button>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { showToast } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showDiscordPopup, setShowDiscordPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText('ciszukoantony_');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('[ÉXITO]: Discord ID copiado al portapapeles.');
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-cyan/5 rounded-full blur-[200px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-28 space-y-24">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   {I.shield}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  EQUIPO
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               La Mente Detrás del Ritmo
             </p>
          </div>
        </motion.header>

        {/* --- CREATOR --- */}
        <motion.section id="ceo" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12">
           <div className="p-10 md:p-16 bg-doc-dark border-2 border-neon-blue/20 rounded-[4rem] text-center space-y-8 relative overflow-hidden group shadow-2xl transition-all hover:border-neon-cyan/40">
              <div className="absolute -top-10 -right-10 w-96 h-96 blur-[120px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none rounded-full bg-gradient-to-br from-neon-blue to-neon-purple" />
              <div className="absolute -bottom-10 -left-10 w-96 h-96 blur-[120px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan" />
              
              <div className="relative z-10">
                <div className="w-40 h-40 mx-auto rounded-[2rem] overflow-hidden transform group-hover:scale-110 transition-transform duration-700 shadow-[0_0_40px_rgba(0,240,255,0.4)] border-2 border-neon-blue/30">
                    <img src="/images/francisco_selfie/cisco-1.jpg" alt="Ciszuko Antony" className="w-full h-full object-cover" />
                </div>
                
                <div className="mt-8 space-y-4">
                   <h3 className="text-5xl md:text-8xl font-header font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      CISZUKO ANTONY
                   </h3>
                    <p className="text-neon-cyan text-xs md:text-sm font-black tracking-[0.5em] uppercase drop-shadow-[0_0_10px_rgba(0,240,255,1)] flex items-center justify-center gap-3">
                       CEO & CREADOR · CISZU NETWORK
                    </p>
                </div>

                <div className="pt-10 border-t border-white/10 mt-10 max-w-6xl mx-auto space-y-10">
                   <p className="text-gray-200 text-xs font-bold leading-relaxed uppercase tracking-widest bg-black/80 px-8 py-5 rounded-3xl border border-neon-blue/30 inline-block shadow-inner">
                      MuzicMania es un esfuerzo colosal desarrollado en su totalidad por una sola persona.
                   </p>
                   
                   <div className="flex flex-wrap justify-center gap-3">
                      {['Lead Developer', 'UI / UX Designer', 'Sound Engineer', 'Cloud Architect', 'Creative Director'].map(role => (
                        <span key={role} className="px-5 py-3 border border-white/10 rounded-[1.5rem] bg-black/80 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:border-neon-cyan transition-all cursor-default group-hover:bg-neon-blue/10">
                           {role}
                        </span>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-4">
                      <CopyField label="Email Personal" value="fplayersoffcial@gmail.com" icon={I.mail} theme="blue" />
                      <CopyField label="WhatsApp Personal" value="+58 412 6858111" subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />
                   </div>

                   {/* Social Buttons Extended logic */}
                    <div className="pt-12 flex flex-col items-center gap-8 border-t border-white/10 relative">
                        <p className="text-neon-cyan font-black text-[10px] tracking-[0.4em] uppercase flex items-center gap-3">CONECTAR CON EL NÚCLEO</p>
                       
                       <div className="flex flex-wrap justify-center gap-4">
                        {SOCIALS.map((s) => {
                           let actualHref = s.href;
                           if (s.name === 'Instagram') actualHref = 'https://www.instagram.com/itz.ciszukoant0nyz/';
                           else if (s.name === 'Twitter / X') actualHref = 'https://x.com/CiszukoAntony';
                           else if (s.name === 'TikTok') actualHref = 'https://www.tiktok.com/@ciszukoantony';
                           else if (s.name === 'YouTube') actualHref = 'https://youtube.com/@ciszukoantony';
                           else if (s.name === 'GitHub') actualHref = 'https://github.com/ciszukoantony';
                           else if (s.name === 'Facebook') actualHref = 'https://facebook.com/ciszukoantony';
                           
                           if (s.name === 'Discord') {
                             return (
                               <div key={s.name} className="relative">
                                  <button onClick={() => setShowDiscordPopup(!showDiscordPopup)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${s.bgCol} ${s.borderCol} ${s.textCol} hover:text-white hover:shadow-[0_0_20px_currentColor]`}>
                                     {s.icon}
                                  </button>
                                  <AnimatePresence>
                                    {showDiscordPopup && (
                                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: -10 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-black border border-neon-blue rounded-3xl shadow-2xl backdrop-blur-xl z-[100] min-w-[200px]">
                                         <div className="flex flex-col gap-3">
                                            <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest text-left">Discord ID</span>
                                            <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between gap-4">
                                               <span className="text-white font-header font-bold text-sm tracking-wider">ciszukoantony_</span>
                                               <button onClick={handleCopyDiscord} className={`p-2 rounded-lg ${copied ? 'text-neon-green' : 'text-white'}`}>
                                                   <div className="w-4 h-4">{copied ? I.check : I.copy}</div>
                                               </button>
                                            </div>
                                         </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                               </div>
                             );
                           }
                           
                           return (
                             <button type="button" key={s.name} onClick={() => actualHref !== '#' ? window.open(actualHref, '_blank') : showToast(`Dominio ${s.name} inactivo. Vinculación suspendida.`)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${s.bgCol} ${s.borderCol} ${s.textCol} hover:text-white hover:shadow-[0_0_20px_currentColor]`}>
                               {s.icon}
                             </button>
                           );
                        })}
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-5 w-full justify-center pt-8">
                        <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-neon-cyan hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 transition-all shadow-xl">
                           <div className="w-5 h-5">{I.link}</div>
                           Portal Oficial
                        </a>
                         <Link href="/contact" className="flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-transparent border-2 border-neon-blue text-neon-blue font-black uppercase text-xs tracking-[0.2em] hover:bg-neon-blue hover:text-white hover:shadow-[0_0_30px_rgba(0,180,255,0.4)] hover:scale-105 transition-all group shadow-xl">
                            <div className="w-5 h-5 group-hover:scale-110 transition-transform">{I.contact}</div>
                            Contacto Directo
                         </Link>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.section>

        {/* --- CISZU NETWORK CORE --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
           <div className="flex flex-col items-center gap-8 bg-[#080808] p-10 md:p-14 rounded-[4rem] border border-white/5 relative overflow-hidden group hover:border-neon-purple/20 transition-all">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-purple/10 blur-[100px] pointer-events-none transition-all group-hover:scale-150" />
              <div className="flex flex-col gap-8 w-full relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-start">
                    <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center border border-white/10 shrink-0 p-2 overflow-hidden">
                        <img src={resolveAssetPath('ciszukoantony/content/logos/imagen/outline/isotipo/degradado/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.svg')} alt="Ciszu Network" className="w-full h-full object-contain" />
                    </div>
                     <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter flex items-center justify-center md:justify-start gap-3">
                           Ciszu Network
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">La Matriz de Proyectos Globales</p>
                     </div>
                 </div>

                 <div className="max-w-3xl mx-auto text-center md:text-left space-y-4 px-4 pt-2">
                    <p className="text-gray-300 text-xs font-bold leading-relaxed uppercase tracking-wider bg-black/80 px-6 py-4 rounded-2xl border border-neon-purple/20">
                       Ciszu Network es una red integral de servicios y proyectos digitales que abarca desarrollo de software, contenido multimedia y soluciones tecnológicas. Nuestra misión es conectar, innovar y transformar el ecosistema digital.
                    </p>
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                    <CopyField label="Email Primario" value="ciszunetwork@gmail.com" icon={I.mail} theme="blue" />
                    <CopyField label="Email Secundario" value="ciszunetwork@outlook.com" icon={I.mail} theme="purple" />
                    <CopyField label="Email Corporativo" value="ciszunetwork@hotmail.com" icon={I.mail} theme="purple" />
                 </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {SOCIALS.filter(s => s.name !== 'Discord').map((s) => {
                     let actualHref = s.href;
                     if (s.name === 'Instagram') actualHref = 'https://www.instagram.com/ciszunetwork/';
                     return (
                       <button type="button" key={s.name} onClick={() => actualHref !== '#' ? window.open(actualHref, '_blank') : showToast(`Dominio ${s.name} inactivo. Vinculación suspendida.`)} className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${s.bgCol} ${s.borderCol} ${s.textCol} hover:text-white hover:shadow-[0_0_15px_currentColor]`}>
                         {s.icon}
                       </button>
                    );
                  })}
                  
                  {/* Elongated Discord Button for Network */}
                  <a
                    href="https://discord.gg/W3kMtMMj6E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 group flex items-center justify-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da] hover:text-white px-6 py-2 rounded-2xl transition-all shadow-lg active-depth"
                  >
                    <div className="w-5 h-5 transform group-hover:scale-110 transition-transform">
                       {SOCIALS.find(s => s.name === 'Discord')?.icon}
                    </div>
                    <span className="font-header font-black tracking-tighter text-sm uppercase italic">Discord Server</span>
                  </a>
                </div>
              </div>
               <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="shrink-0 px-10 py-5 bg-white/5 border border-white/20 rounded-3xl text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-neon-purple/20 hover:border-neon-purple hover:shadow-[0_0_30px_rgba(180,0,255,0.3)] transition-all z-10 whitespace-nowrap flex items-center justify-center gap-3 shadow-xl">
                   <div className="w-5 h-5">{I.link}</div>
                    Web Oficial
                </a>
           </div>
        </motion.section>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
