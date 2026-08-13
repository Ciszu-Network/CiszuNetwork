'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';
import * as Sentry from '@sentry/nextjs';
import { FabRestore } from '@ciszu/ui';

// --- Icons Library (MuzicMania Style) ---
const I = {
  feedback: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>,
  msg: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  send: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  check: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>,
  close: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18m0-12 12 12"/></svg>,
  alert: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="7" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  report: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  download: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

const FEEDBACK_EMAIL = 'ciszunetowork@gmail.com';

export default function FeedbackPage() {
  usePageTitle('FEEDBACK');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError('El mensaje es obligatorio: cuéntanos qué opinas o reporta el problema.');
      return;
    }
    setError(null);

    const subject = `MuzicMania Feedback${name.trim() ? ` — ${name.trim()}` : ''}`;
    let body = trimmed;
    if (name.trim()) body += `\n\nNombre: ${name.trim()}`;
    if (email.trim()) body += `\nEmail: ${email.trim()}`;

    const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const openSentryReport = async () => {
    // Apertura manual del formulario de Sentry (autoInject: false en
    // instrumentation-client → el trigger flotante automático está desactivado).
    const feedback = Sentry.getFeedback?.();
    const form = await feedback?.createForm?.();
    if (form) {
      form.appendToDom?.();
      form.open?.();
    }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-neon-cyan/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-16">

        {/* --- HERO HEADER --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 text-neon-cyan flex items-center justify-center">
                {I.feedback}
              </div>
              <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                FEEDBACK
              </h1>
            </div>
            <p className="text-neon-pink font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
              Tu opinión impulsa el ritmo de MuzicMania
            </p>
          </div>
        </motion.header>

        {sent ? (
          /* --- ESTADO DE ÉXITO --- */
          <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mx-auto max-w-3xl p-12 md:p-16 bg-doc-dark border-2 border-neon-green/30 rounded-[4rem] shadow-2xl text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-neon-green font-black text-9xl italic uppercase tracking-tighter pointer-events-none">DONE</div>
            <div className="w-20 h-20 text-neon-green mx-auto drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">{I.check}</div>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">¡SEÑAL RECIBIDA!</h2>
              <p className="text-neon-green font-black text-xs uppercase tracking-[0.4em]">Transmisión preparada</p>
            </div>
            <p className="text-gray-400 font-bold text-sm leading-relaxed max-w-xl mx-auto uppercase tracking-widest">
              Se ha abierto tu cliente de correo con el mensaje listo. Envíalo desde allí a{' '}
              <span className="text-white">{FEEDBACK_EMAIL}</span> para completar la transmisión.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
              <button onClick={() => setSent(false)} className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-neon-cyan hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4">
                <div className="w-4 h-4">{I.msg}</div> ENVIAR OTRO MENSAJE
              </button>
              <Link href="/download" className="px-8 py-4 bg-transparent border-2 border-neon-cyan text-neon-cyan font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-neon-cyan hover:text-black hover:scale-105 transition-all flex items-center justify-center gap-4">
                <div className="w-4 h-4">{I.download}</div> IR A DESCARGAS
              </Link>
            </div>
          </motion.div>
        ) : (
          /* --- FORMULARIO --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* FORM (LEFT) */}
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="lg:col-span-8">
              <form onSubmit={handleSubmit} className="h-full p-8 md:p-12 bg-doc-dark border border-white/10 rounded-[4rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-neon-pink font-black text-9xl italic uppercase tracking-tighter pointer-events-none">PING</div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                    <div className="w-4 h-4 text-neon-cyan">{I.feedback}</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Tu señal</h3>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-2">
                    Opinión, sugerencia o reporte de bug. El mensaje es obligatorio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Nombre (Opcional)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600">
                        {I.user}
                      </div>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:border-neon-cyan/50 outline-none transition-all"
                        placeholder="Ej: Ciszu Master"
                        maxLength={60}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Email (Opcional)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600">
                        {I.mail}
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full bg-black/60 border rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:border-neon-blue/50 outline-none transition-all ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-neon-pink/60' : 'border-white/10'}`}
                        placeholder="tu-email@servidor.com"
                        maxLength={120}
                      />
                    </div>
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-neon-pink pl-2">Formato de email inválido</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Mensaje *</label>
                  <div className="relative">
                    <div className={`absolute left-5 top-5 w-4 h-4 ${message.trim() ? 'text-neon-cyan' : 'text-gray-600'}`}>
                      {I.msg}
                    </div>
                    <textarea
                      required
                      rows={7}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className={`w-full bg-black/60 border rounded-3xl pl-12 pr-6 py-4 text-sm font-bold outline-none resize-none placeholder:text-gray-800 transition-all ${error ? 'border-neon-pink/60' : 'border-white/10 focus:border-neon-pink/50'}`}
                      placeholder="Describe tu opinión, sugerencia o el problema que encontraste..."
                      maxLength={2000}
                    />
                  </div>
                  {error && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-neon-pink pl-2 flex items-center gap-2">
                      <div className="w-3 h-3">{I.alert}</div> {error}
                    </p>
                  )}
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-2 text-right">{message.length}/2000</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 rounded-3xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink border-none shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(255,51,204,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 text-sm font-black italic tracking-widest text-black"
                >
                  <div className="w-5 h-5">{I.send}</div>
                  <span>ENVIAR FEEDBACK AL NÚCLEO</span>
                </button>
              </form>
            </motion.div>

            {/* SIDEBAR (RIGHT) */}
            <motion.aside initial="hidden" animate="visible" variants={sectionVariants} className="lg:col-span-4 space-y-8">
              {/* SENTRY REPORT */}
              <div className="p-8 bg-gradient-to-br from-neon-pink/10 to-transparent border border-neon-pink/20 rounded-[3rem] space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-neon-pink font-black text-6xl italic pointer-events-none">BUG</div>
                <div className="w-14 h-14 text-neon-pink p-3 bg-neon-pink/10 rounded-2xl border border-neon-pink/20">
                  {I.report}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-header font-black text-white uppercase italic tracking-tighter">¿ENCONTRASTE UN BUG?</h3>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                    Abre el reporte técnico de problemas. Se adjuntan automáticamente detalles del navegador y la sesión para diagnosticar el fallo más rápido.
                  </p>
                </div>
                <button
                  onClick={openSentryReport}
                  className="w-full px-6 py-4 bg-neon-pink text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-3xl hover:bg-neon-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,51,204,0.35)]"
                >
                  <div className="w-4 h-4">{I.report}</div> ABRIR EL REPORTE DE PROBLEMAS
                </button>
              </div>

              {/* EMAIL DIRECT */}
              <div className="p-8 bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/20 rounded-[3rem] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-neon-blue font-black text-6xl italic pointer-events-none">MAIL</div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 text-neon-blue p-2.5 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
                    {I.mail}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Canal Alternativo</h3>
                    <p className="text-[10px] text-neon-blue font-black uppercase tracking-[0.2em] break-all">{FEEDBACK_EMAIL}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('MuzicMania Feedback')}`}
                  className="w-full px-6 py-3.5 bg-white/5 border border-neon-blue/30 text-neon-blue font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-neon-blue hover:text-black hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <div className="w-4 h-4">{I.send}</div> ESCRIBIR DIRECTAMENTE
                </button>
              </div>

              {/* CHANNELS */}
              <div className="p-8 bg-doc-dark border border-white/5 rounded-[3rem] space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] border-b border-white/10 pb-4">Canales de Asistencia</h3>
                <div className="space-y-4">
                  <Link href="/contact" className="flex gap-4 items-start group p-3 -m-3 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="w-1 h-8 rounded-full bg-current text-neon-cyan opacity-40 group-hover:opacity-100 transition-all" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Contacto</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Canales directos de comunicación</p>
                    </div>
                  </Link>
                  <Link href="/support" className="flex gap-4 items-start group p-3 -m-3 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="w-1 h-8 rounded-full bg-current text-neon-purple opacity-40 group-hover:opacity-100 transition-all" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple">Soporte</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Tickets de asistencia técnica</p>
                    </div>
                  </Link>
                  <Link href="/download" className="flex gap-4 items-start group p-3 -m-3 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="w-1 h-8 rounded-full bg-current text-neon-pink opacity-40 group-hover:opacity-100 transition-all" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neon-pink">Descargas</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">App nativa Tauri y PDWA</p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        )}

        {/* --- HOW FEEDBACK HELPS --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-black/40 border-2 border-neon-cyan/20 rounded-[3rem] text-center space-y-4 hover:border-neon-cyan transition-all group">
            <div className="w-14 h-14 text-neon-cyan mx-auto p-3 bg-neon-cyan/5 rounded-2xl border border-neon-cyan/20 group-hover:scale-110 transition-transform">{I.msg}</div>
            <h3 className="text-sm font-header font-black text-white uppercase italic tracking-tight">Sugerencias de Funciones</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Cada mapa, canción o mecánica que sueñas puede convertirse en realidad.</p>
          </div>
          <div className="p-8 bg-black/40 border-2 border-neon-pink/20 rounded-[3rem] text-center space-y-4 hover:border-neon-pink transition-all group">
            <div className="w-14 h-14 text-neon-pink mx-auto p-3 bg-neon-pink/5 rounded-2xl border border-neon-pink/20 group-hover:scale-110 transition-transform">{I.alert}</div>
            <h3 className="text-sm font-header font-black text-white uppercase italic tracking-tight">Reportes de Error</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Detecta un fallo y ayúdanos a corregirlo antes de que afecte a más jugadores.</p>
          </div>
          <div className="p-8 bg-black/40 border-2 border-neon-blue/20 rounded-[3rem] text-center space-y-4 hover:border-neon-blue transition-all group">
            <div className="w-14 h-14 text-neon-blue mx-auto p-3 bg-neon-blue/5 rounded-2xl border border-neon-blue/20 group-hover:scale-110 transition-transform">{I.feedback}</div>
            <h3 className="text-sm font-header font-black text-white uppercase italic tracking-tight">Opinión General</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Dinos qué amas y qué cambiarías del ecosistema MuzicMania.</p>
          </div>
        </motion.section>

        <QuickDocks />

        {/* Restaurar botones flotantes */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-black/40 border border-white/5 rounded-[2.5rem]"
        >
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-header font-black text-white uppercase italic tracking-tight">¿Cerraste el botón flotante?</h4>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xl">
              El botón de reporte rápido de abajo a la izquierda se puede volver a mostrar cuando quieras.
            </p>
          </div>
          <FabRestore accent="#ff33cc" />
        </motion.section>
      </div>
    </MainLayout>
  );
}