'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  applyZoom,
  loadPreferences,
  setMuteTab,
  syncPreferencesToProfile,
  updatePreferences,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '@/lib/preferences';

interface PreferencesPanelProps {
  lang: 'es' | 'en';
  isDark: boolean;
  userId?: string | null;
  onSetLang: (code: 'es' | 'en') => void;
  onToggleTheme: () => void;
}

const IcoZoomMinus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IcoZoomPlus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="11" y1="8" x2="11" y2="14" />
  </svg>
);

const IcoVolume = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IcoVolumeOff = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const IcoHelp = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * Panel de preferencias del botón AUTH. Idioma, tema, zoom (persistido),
 * silenciar pestaña y sección de ayuda. Se guarda SIEMPRE en localStorage
 * (ciszu_preferences) y, si hay sesión de CISZU ID, se sincroniza también al
 * perfil (ciszubot.profiles).
 */
export default function PreferencesPanel({ lang, isDark, userId, onSetLang, onToggleTheme }: PreferencesPanelProps) {
  const [zoom, setZoomState] = useState<number>(100);
  const [muteTab, setMuteTabState] = useState<boolean>(false);

  useEffect(() => {
    const prefs = loadPreferences();
    setZoomState(prefs.zoom);
    setMuteTabState(prefs.muteTab);
    applyZoom(prefs.zoom);
    setMuteTab(prefs.muteTab);
  }, []);

  const persist = (patch: Parameters<typeof updatePreferences>[0]) => {
    const next = updatePreferences(patch);
    if (userId) void syncPreferencesToProfile(userId, next);
  };

  const setZoom = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
    setZoomState(next);
    applyZoom(next);
    persist({ zoom: next });
  };

  const toggleMuteTab = () => {
    const next = !muteTab;
    setMuteTabState(next);
    setMuteTab(next);
    persist({ muteTab: next });
  };

  const handleLanguage = (code: 'es' | 'en') => {
    if (code !== lang) {
      if (userId) persist({ lang: code });
      onSetLang(code);
    }
  };

  const handleTheme = () => {
    const next: 'dark' | 'light' = isDark ? 'light' : 'dark';
    persist({ theme: next });
    onToggleTheme();
  };

  return (
    <div className="border-t border-border">
      <p className="px-4 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-faint">
        Preferencias
      </p>

      {/* Idioma */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-ink/85">Idioma</span>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(['es', 'en'] as const).map((code) => (
            <button
              key={code}
              onClick={() => handleLanguage(code)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase transition ${
                lang === code ? 'bg-[#5865F2] text-white' : 'bg-card text-faint hover:text-ink'
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tema */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-ink/85">Tema</span>
        <button
          onClick={handleTheme}
          aria-label="Cambiar tema"
          className={`w-14 flex items-center rounded-full border px-0.5 py-0.5 transition-all cursor-pointer ${
            isDark ? 'justify-end bg-[#5865F2]/40 border-[#5865F2]/50' : 'justify-start bg-card border-border'
          }`}
        >
          <span className={`w-4 h-4 rounded-full shadow transition-colors ${isDark ? 'bg-[#5865F2]' : 'bg-yellow-400'}`} />
        </button>
      </div>

      {/* Zoom */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-ink/85">Zoom</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Reducir zoom"
            className="p-1.5 rounded-md bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <IcoZoomMinus />
          </button>
          <span className="w-11 text-center text-[11px] font-black tabular-nums">{zoom}%</span>
          <button
            onClick={() => setZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Aumentar zoom"
            className="p-1.5 rounded-md bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <IcoZoomPlus />
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-ink/85">Silenciar pestaña</span>
        <button
          onClick={toggleMuteTab}
          aria-label="Silenciar pestaña"
          className={`p-1.5 rounded-md border transition ${
            muteTab ? 'bg-[#5865F2]/15 border-[#5865F2]/50 text-[#5865F2]' : 'bg-card border-border text-faint hover:text-ink'
          }`}
        >
          {muteTab ? <IcoVolumeOff /> : <IcoVolume />}
        </button>
      </div>

      {/* Ayuda */}
      <div className="px-4 py-2 border-t border-border/70">
        <Link
          href="/soporte"
          className="flex items-center gap-2 text-xs font-bold text-ink/85 hover:text-neon-blue transition"
        >
          <IcoHelp /> Ayuda y soporte
        </Link>
      </div>
    </div>
  );
}