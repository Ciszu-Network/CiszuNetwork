'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/config/supabase';
import { LANGS } from '@/config/navigation';
import {
  loadPreferences,
  updatePreferences,
  applyZoom,
  setMuteTab,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
} from '@/lib/preferences';

export default function PreferencesPanel() {
  const { lang, setLang, darkMode, setDarkMode, user, showToast } = useAppStore();
  const [zoom, setZoom] = useState<number>(100);
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    const prefs = loadPreferences();
    setZoom(prefs.zoom);
    setMuted(prefs.muteTab);
    applyZoom(prefs.zoom);
    setMuteTab(prefs.muteTab);
    setLang(prefs.lang);
    setDarkMode(prefs.theme === 'dark');
  }, []);

  const persist = () => {
    return updatePreferences({
      lang,
      theme: darkMode ? 'dark' : 'light',
      zoom,
      muteTab: muted,
    });
  };

  // Persistir localStorage + sincronizar a la nube si hay sesión
  useEffect(() => {
    persist();
    if (!user) return;
    supabase
      .from('profiles')
      .update({
        settings_lang: lang,
        settings_theme: darkMode ? 'dark' : 'light',
        settings_controls: { zoom, mute_tab: muted },
      })
      .eq('id', user.id)
      .then((res: { error: Error | null }) => {
        if (res.error) console.error('[PreferencesPanel] Error sincronizando ajustes:', res.error);
      });
  }, [lang, darkMode, zoom, muted, user?.id]);

  const applyLang = (code: string) => {
    setLang(code);
    updatePreferences({ lang: code });
    showToast(`[SISTEMA]: Idioma cambiado a ${code}`);
  };

  const applyTheme = () => {
    setDarkMode(!darkMode);
    updatePreferences({ theme: !darkMode ? 'dark' : 'light' });
    showToast(!darkMode ? '[SISTEMA]: Modo claro activado.' : '[SISTEMA]: Modo oscuro activado.');
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
    setZoom(next);
    applyZoom(next);
    updatePreferences({ zoom: next });
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMuteTab(next);
    updatePreferences({ muteTab: next });
    showToast(next ? '[SISTEMA]: Pestaña silenciada.' : '[SISTEMA]: Pestaña restaurada.');
  };

  return (
    <div className="px-2 pt-1 pb-2 space-y-4">
      {/* Tema y Idioma: mismos controles que el navbar */}
      <div className="flex items-center justify-between gap-2">
        {/* Theme toggle (mismo estilo que el sidebar del navbar) */}
        <button
          onClick={applyTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
            darkMode ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
          title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Idioma */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {LANGS.map((l) => {
            const active = lang === l.code;
            const isAlt = !l.code.startsWith('ES') && !l.code.startsWith('EN');
            return (
              <button
                key={l.code}
                onClick={() => applyLang(l.code)}
                className={`relative rounded-full transition-transform duration-300 cursor-pointer ${
                  active ? 'scale-105' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0 scale-95'
                } ${isAlt ? 'hidden sm:block' : ''}`}
                title={l.label}
              >
                {l.flag}
                {active && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full border border-white bg-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zoom */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Zoom</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            className="w-9 h-9 shrink-0 rounded-lg bg-white/5 border border-white/10 text-white hover:border-neon-blue/50 hover:text-neon-cyan transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center"
            title="Quitar zoom"
            aria-label="Quitar zoom"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-200"
                style={{ width: `${((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%` }}
              />
            </div>
            <span className="w-12 text-center text-xs font-header font-black text-neon-cyan tabular-nums shrink-0">{zoom}%</span>
          </div>
          <button
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            className="w-9 h-9 shrink-0 rounded-lg bg-white/5 border border-white/10 text-white hover:border-neon-blue/50 hover:text-neon-cyan transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center"
            title="Sumar zoom"
            aria-label="Sumar zoom"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <button
        onClick={toggleMute}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
          muted
            ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
            : 'bg-white/5 border-white/10 text-white/80 hover:border-neon-purple/50 hover:text-neon-purple'
        }`}
        title="Silenciar pestaña"
      >
        <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {muted ? (
              <g>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </g>
            ) : (
              <g>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </g>
            )}
          </svg>
          Silenciar pestaña
        </span>
        <span className={`w-9 h-5 rounded-full relative transition-colors ${muted ? 'bg-red-500/70' : 'bg-white/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${muted ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      {/* Ayuda */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Ayuda</p>
        <div className="grid grid-cols-1 gap-1">
          {[
            { href: '/help', label: 'Centro de Ayuda' },
            { href: '/faq', label: 'Preguntas Frecuentes' },
            { href: '/support', label: 'Soporte Técnico' },
            { href: '/rules', label: 'Normas del Juego' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-header font-bold text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {user && (
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center">
          Preferencias sincronizadas con tu cuenta
        </p>
      )}
    </div>
  );
}