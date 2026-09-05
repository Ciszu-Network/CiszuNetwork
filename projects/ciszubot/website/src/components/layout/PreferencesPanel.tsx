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
import type { Lang } from '@/lib/i18n';
import { LanguagesModal, useToast, LANGUAGE_OPTIONS, isLangAvailable, LANG_BLOCKED_MESSAGE, setCookieConsent, clearCookieConsent, useCookieConsent } from '@ciszu/ui';

interface PreferencesPanelProps {
  lang: Lang;
  isDark: boolean;
  userId?: string | null;
  /** Cambia el idioma: cookie + preferencias + toast azul + recarga. */
  onSetLang: (code: Lang) => void;
  /** Cambia el tema: clase .dark + preferencias + toast azul + recarga. */
  onToggleTheme: () => void;
}

const MoonIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth={1}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
  </svg>
);

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
 * Panel de preferencias locales del botón AUTH (sistema compartido con las
 * demás webs). Idioma (LanguagesModal con 4 idiomas individuales + bloqueo),
 * tema (mismo botón sol/luna que el resto de webs), zoom, silenciar pestaña,
 * guards de navegación y ayuda. Los cambios de idioma/tema avisan con toast
 * azul y recargan la página (lo gestiona el Navbar vía onSetLang/onToggleTheme).
 */
export default function PreferencesPanel({ lang, isDark, userId, onSetLang, onToggleTheme }: PreferencesPanelProps) {
  const { toast } = useToast();
  const [langOpen, setLangOpen] = useState(false);
  const [zoom, setZoomState] = useState<number>(100);
  const [muteTab, setMuteTabState] = useState<boolean>(false);
  const [redirectGuard, setRedirectGuardState] = useState<boolean>(true);
  const [activityGuard, setActivityGuardState] = useState<boolean>(true);

  useEffect(() => {
    const prefs = loadPreferences();
    setZoomState(prefs.zoom);
    setMuteTabState(prefs.muteTab);
    setRedirectGuardState(prefs.redirectGuard);
    setActivityGuardState(prefs.activityGuard);
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
    toast(next ? 'Pestaña silenciada' : 'Pestaña restaurada', 'info');
  };

  const toggleRedirectGuard = () => {
    const next = !redirectGuard;
    setRedirectGuardState(next);
    persist({ redirectGuard: next });
    toast(next ? 'Aviso de redirección activado' : 'Aviso de redirección desactivado', 'info');
  };

  const toggleActivityGuard = () => {
    const next = !activityGuard;
    setActivityGuardState(next);
    persist({ activityGuard: next });
    toast(next ? 'Protección de acciones activada' : 'Protección de acciones desactivada', 'info');
  };

  const handleLangSelect = (code: string) => {
    if (!isLangAvailable(code)) {
      // Idiomas bloqueados: toast de ERROR (rojo).
      toast(LANG_BLOCKED_MESSAGE, 'error');
      return;
    }
    if (code !== lang) {
      persist({ lang: code as Lang });
      onSetLang(code as Lang);
    }
  };

  const handleTheme = () => {
    persist({ theme: isDark ? 'light' : 'dark' });
    onToggleTheme();
  };

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === lang) ?? LANGUAGE_OPTIONS[0];

  // ── Cookies: el usuario SIEMPRE puede rechazar o reaparecer el aviso. ──
  const cookieConsent = useCookieConsent();
  const cookieStateLabel = cookieConsent === 'accepted' ? 'Aceptadas' : cookieConsent === 'rejected' ? 'Rechazadas' : 'Sin decidir';
  const cookieStateCls = cookieConsent === 'accepted'
    ? 'bg-green-500/10 border-green-500/40 text-green-400'
    : cookieConsent === 'rejected'
      ? 'bg-red-500/10 border-red-500/40 text-red-400'
      : 'bg-card border-border text-ink';

  const handleCookieReject = () => {
    setCookieConsent('rejected');
    toast('Cookies rechazadas: los servicios opcionales están desactivados.', 'info');
    window.setTimeout(() => window.location.reload(), 1800);
  };
  const handleCookieAccept = () => {
    setCookieConsent('accepted');
    toast('Cookies aceptadas. Gracias por apoyar a CiszuBot.', 'info');
    window.setTimeout(() => window.location.reload(), 1800);
  };
  const handleCookieReappear = () => {
    clearCookieConsent();
    toast('El aviso de cookies volverá a aparecer.', 'info');
    window.setTimeout(() => window.location.reload(), 1800);
  };

  const rowLabel = 'text-xs font-bold text-ink/85';
  const iconBtn = (active: boolean, activeCls: string) =>
    `p-1.5 rounded-md border transition cursor-pointer ${
      active ? activeCls : 'bg-card border-border text-faint hover:text-ink'
    }`;

  return (
    <div className="space-y-4">
      {/* Tema e idioma: mismos controles que el navbar (sol/luna + selector) */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleTheme}
          aria-label="Cambiar tema"
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group shrink-0 ${
            isDark ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
        >
          {isDark ? (
            <MoonIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:-rotate-12" />
          ) : (
            <SunIcon className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-card border border-border text-ink hover:border-neon-blue/60 transition-all active:scale-95 cursor-pointer"
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
            <span className="w-6 h-6 rounded-full overflow-hidden shadow-inner border border-border shrink-0">{currentLang.flag}</span>
            <span className="hidden sm:inline text-[11px] font-bold text-muted truncate max-w-[90px]">{currentLang.label}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-neon-blue" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      {/* Zoom */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint mb-1.5">Zoom</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Quitar zoom"
            className="p-1.5 rounded-md bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0 cursor-pointer"
          >
            <IcoZoomMinus />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="relative flex-1 h-2 rounded-full bg-border/60 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-pink transition-all duration-200"
                style={{ width: `${((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%` }}
              />
            </div>
            <span className="w-11 text-center text-[11px] font-black tabular-nums shrink-0">{zoom}%</span>
          </div>
          <button
            onClick={() => setZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Sumar zoom"
            className="p-1.5 rounded-md bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0 cursor-pointer"
          >
            <IcoZoomPlus />
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <div className="flex items-center justify-between gap-3">
        <span className={rowLabel}>Silenciar pestaña</span>
        <button
          onClick={toggleMuteTab}
          aria-label="Silenciar pestaña"
          className={iconBtn(muteTab, 'bg-[#5865F2]/15 border-[#5865F2]/50 text-[#5865F2]')}
        >
          {muteTab ? <IcoVolumeOff /> : <IcoVolume />}
        </button>
      </div>

      {/* Cookies: rechazar en cualquier momento o reaparecer el aviso */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint mb-1.5">Cookies</p>
        <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border ${cookieStateCls}`}>
          <span className="flex items-center gap-2 text-xs font-bold">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 0-6.88 17.26c1.89 1.74 4.3 2.74 6.88 2.74 5.52 0 10-4.48 10-10 0-2.58-1-5-2.74-6.88C17.52 3 15 2 12 2zm1 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            Cookies
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest">{cookieStateLabel}</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {cookieConsent !== 'rejected' && (
            <button
              onClick={handleCookieReject}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
              Rechazar cookies
            </button>
          )}
          {cookieConsent !== 'accepted' && (
            <button
              onClick={handleCookieAccept}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue transition-all active:scale-95 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Aceptar cookies
            </button>
          )}
          <button
            onClick={handleCookieReappear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-ink hover:border-neon-blue hover:text-neon-blue transition-all active:scale-95 text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reaparecer aviso de cookies
          </button>
        </div>
      </div>

      {/* Navegación segura */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-faint mb-1.5">Navegación</p>
        <div className="flex items-center justify-between gap-3">
          <span className={rowLabel}>Aviso de redirección</span>
          <button
            onClick={toggleRedirectGuard}
            aria-label="Aviso de redirección"
            title="Aviso azul al salir a otra web"
            className={iconBtn(redirectGuard, 'bg-blue-500/15 border-blue-500/50 text-blue-400')}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className={rowLabel}>Proteger acciones</span>
          <button
            onClick={toggleActivityGuard}
            aria-label="Protección de acciones no recuperables"
            title="Aviso rojo si vas a perder progreso al navegar"
            className={iconBtn(activityGuard, 'bg-red-500/15 border-red-500/50 text-red-400')}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ayuda */}
      <div className="border-t border-border/70 pt-3">
        <Link
          href="/soporte"
          className="flex items-center gap-2 text-xs font-bold text-ink/85 hover:text-neon-blue transition"
        >
          <IcoHelp /> Ayuda y soporte
        </Link>
      </div>

      <LanguagesModal
        open={langOpen}
        title="Seleccionar idioma"
        current={lang}
        onSelect={handleLangSelect}
        onClose={() => setLangOpen(false)}
        langs={LANGUAGE_OPTIONS.map((l) => ({
          ...l,
          available: isLangAvailable(l.code),
          active: l.code === lang,
        }))}
      />
    </div>
  );
}