'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import {
  loadPreferences,
  updatePreferences,
  applyZoom,
  setMuteTab,
  syncPreferencesToProfile,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
} from '@/lib/preferences';

const HELP_LINKS = [
  { href: '/support', label: 'Centro de Soporte', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ) },
  { href: '/faq', label: 'Preguntas Frecuentes', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ) },
  { href: '/contact', label: 'Contacto', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ) },
  { href: '/guidelines', label: 'Guías', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ) },
];

export default function PreferencesPanel() {
  const { theme, setTheme, language, setLanguage, zoom, setZoom, tabMuted, setTabMuted, user, showToast } = useAppStore();

  // Aplicar preferencias persistidas al montar (cajita, fuera del evento de click).
  useEffect(() => {
    const prefs = loadPreferences();
    applyZoom(prefs.zoom);
    setMuteTab(prefs.tabMuted);
  }, []);

  const syncToProfile = () => {
    if (!user) return;
    syncPreferencesToProfile(user.id, loadPreferences());
  };

  const applyLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
    updatePreferences({ lang });
    showToast(lang === 'es' ? 'Idioma: Español' : 'Language: English');
    syncToProfile();
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updatePreferences({ theme: next });
    showToast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado');
    syncToProfile();
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
    setZoom(next);
    applyZoom(next);
    updatePreferences({ zoom: next });
    syncToProfile();
  };

  const toggleMuteTab = () => {
    const next = !tabMuted;
    setTabMuted(next);
    setMuteTab(next);
    updatePreferences({ tabMuted: next });
    showToast(next ? 'Pestaña silenciada' : 'Pestaña restaurada');
    syncToProfile();
  };

  const langBtnCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-header font-bold uppercase tracking-widest transition-all active:scale-95 ${
      active
        ? 'bg-brand-light/20 border-brand-light/50 text-brand-light shadow-[0_0_10px_rgba(58,107,240,0.3)]'
        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
    }`;

  const sectionTitleCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2';

  return (
    <div className="px-2 pt-1 pb-2 space-y-4">
      {/* Tema e idioma: mismos controles que el navbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
            theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {theme === 'dark' ? (
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

        <div className="flex items-center gap-1.5">
          <button onClick={() => applyLanguage('es')} className={langBtnCls(language === 'es')} title="Español">
            <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full overflow-hidden"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/></svg>
            ES
          </button>
          <button onClick={() => applyLanguage('en')} className={langBtnCls(language === 'en')} title="English">
            <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full overflow-hidden"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/></svg>
            EN
          </button>
        </div>
      </div>

      {/* Zoom */}
      <div>
        <p className={sectionTitleCls}>Zoom</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-brand-light/50 font-header font-black text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Disminuir zoom"
          >
            −
          </button>
          <span className="w-16 text-center text-xs font-header font-black text-brand-light">{zoom}%</span>
          <button
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-brand-light/50 font-header font-black text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Aumentar zoom"
          >
            +
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <button
        onClick={toggleMuteTab}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
          tabMuted
            ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
            : 'bg-white/5 border-white/10 text-white/80 hover:border-brand-light/50 hover:text-brand-light'
        }`}
        title="Silenciar pestaña"
      >
        <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {tabMuted ? (
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
        <span className={`w-9 h-5 rounded-full relative transition-colors ${tabMuted ? 'bg-red-500/70' : 'bg-white/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tabMuted ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      {/* Ayuda */}
      <div>
        <p className={sectionTitleCls}>Ayuda</p>
        <div className="grid grid-cols-1 gap-1">
          {HELP_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-header font-bold text-gray-400 hover:text-brand-light hover:bg-white/5 transition-all"
            >
              <span className="text-brand-light/70">{item.icon}</span>
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