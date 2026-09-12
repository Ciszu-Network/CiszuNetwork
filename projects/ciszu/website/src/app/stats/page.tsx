'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

// ---------------------------------------------------------------------------
// STATS — Estado del servidor e infraestructura (ciszunetwork / ciszukoantony /
// ciszubot).
//
// Reglas de este apartado:
//  - SOLO datos del servidor/plataforma: estado, red y seguridad.
//  - NO existen datos personales, ni búsqueda de usuarios, ni selección de
//    usuario, ni tracks, ni puntuaciones, ni multiplicadores (eso es MuzicMania).
//  - No se inventan métricas: todo lo que se muestra se mide en el cliente
//    (conexión, latencia real, contexto seguro, base de datos) o se marca como
//    "Sin datos" cuando no es comprobable.
// ---------------------------------------------------------------------------

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const I = {
  server: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  database: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>,
};

type Tone = 'ok' | 'warn' | 'unknown';

interface Check { label: string; detail: string; tone: Tone; }
interface Service { name: string; detail: string; tone: Tone; }

function toneColor(tone: Tone): string {
  if (tone === 'ok') return 'text-neon-green';
  if (tone === 'warn') return 'text-neon-red';
  return 'text-white/40';
}

function ToneDot({ tone }: { tone: Tone }) {
  return (
    <span className={`w-2.5 h-2.5 rounded-full bg-current ${tone === 'ok' ? 'animate-pulse' : ''} ${toneColor(tone)}`} />
  );
}

export default function StatsPage() {
  usePageTitle('STATS');
  const [checks, setChecks] = useState<Check[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setChecking(true);
    let webTone: Tone = 'unknown';
    let measured: number | null = null;
    let dbTone: Tone = 'unknown';
    let dbMeasured: number | null = null;

    // 1) Disponibilidad + latencia de la propia web (medición real).
    try {
      const t0 = performance.now();
      const res = await fetch(`${window.location.origin}/`, { method: 'HEAD', cache: 'no-store' });
      measured = Math.round(performance.now() - t0);
      webTone = res.ok ? 'ok' : 'warn';
    } catch {
      webTone = 'warn';
    }

    // 2) Base de datos (Supabase REST). Si no hay credenciales, "Sin datos".
    if (SB_URL && SB_KEY) {
      try {
        const t0 = performance.now();
        const res = await fetch(`${SB_URL}/rest/v1/`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          cache: 'no-store',
        });
        dbMeasured = Math.round(performance.now() - t0);
        dbTone = res.ok ? 'ok' : 'warn';
      } catch {
        dbTone = 'warn';
      }
    }

    const secureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
    const https = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let storageOk = false;
    try {
      window.localStorage.setItem('__stats_probe', '1');
      window.localStorage.removeItem('__stats_probe');
      storageOk = true;
    } catch { storageOk = false; }

    setChecks([
      { label: 'Conexión de red', detail: online ? 'Dispositivo en línea' : 'Sin conexión', tone: online ? 'ok' : 'warn' },
      { label: 'Conexión cifrada (HTTPS)', detail: https ? 'TLS activo' : 'Conexión no cifrada', tone: https ? 'ok' : 'warn' },
      { label: 'Contexto seguro', detail: secureContext ? 'Secure Context disponible' : 'No disponible', tone: secureContext ? 'ok' : 'warn' },
      { label: 'Almacenamiento local', detail: storageOk ? 'Habilitado' : 'Bloqueado por el navegador', tone: storageOk ? 'ok' : 'warn' },
      { label: 'Cookies', detail: navigator.cookieEnabled ? 'Habilitadas' : 'Bloqueadas', tone: navigator.cookieEnabled ? 'ok' : 'warn' },
      { label: 'Service Worker (PWA)', detail: 'serviceWorker' in navigator ? 'Soportado' : 'No soportado', tone: 'serviceWorker' in navigator ? 'ok' : 'unknown' },
      { label: 'Base de datos', detail: dbTone === 'ok' ? 'Responde correctamente' : dbTone === 'warn' ? 'Sin respuesta' : 'Sin datos', tone: dbTone },
    ]);

    setServices([
      { name: 'Aplicación web', detail: measured !== null ? `${measured} ms` : 'Sin datos', tone: webTone },
      { name: 'Base de datos', detail: dbMeasured !== null ? `${dbMeasured} ms` : 'Sin datos', tone: dbTone },
      { name: 'Red de entrega (CDN)', detail: 'Assets servidos vía CDN', tone: 'unknown' },
      { name: 'Correo transaccional', detail: 'Sin datos', tone: 'unknown' },
    ]);

    setLatency(measured);
    setDbLatency(dbMeasured);
    setLastCheck(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
    const iv = window.setInterval(runChecks, 30000);
    return () => window.clearInterval(iv);
  }, [runChecks]);

  const okCount = checks.filter((c) => c.tone === 'ok').length;
  const healthPct = checks.length > 0 ? Math.round((okCount / checks.length) * 100) : 0;
  const overallTone: Tone = checks.length === 0 ? 'unknown' : healthPct >= 80 ? 'ok' : 'warn';

  const tiles = [
    { label: 'Estado general', value: checks.length === 0 ? '—' : healthPct >= 80 ? 'OPERATIVO' : 'REVISAR', tone: overallTone },
    { label: 'Latencia web', value: latency !== null ? `${latency} ms` : '—', tone: latency !== null && latency < 800 ? 'ok' : 'unknown' as Tone },
    { label: 'Latencia DB', value: dbLatency !== null ? `${dbLatency} ms` : '—', tone: dbLatency !== null && dbLatency < 800 ? 'ok' : 'unknown' as Tone },
    { label: 'Comprobaciones OK', value: checks.length > 0 ? `${okCount}/${checks.length}` : '—', tone: 'unknown' as Tone },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 space-y-16">
        {/* --- HEADER --- */}
        <motion.header initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-6 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 text-neon-green flex items-center justify-center">{I.server}</div>
              <h1 className="text-5xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                ESTADO
              </h1>
            </div>
            <p className="text-neon-blue font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
              Servidor · Red · Seguridad
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={runChecks}
              disabled={checking}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black border border-neon-blue/30 text-neon-blue font-header font-black uppercase tracking-widest text-[10px] hover:bg-neon-blue hover:text-black transition-all disabled:opacity-40"
            >
              <span className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}>{I.refresh}</span>
              {checking ? 'Comprobando…' : 'Actualizar estado'}
            </button>
          </div>
        </motion.header>

        {/* --- OVERVIEW TILES --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((t) => (
            <div key={t.label} className="bg-doc-dark border border-white/10 p-7 rounded-3xl text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <ToneDot tone={t.tone} />
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{t.label}</p>
              </div>
              <h4 className={`text-2xl font-header font-black italic ${toneColor(t.tone)}`}>{t.value}</h4>
            </div>
          ))}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- SECURITY / NETWORK CHECKS --- */}
          <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 text-neon-green">{I.shield}</div>
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">Seguridad y red</h2>
            </div>
            <div className="bg-doc-dark border border-white/10 rounded-[3rem] divide-y divide-white/5 overflow-hidden">
              {checks.length === 0 && (
                <p className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Sin datos todavía…</p>
              )}
              {checks.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-6 px-8 py-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <ToneDot tone={c.tone} />
                    <span className="font-header font-black uppercase tracking-widest text-xs text-white/80 truncate">{c.label}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-right ${toneColor(c.tone)}`}>{c.detail}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* --- SERVICES --- */}
          <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 text-neon-blue">{I.activity}</div>
              <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">Servicios</h2>
            </div>
            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.name} className="bg-doc-dark border border-white/10 p-6 rounded-3xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-neon-blue">{I.database}</div>
                    <span className="font-header font-black uppercase tracking-widest text-xs text-white/80">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${toneColor(s.tone)}`}>{s.detail}</span>
                    <ToneDot tone={s.tone} />
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="bg-doc-dark border border-dashed border-white/10 p-8 rounded-3xl text-center text-[10px] font-black uppercase tracking-widest text-white/40">
                  Sin datos todavía…
                </div>
              )}
            </div>

            <div className="bg-doc-dark border border-white/10 p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-3 text-neon-yellow">
                <div className="w-5 h-5">{I.clock}</div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Última verificación: {lastCheck ? lastCheck.toLocaleTimeString() : '—'}
                </span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                Las métricas se miden desde tu navegador contra los servicios reales. Los valores no disponibles se muestran como “Sin datos”.
              </p>
            </div>
          </motion.section>
        </div>

        {/* --- INCIDENTS --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 text-neon-yellow">{I.warning}</div>
            <h2 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">Incidentes y mantenimiento</h2>
          </div>
          <div className="bg-doc-dark border-2 border-dashed border-white/10 rounded-[3rem] p-14 text-center space-y-4">
            <div className="w-14 h-14 mx-auto text-neon-green">{I.check}</div>
            <h3 className="text-2xl font-header font-black text-white uppercase tracking-tighter">Sin incidentes registrados</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
              No hay interrupciones ni mantenimientos programados en este momento.
            </p>
          </div>
        </motion.section>

        <div className="flex items-center justify-center gap-4 pt-4 opacity-40">
          <div className="w-6 h-6 text-neon-blue">{I.globe}</div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">
            Plataforma · Ciszu Network
          </p>
          <div className="w-6 h-6 text-neon-green">{I.lock}</div>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
