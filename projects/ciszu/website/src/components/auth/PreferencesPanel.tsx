'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { LanguagesModal, useToast, LANGUAGE_OPTIONS, isLangAvailable, getLangLabel, LANG_BLOCKED_MESSAGE } from '@ciszu/ui';
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

const IcoZoomMinus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IcoZoomPlus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

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
  const { theme, setTheme, language, setLanguage, zoom, setZoom, tabMuted, setTabMuted, user } = useAppStore();
  const { toast } = useToast();
  const [langOpen, setLangOpen] = useState(false);

  // Aplicar preferencias persistidas al montar
  useEffect(() => {
    const prefs = loadPreferences();
    applyZoom(prefs.zoom);
    setMuteTab(prefs.tabMuted);
  }, []);

  const syncToProfile = () => {
    if (!user) return;
    syncPreferencesToProfile(user.id, loadPreferences());
  };

  const handleLangSelect = (code: string) => {
    if (!isLangAvailable(code)) {
      // Idiomas bloqueados: toast de ERROR (rojo), nada más.
      toast(LANG_BLOCKED_MESSAGE, 'error');
      return;
    }
    if (code === language) return;
    // Los 4 idiomas son individuales: se guarda el código exacto.
    setLanguage(code as any);
    toast(`Idioma cambiado a ${getLangLabel(code)}`, 'info');
    syncToProfile();
  };

  const handleThemeChange = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
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
    toast(next ? 'Pestaña silenciada' : 'Pestaña restaurada', 'info');
    syncToProfile();
  };

  // Guards de navegación (preferencias locales, default activo).
  const [redirectGuard, setRedirectGuardPref] = useState(() => loadPreferences().redirectGuard);
  const [activityGuard, setActivityGuardPref] = useState(() => loadPreferences().activityGuard);

  const toggleRedirectGuard = () => {
    const next = !redirectGuard;
    setRedirectGuardPref(next);
    updatePreferences({ redirectGuard: next });
    toast(next ? 'Aviso de redirección activado' : 'Aviso de redirección desactivado', 'info');
    syncToProfile();
  };

  const toggleActivityGuard = () => {
    const next = !activityGuard;
    setActivityGuardPref(next);
    updatePreferences({ activityGuard: next });
    toast(next ? 'Protección de acciones activada' : 'Protección de acciones desactivada', 'info');
    syncToProfile();
  };

  const isDark = theme === 'dark';
  // Clases adaptadas al tema claro/oscuro (mismos controles que el navbar).
  const surfaceBtn = isDark
    ? 'bg-white/5 border-white/10 text-white hover:border-brand-light/50 hover:text-brand-light'
    : 'bg-black/5 border-black/10 text-black hover:border-brand-light/70 hover:text-brand-dark';
  const surfaceActive = (active: boolean, activeCls: string) =>
    active ? activeCls : surfaceBtn;

  const sectionTitleCls = `text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white/40' : 'text-black/50'}`;

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === language) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="px-2 pt-1 pb-2 space-y-4">
      {/* Tema e idioma: mismos controles que el navbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleThemeChange}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
            isDark ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
          title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {isDark ? (
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

        <button
          onClick={() => setLangOpen(true)}
          className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer active:scale-95 group ${
            isDark ? 'bg-white/5 border-white/10 text-white hover:border-brand-light/50' : 'bg-black/5 border-black/10 text-black hover:border-brand-light/70'
          }`}
          title="Cambiar idioma"
        >
          <span className="flex items-center gap-2 text-xs font-header font-bold uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Idioma
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full overflow-hidden shadow-inner border" style={{ borderColor: 'var(--border, rgba(255,255,255,0.1))' }}>{currentLang.flag}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-light" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      {/* Zoom (barra con botones −/+ en extremos; inicia en 100%) */}
      <div>
        <p className={sectionTitleCls}>Zoom</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            className={`p-2 rounded-lg border transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 ${surfaceBtn}`}
            title="Quitar zoom"
            aria-label="Quitar zoom"
          >
            <IcoZoomMinus />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className={`relative flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-light to-brand-accent transition-all duration-200"
                style={{ width: `${((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%` }}
              />
            </div>
            <span className="w-12 text-center text-xs font-header font-black text-brand-light tabular-nums shrink-0">{zoom}%</span>
          </div>
          <button
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            className={`p-2 rounded-lg border transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 ${surfaceBtn}`}
            title="Sumar zoom"
            aria-label="Sumar zoom"
          >
            <IcoZoomPlus />
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <button
        onClick={toggleMuteTab}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
          tabMuted
            ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
            : surfaceBtn
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
        <span className={`w-9 h-5 rounded-full relative transition-colors ${tabMuted ? 'bg-red-500/70' : isDark ? 'bg-white/15' : 'bg-black/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tabMuted ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      {/* Navegación segura */}
      <div>
        <p className={sectionTitleCls}>Navegación</p>
        {/* Guard azul: aviso de redirección a otras webs */}
        <button
          onClick={toggleRedirectGuard}
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
            redirectGuard
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20'
              : surfaceBtn
          }`}
          title="Aviso de redirección"
        >
          <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Aviso de redirección
          </span>
          <span className={`w-9 h-5 rounded-full relative transition-colors ${redirectGuard ? 'bg-blue-500/70' : isDark ? 'bg-white/15' : 'bg-black/15'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${redirectGuard ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
        {/* Guard rojo: protección de acciones no recuperables */}
        <button
          onClick={toggleActivityGuard}
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 mt-2 ${
            activityGuard
              ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
              : surfaceBtn
          }`}
          title="Protección de acciones no recuperables"
        >
          <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Proteger acciones
          </span>
          <span className={`w-9 h-5 rounded-full relative transition-colors ${activityGuard ? 'bg-red-500/70' : isDark ? 'bg-white/15' : 'bg-black/15'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${activityGuard ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
      </div>

      {/* Ayuda */}
      <div>
        <p className={sectionTitleCls}>Ayuda</p>
        <div className="grid grid-cols-1 gap-1">
          {HELP_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-header font-bold transition-all ${
                isDark ? 'text-gray-400 hover:text-brand-light hover:bg-white/5' : 'text-gray-600 hover:text-brand-dark hover:bg-black/5'
              }`}
            >
              <span className="text-brand-light/70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {user && (
        <p className={`text-[9px] font-bold uppercase tracking-widest text-center ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          Preferencias sincronizadas con tu cuenta
        </p>
      )}

      <LanguagesModal
        open={langOpen}
        title="Seleccionar idioma"
        current={language}
        onSelect={(code: string) => handleLangSelect(code as any)}
        onClose={() => setLangOpen(false)}
        langs={LANGUAGE_OPTIONS.map((l) => ({
          ...l,
          available: isLangAvailable(l.code),
          active: l.code === language,
        }))}
      />
    </div>
  );
}