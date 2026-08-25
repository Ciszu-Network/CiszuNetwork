'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { useZoomStatus, publishHeaderMode, useToast } from '@ciszu/ui';
import { PreferencesModal } from '@ciszu/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';
import { supabase } from '@/config/supabase';

// ── All icons and configs migrated to src/config/navigation.tsx ───────────────────
import { I, MAIN_NAV_LINKS as NAV_LINKS, COMMUNITY_LINKS, GENERAL_INFO_LINKS, LEGAL_LINKS, ALL_PAGES, LANGS } from '@/config/navigation';
import { isTauri } from '@/lib/isTauri';
import { getGuestName } from '@/lib/guest';
import { loadPreferences, applyZoom, setMuteTab, updatePreferences } from '@/lib/preferences';
import PreferencesPanel from '@/components/molecules/PreferencesPanel';

const INFO_LINKS = [ ...COMMUNITY_LINKS, ...GENERAL_INFO_LINKS, ...LEGAL_LINKS ].filter((v, i, a) => a.findIndex(t => (t.href === v.href)) === i);

export const NavbarContent = () => {
  const pathname  = usePathname();
  const router    = useRouter();
  const { isMusicPlaying,  toggleMusic,  isNavigating,  setIsNavigating,  isMenuOpen,  setIsMenuOpen,  sidebarView,  setSidebarView,  darkMode,  setDarkMode,  lang,  setLang,  user,  setUser } = useAppStore();
  const { toast } = useToast();
  const [isInfoOpen,    setIsInfoOpen]    = useState(false);
  const [isAccederOpen, setIsAccederOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isSearchOpen,  setIsSearchOpen]  = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [query,         setQuery]         = useState('');
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [guestName, setGuestName] = useState<string>('');

  const zoom = useZoomStatus();
  const isZoomWarning = !zoom.dismissed && zoom.status !== 'normal';

  const infoTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accederTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef    = useRef<HTMLDivElement | null>(null);
  const inputRef     = useRef<HTMLInputElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);

  const suggestions = query.length > 0
    ? ALL_PAGES.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : ALL_PAGES.slice(0, 6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    
    // Initial checks
    onScroll();
    setIsDesktopApp(isTauri());

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Nombre de invitado unificado (misma clave que /play) para el botón AUTH
  useEffect(() => {
    setGuestName(getGuestName());
  }, []);

  // Aplicar preferencias locales guardadas (zoom, idioma, tema, pestaña silenciada)
  useEffect(() => {
    const prefs = loadPreferences();
    applyZoom(prefs.zoom);
    setMuteTab(prefs.muteTab);
    setLang(prefs.lang);
    setDarkMode(prefs.theme === 'dark');
  }, []);

  const floating = scrolled && !isSearchOpen && !isMenuOpen && !isAccederOpen && !isZoomWarning;

  const prevHeaderMode = useRef<'island' | 'full' | null>(null);
  useEffect(() => {
    const mode = floating ? 'island' : 'full';
    if (prevHeaderMode.current !== mode) {
      prevHeaderMode.current = mode;
      publishHeaderMode(mode);
    }
  }, [floating]);

  const searchParams = useSearchParams();

  const isFirstRender = useRef(true);

  // Clear states and stop navigation loader on completed route change
  useEffect(() => { 
    setIsMenuOpen(false); 
    setSidebarView('main');
    setIsAccederOpen(false); 
    setIsSearchOpen(false); 
    setQuery(''); 
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        setIsNavigating('refreshing');
        setTimeout(() => setIsNavigating(false), 2000);
      }
    } else {
      setIsNavigating(false);
    }
  }, [pathname, searchParams, setIsNavigating]);

  // Global click interceptor for navigation loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target?.href && target.href.startsWith(window.location.origin) && !target.href.includes('#') && target.target !== '_blank') {
        const targetUrl = new URL(target.href);
        if (targetUrl.pathname !== pathname || targetUrl.search !== searchParams.toString().replace(/^./, '?')) {
          setIsNavigating(true);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, searchParams, setIsNavigating]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isSearchOpen]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        if (searchToggleRef.current && searchToggleRef.current.contains(e.target as Node)) {
          return;
        }
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => pathname === href;

  // Pill active link: REVEAL text ONLY on hover/active.
  const navLinkCls = (href: string) => {
    const active = isActive(href);
    const isPlay = href === '/play';
    
    if (isPlay) {
      return `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
        active
          ? 'border-green-500 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-black gap-1.5 -translate-y-0.5 animate-pulse'
          : 'border-transparent text-white hover:border-green-500 hover:bg-green-500 hover:!text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]'
      }`;
    }
    
    return `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-white'
        : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
    }`;
  };

  const navLabelCls = (href: string) => {
    const active = isActive(href);
    return `max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[100px] ${active ? 'max-w-[100px]' : ''}`;
  };

  const toggleSearch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isSearchOpen) { setIsMenuOpen(false); setIsAccederOpen(false); }
    setIsSearchOpen(v => !v);
  };

  const toggleMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isMenuOpen) { setIsSearchOpen(false); setIsAccederOpen(false); }
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAcceder = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAccederOpen) { setIsSearchOpen(false); setIsMenuOpen(false); }
    setIsAccederOpen(v => !v);
  };

  const hoverOpen  = (s: (v:boolean)=>void, t: React.MutableRefObject<ReturnType<typeof setTimeout>|null>) => { if(t.current) clearTimeout(t.current); s(true); };
  const hoverClose = (s: (v:boolean)=>void, t: React.MutableRefObject<ReturnType<typeof setTimeout>|null>) => { t.current = setTimeout(()=>s(false), 180); };

  return (
    <>
      {/* Global Navigation Loader Icon */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-[#0a0a14]/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-300 ${
        isNavigating !== false
          ? 'translate-y-0 opacity-100 border-emerald-400/50 text-emerald-400' 
          : 'translate-y-10 opacity-0 pointer-events-none border-neon-blue/50 text-neon-blue'
      }`}>
        {isNavigating === 'navigating' ? (
          // Icono Cambio de página -> Flechas tipo "Fast Forward" brillando
          <svg className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Icono Refresh/Reload -> Flecha circular gruesa girando
          <svg className="w-8 h-8 animate-spin text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Global Warning Banner for Zoom — ver <ZoomWarning /> (layout, @ciszu/ui) */}

<nav className={`fixed z-50 transition-all duration-500 ease-out ${
          floating
            ? 'top-3 inset-x-3 rounded-2xl bg-[#0a0a14]/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]'
            : `top-0 left-0 w-full ${scrolled ? 'bg-black/92 backdrop-blur-2xl border-b border-white/10' : 'bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/5'} ${isZoomWarning ? 'mt-8' : 'mt-0'}`
        }`}>

        {/* Animated Line Separator Bottom */}
        <div className={`${floating ? 'hidden' : ''} absolute bottom-0 left-0 w-full h-[2px] transition-colors duration-500 animate-gradient-x ${
          isNavigating
            ? 'bg-[length:200%_auto] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400'
            : 'bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]'
        }`} />

        <div className="max-w-screen-xl mx-auto px-4">
          <div className={`flex items-center ${floating ? 'h-14' : 'h-[60px]'} gap-3`}>

             {/* Logo */}
             <Link href="/" className="flex items-center gap-2.5 group shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300">
               <Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
                 alt="Logo" width={36} height={36}
                 className="group-hover:drop-shadow-[0_0_15px_rgba(0,128,255,0.8)] group-hover:drop-shadow-[0_0_30px_rgba(145,70,255,0.6)] transition-all duration-300"
               />
<Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')}
                  alt="MuzicMania" width={160} height={36}
                  className="hidden lg:block group-hover:drop-shadow-[0_0_15px_rgba(0,128,255,0.8)] group-hover:drop-shadow-[0_0_30px_rgba(145,70,255,0.6)] transition-all duration-300"
               />
             </Link>

            {/* Separator */}
            <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

            {/* Desktop Nav - Dynamic Zoom Hiding & Active Prioritization */}
            <div className="flex items-center gap-1 flex-1 overflow-visible">
              {NAV_LINKS.filter(l => !(isDesktopApp && l.href === '/download')).map((link) => {
                const isLinkActive = isActive(link.href);
                const responsiveClass = isLinkActive ? 'flex' : link.hideCls;
                return (
                  <Link key={link.name} href={link.href} className={`${navLinkCls(link.href)} ${responsiveClass}`}>
                    <span className="flex items-center justify-center shrink-0">{link.icon}</span>
                    <span className={navLabelCls(link.href)}>{link.name}</span>
                  </Link>
                );
              })}

              {/* Contact */}
              <Link href="/contact" className={`${navLinkCls('/contact')} ${isActive('/contact') ? 'flex' : 'hidden min-[700px]:flex'}`}>
                <span className="flex items-center justify-center shrink-0">{I.contact}</span>
                <span className={navLabelCls('/contact')}>Contact</span>
              </Link>

              {/* Support */}
              <Link href="/support" className={`${navLinkCls('/support')} ${isActive('/support') ? 'flex' : 'hidden min-[750px]:flex'}`}>
                <span className="flex items-center justify-center shrink-0">{I.support}</span>
                <span className={navLabelCls('/support')}>Support</span>
              </Link>

              {/* Information dropdown (Must be the last item on the right of the links) */}
              <div className={`relative z-50 shrink-0 ${isActive('/information') || isInfoOpen ? 'flex' : 'hidden min-[800px]:flex'}`}
                onMouseEnter={() => hoverOpen(setIsInfoOpen, infoTimer)}
                onMouseLeave={() => hoverClose(setIsInfoOpen, infoTimer)}
              >
                <Link href="/information" className={navLinkCls('/information')}>
                  <span className="opacity-80 shrink-0">{I.info}</span>
                  <span className={navLabelCls('/information')}>Information</span>
                  {I.chevron(isInfoOpen)}
                </Link>
                {isInfoOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50 animate-fade-in-down origin-top drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                    <div className="bg-[#070710]/98 backdrop-blur-2xl border border-white/10 rounded-xl py-2 shadow-2xl">
                      {INFO_LINKS.map((s) => (
                        <Link key={s.name} href={s.href}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-header font-bold transition-all cursor-pointer ${isActive(s.href) ? 'text-neon-blue bg-neon-blue/5 hover:text-white' : 'text-white hover:text-neon-blue hover:bg-white/5'}`}
                        >
                          <span className="opacity-70">{s.icon}</span>{s.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto shrink-0 min-w-fit">
              {/* Search icon toggle */}
              <button
                ref={searchToggleRef}
                onClick={toggleSearch}
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] ${
                  isSearchOpen ? 'bg-neon-blue border-neon-blue text-black' : 'bg-white/5 border-white/20 text-white hover:border-neon-blue'
                }`}
                title="Search"
              >
                {isSearchOpen ? I.close : I.search}
              </button>

              {/* Hamburger contextual toggle (ALWAYS VISIBLE NEXT TO SEARCH) */}
              <button
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] ${
                  isMenuOpen ? 'bg-neon-blue border-neon-blue text-black' : 'bg-white/5 border-white/20 text-white hover:border-neon-blue'
                }`}
                onClick={toggleMenu}
                title="Game menu"
              >
                {isMenuOpen ? I.close : I.menu}
              </button>

              {/* Account / User Button + Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={toggleAcceder}
                    className="relative w-10 h-10 rounded-full border-2 border-neon-cyan/50 overflow-hidden hover:border-neon-cyan transition-all active:scale-95 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                    title={user.display_name}
                  >
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt={user.display_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-black text-xs">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={toggleAcceder}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_15px_rgba(255,51,204,0.4)] ${
                      isAccederOpen
                        ? 'bg-gradient-to-r from-neon-blue/40 via-[#6600ff]/40 to-neon-pink/40 border-neon-pink text-white'
                        : 'bg-gradient-to-r from-neon-blue/10 via-[#6600ff]/10 to-neon-pink/10 border-white/20 text-white hover:border-neon-pink'
                    }`}
                    title={guestName || 'Guest'}
                  >
                    <span className="relative w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue/30 via-[#6600ff]/30 to-neon-pink/30 border border-white/20 flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </span>
                    <span className="hidden sm:block max-w-[110px] truncate text-xs font-header font-bold text-white/85">
                      {guestName || 'Guest'}
                    </span>
                  </button>
                )}

                {isAccederOpen && (
                  <div className="absolute right-0 top-full pt-3 w-80 z-50 animate-fade-in-down origin-top">
                    <div className="bg-[#070710]/98 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
                      {user ? (
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full border-2 border-neon-cyan/50 overflow-hidden shrink-0">
                            {user.avatar_url ? (
                              <Image src={user.avatar_url} alt={user.display_name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-black text-xs">
                                {user.display_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-black text-xs uppercase tracking-widest truncate">{user.display_name}</p>
                            <p className="text-gray-500 text-[10px] font-bold truncate">@{user.username}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full border-2 border-neon-pink/50 bg-gradient-to-br from-neon-blue/40 via-[#6600ff]/40 to-neon-pink/40 flex items-center justify-center shrink-0 overflow-hidden">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-black text-xs uppercase tracking-widest truncate">{guestName || 'Guest'}</p>
                            <p className="text-gray-500 text-[10px] font-bold truncate">@{guestName.replace(/^Invitado/i, 'invitado').replace(/^Guest/i, 'guest').toLowerCase()}</p>
                          </div>
                        </div>
                      )}

                      {user ? (
                        <div className="p-2 border-b border-white/5 space-y-1">
                          <Link href={`/profile/@${user.username}`} className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-neon-cyan hover:bg-white/5 rounded-lg transition-all font-header font-bold text-xs">
                            {I.user} Mi Perfil
                          </Link>
                          <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all font-header font-bold text-xs">
                            {I.policy} Configuración
                          </Link>
                          <button
                            onClick={() => {
                              // Deslogueo optimista para evitar bloqueos si Supabase no responde
                              setUser(null);
                              router.push('/');
                              toast('[SISTEMA]: Sesión cerrada correctamente.', 'success');
                              // Ejecutar signOut en background
                              supabase.auth.signOut().catch(() => {});
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all font-header font-bold text-xs"
                          >
                            {I.login} Cerrar Sesión
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 border-b border-white/5">
                          <Link href="/login"
                            className="flex flex-col items-center gap-2 p-5 text-white font-header font-bold text-sm bg-gradient-to-br from-neon-green/30 to-neon-green/5 border-r border-white/10 hover:from-neon-green/50 transition-all cursor-pointer group shadow-[inset_0_0_20px_rgba(0,255,136,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,255,136,0.3)]"
                          >
                            <span className="w-10 h-10 rounded-full bg-neon-green/20 border border-neon-green/50 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,255,136,0.8)] group-hover:bg-neon-green/40 transition-all text-neon-green group-hover:text-white">
                              {I.login}
                            </span>
                            <span className="text-neon-green group-hover:text-white drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]">Login</span>
                          </Link>
                          <Link href="/register"
                            className="flex flex-col items-center gap-2 p-5 text-white font-header font-bold text-sm bg-gradient-to-bl from-neon-pink/30 to-neon-pink/5 hover:from-neon-pink/50 transition-all cursor-pointer group shadow-[inset_0_0_20px_rgba(255,51,204,0.1)] hover:shadow-[inset_0_0_30px_rgba(255,51,204,0.3)]"
                          >
                            <span className="w-10 h-10 rounded-full bg-neon-pink/20 border border-neon-pink/50 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,51,204,0.8)] group-hover:bg-neon-pink/40 transition-all text-neon-pink group-hover:text-white">
                              {I.register}
                            </span>
                            <span className="text-neon-pink group-hover:text-white drop-shadow-[0_0_8px_rgba(255,51,204,0.8)]">Register</span>
                          </Link>
                        </div>
                      )}

                      {/* Botón de preferencias locales -> abre el modal centrado */}
                      <div className="p-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsPrefsOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-header font-bold text-white/80 border border-white/10 bg-white/5 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all active:scale-95 cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          Preferencias locales
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal centrado de preferencias (Radix), con X de cierre */}
                <PreferencesModal open={isPrefsOpen} onOpenChange={setIsPrefsOpen} title="Preferencias locales">
                  <PreferencesPanel />
                </PreferencesModal>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Search Bar */}
        {isSearchOpen && (
          <div ref={searchRef} className="border-t border-white/5 bg-[#070710]/98 backdrop-blur-2xl">
            <div className="max-w-screen-xl mx-auto px-4 py-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{I.search}</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Seach pages in MuzicMania (example: home, bug, setup)..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && suggestions[0]) { router.push(suggestions[0].href); setIsSearchOpen(false); }}}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 focus:border-neon-blue rounded-xl text-white placeholder:text-gray-600 outline-none text-sm transition-all font-header font-bold"
                />
              </div>
              
              {/* Reset search button ONLY when no results and there is a query */}
              {query.trim().length > 0 && suggestions.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-6 animate-fade-in-down space-y-3">
                    <p className="text-gray-500 font-header font-black uppercase text-xs tracking-widest italic">No results found for "{query}"</p>
                    <button 
                      onClick={() => setQuery('')}
                      className="px-6 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-full font-header font-bold text-[10px] uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all active:scale-95"
                    >
                      Reiniciar búsqueda
                    </button>
                 </div>
              )}

              {/* Suggestions grid - ONLY SHOW WHEN TYPING AND HAS RESULTS */}
              {query.trim().length > 0 && suggestions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3 animate-fade-in-down">
                  {suggestions.map((p) => (
                    <Link key={p.href} href={p.href}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-neon-blue/50 hover:text-neon-blue text-white text-xs font-header font-bold transition-all cursor-pointer"
                    >
                      <span className="opacity-70 shrink-0">{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Slide-Right Contextual Menu (Sidebar) Fix: Fixed positioning to avoid clipping */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Main Menu Container - offset by header height (60px) */}
          <div className="absolute top-[60px] right-0 w-[320px] max-w-[85vw] h-[calc(100vh-60px)] bg-[#05050a]/95 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-right-fade">
            {/* Animated left divider to match header */}
            <div className="absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent shadow-[0_0_15px_rgba(0,212,255,0.5)] z-10" />
            
            {/* Header: Theme Toggle | MAIN MENU | Language Selector */}
            <div className="flex items-center justify-between px-5 pt-8 pb-6 border-b border-white/5 shrink-0">
              
              {/* Dark/Light Toggle (Yellow/Black or White/Black) Filled Icons */}
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  updatePreferences({ theme: darkMode ? 'light' : 'dark' });
                  toast(!darkMode ? '[SISTEMA]: Modo claro activado.' : '[SISTEMA]: Modo oscuro activado.');
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                  darkMode ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
                }`}
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
                    <circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round"/>
                  </svg>
                )}
              </button>

              <h2 className="text-neon-cyan text-base font-header font-black tracking-widest drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]">
                {sidebarView === 'main' ? 'MAIN MENU' : 'LANGUAGES'}
              </h2>

              {/* Language Selector (Toggles Sidebar View) with Unique SVG Icon */}
              <button
                onClick={() => setSidebarView(sidebarView === 'main' ? 'lang' : 'main')}
                className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
                title="Cambiar Idioma"
              >
                <svg className={`w-5 h-5 transition-transform duration-500 ${sidebarView === 'lang' ? 'rotate-90 text-neon-cyan' : 'group-hover:rotate-12 text-white/70'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {(LANGS.find(l => l.code === lang) || LANGS.find(l => l.code === 'en-us'))?.flag}
                </div>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
              {sidebarView === 'main' ? (
                <div className="animate-fade-in-up">
                  {/* Main Navigation Section */}
                  <div className="mb-4">
                    <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Navigation</p>
                     {NAV_LINKS.filter(l => !(isDesktopApp && l.href === '/download')).map((link) => {
                      const active = isActive(link.href);
                      const isPlay = link.href === '/play';
                      return (
                        <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)}
                          className={`flex justify-start items-center px-4 py-3 rounded-2xl transition-all font-header font-bold text-[15px] group mb-1 active:scale-95 border ${
                            active
                              ? (isPlay ? 'border-green-500 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-black animate-pulse' : 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue hover:text-white')
                              : (isPlay ? 'border-transparent text-white hover:border-green-500 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'border-transparent text-gray-300 hover:text-neon-cyan hover:bg-white/5 hover:border-white/10')
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isPlay
                                ? (active ? 'bg-black/20 text-black' : 'bg-black/40 text-gray-500 group-hover:bg-black/20 group-hover:text-black')
                                : (active ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'bg-black/40 text-gray-500 group-hover:text-neon-cyan group-hover:bg-neon-blue/10')
                            }`}>{link.icon}</span>
                            <span>{link.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Information & Support Section */}
                  <div className="mb-4">
                    <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Info & Support</p>
                    {INFO_LINKS.map((link) => (
                      <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)}
                        className={`flex justify-start items-center px-4 py-3 rounded-2xl transition-all font-header font-bold text-[14px] group mb-1 active:scale-95 ${isActive(link.href) ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-cyan shadow-[inset_0_0_15px_rgba(0,212,255,0.1)] hover:text-white' : 'border border-transparent text-white hover:text-neon-cyan hover:bg-neon-blue/5 hover:border-neon-blue/20'}`}
                      >
                         <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive(link.href) ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'bg-black/40 text-white/60 group-hover:text-neon-cyan group-hover:bg-neon-blue/10'}`}>{link.icon}</span>
                          <span className="truncate text-white group-hover:text-neon-cyan transition-colors">{link.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="h-px bg-white/10 my-4" />
                  <div className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Account</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded-xl font-header font-bold cursor-pointer hover:bg-neon-green/20 text-xs shadow-[0_4px_15px_rgba(0,255,136,0.1)]">
                      {I.login} Ingresar
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl font-header font-bold cursor-pointer hover:bg-neon-pink/20 text-xs shadow-[0_4px_15px_rgba(255,51,204,0.1)]">
                      {I.register} Registro
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 animate-fade-in-up pb-10">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        updatePreferences({ lang: l.code });
                        setSidebarView('main');
                        toast(`[SISTEMA]: Idioma cambiado a ${l.label}`);
                      }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-header font-bold transition-all cursor-pointer group ${
                        lang === l.code ? 'bg-neon-blue/20 text-neon-cyan border border-neon-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg ring-1 ring-white/10 rounded-full">
                        {l.flag}
                      </div>
                      <span className="flex-1 text-left">{l.label}</span>
                      {lang === l.code && (
                        <svg className="w-4 h-4 text-neon-cyan animate-bounce-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Navbar = () => {
  return (
    <React.Suspense fallback={<div className="h-20 bg-black/50 animate-pulse" />}>
      <NavbarContent />
    </React.Suspense>
  );
};

export default Navbar;
