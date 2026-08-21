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

const LANGS_DISPLAY = [
  { code: 'ES-LA', label: 'Español (Latam)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner">
      <rect width="512" height="170.6" fill="#ffcc00"/>
      <rect width="512" height="170.6" y="170.6" fill="#003399"/>
      <rect width="512" height="170.6" y="341.2" fill="#cf142b"/>
      <g fill="#fff" transform="translate(256,230) scale(4)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-67.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(67.5) translate(0,-18) scale(0.4)"/>
      </g>
    </svg>
  ) },
  { code: 'ES-ES', label: 'Español (España)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg> },
  { code: 'EN-US', label: 'English (US)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner font-sans">
      <rect width="512" height="512" fill="#bd3d44"/>
      <rect width="512" height="36" y="36.5" fill="#fff"/><rect width="512" height="36" y="109.5" fill="#fff"/><rect width="512" height="36" y="182.5" fill="#fff"/><rect width="512" height="36" y="255.5" fill="#fff"/><rect width="512" height="36" y="328.5" fill="#fff"/><rect width="512" height="36" y="401.5" fill="#fff"/><rect width="512" height="36" y="474.5" fill="#fff"/>
      <rect width="240" height="260" fill="#192f5d"/>
      <g fill="#fff">
        <circle cx="30" cy="35" r="5"/><circle cx="70" cy="35" r="5"/><circle cx="110" cy="35" r="5"/><circle cx="150" cy="35" r="5"/><circle cx="190" cy="35" r="5"/>
        <circle cx="50" cy="65" r="5"/><circle cx="90" cy="65" r="5"/><circle cx="130" cy="65" r="5"/><circle cx="170" cy="65" r="5"/><circle cx="210" cy="65" r="5"/>
        <circle cx="30" cy="95" r="5"/><circle cx="70" cy="95" r="5"/><circle cx="110" cy="95" r="5"/><circle cx="150" cy="95" r="5"/><circle cx="190" cy="95" r="5"/>
        <circle cx="50" cy="125" r="5"/><circle cx="90" cy="125" r="5"/><circle cx="130" cy="125" r="5"/><circle cx="170" cy="125" r="5"/><circle cx="210" cy="125" r="5"/>
        <circle cx="30" cy="155" r="5"/><circle cx="70" cy="155" r="5"/><circle cx="110" cy="155" r="5"/><circle cx="150" cy="155" r="5"/><circle cx="190" cy="155" r="5"/>
      </g>
    </svg>
  ) },
  { code: 'EN-UK', label: 'English (UK)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg> },
  { code: 'PT', label: 'Português (Brasil)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg> },
  { code: 'FR', label: 'Français', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg> },
  { code: 'IT', label: 'Italiano', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg> },
  { code: 'DE', label: 'Deutsch', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg> },
  { code: 'RU', label: 'Русский', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg> },
  { code: 'JA', label: '日本語 (Japanese)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg> },
  { code: 'KO', label: '한국어 (Korean)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg> },
];

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
        <div className="flex items-center gap-1.5 flex-wrap">
          {LANGS_DISPLAY.map((l) => {
            const isEs = l.code.startsWith('ES');
            const isEn = l.code.startsWith('EN');
            const isActive = (isEs && lang === 'es') || (isEn && lang === 'en');
            const isAlt = !isEs && !isEn;
            return (
              <button
                key={l.code}
                onClick={() => { if (isEs || isEn) handleLanguage(isEs ? 'es' : 'en'); }}
                className={`relative rounded-full transition-transform duration-300 cursor-pointer ${
                  isActive ? 'scale-105' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0 scale-95'
                } ${isAlt ? 'hidden sm:block' : ''}`}
                title={l.label}
              >
                {l.flag}
                {isActive && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full border border-white bg-green-400" />
                )}
              </button>
            );
          })}
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