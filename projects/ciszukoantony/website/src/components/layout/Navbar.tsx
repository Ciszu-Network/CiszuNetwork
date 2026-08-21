'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SmartImage, useZoomStatus, publishHeaderMode } from '@ciszu/ui';
import { NAV_MAIN, SOCIALS, I, ALL_PAGES, SEARCH_INDEX, type NavGroup, type NavItem } from '@/config/navigation';
import { useAppStore } from '@/store';
import AuthMenu, { GuestIcon } from '@/components/auth/AuthMenu';
import { getGuestName } from '@/lib/guest';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const SignOutIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunIcon = () => (
  <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round"/>
  </svg>
);

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
      <div className="px-5 py-3 rounded-xl bg-brand/20 border border-brand/30 backdrop-blur-xl text-sm text-white shadow-lg shadow-brand/10 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        {message}
        <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">{I.close}</button>
      </div>
    </div>
  );
}

const LANGS = [
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
  { code: 'KO', label: '한국어 (Korean)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg> }];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { isMenuOpen, setIsMenuOpen, theme, setTheme, language, setLanguage, sidebarView, setSidebarView, searchQuery, setSearchQuery, user } = useAppStore();
  const firstRender = useRef(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setGuestName(getGuestName());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const zoom = useZoomStatus();
  const isZoomWarning = !zoom.dismissed && zoom.status !== 'normal';

  const floating = scrolled && !searchOpen && !isMenuOpen && !isZoomWarning;

  const prevHeaderMode = useRef<'island' | 'full' | null>(null);
  useEffect(() => {
    const mode = floating ? 'island' : 'full';
    if (prevHeaderMode.current !== mode) {
      prevHeaderMode.current = mode;
      publishHeaderMode(mode);
    }
  }, [floating]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setIsMenuOpen(false); setSearchOpen(false); setInfoOpen(false); setAccOpen(false);
      return;
    }
    setIsMenuOpen(false); setSearchOpen(false); setInfoOpen(false); setAccOpen(false); setSidebarView('main');
    setIsNavigating(false);
  }, [pathname]);

  // Global click interceptor: show green loader when navigating between internal pages
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target?.href &&
        target.href.startsWith(window.location.origin) &&
        !target.href.includes('#') &&
        target.target !== '_blank'
      ) {
        const targetUrl = new URL(target.href);
        if (targetUrl.pathname !== pathname) {
          setIsNavigating(true);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (infoRef.current && !infoRef.current.contains(t)) setInfoOpen(false);
      if (accRef.current && !accRef.current.contains(t)) setAccOpen(false);
      if (searchRef.current && searchToggleRef.current &&
          !searchRef.current.contains(t) && !searchToggleRef.current.contains(t)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setToast('[SISTEMA]: Theme changer is in beta — some styles may not apply correctly yet.');
  };

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  const infoItems = (NAV_MAIN.find(n => 'items' in n && n.name === 'Info') as NavGroup)?.items || [];

  const isActive = (href: string) => pathname === href;
  const infoActive = infoItems.some(i => isActive(i.href));

  const q = searchQuery.trim().toLowerCase();
  const suggestions = q.length > 0
    ? SEARCH_INDEX.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.href.toLowerCase().includes(q) ||
        p.keywords.some(k => k.toLowerCase().includes(q))).slice(0, 6)
    : [];

  const pageIcon = (href: string) => ALL_PAGES.find(p => p.href === href)?.icon;

  // Store lang ('EN'|'ES') maps to the LANGS display code for header flag & active state
  const currentLangCode = language === 'ES' ? 'ES-LA' : 'EN-US';

  const handleLangSelect = (code: string) => {
    if (code === 'EN-US' || code === 'EN-UK') { setLanguage('EN'); return; }
    if (code === 'ES-LA' || code === 'ES-ES') { setLanguage('ES'); return; }
    setToast('Esta función no está desarrollada para la beta aún');
  };

  // Pill nav: reveal label only on hover/active (muzicmania pattern)
  const navLinkCls = (active: boolean) =>
    `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(61,106,223,0.4)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-white'
        : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(61,106,223,0.25)]'
    }`;

  const navLabelCls = (active: boolean) =>
    `max-w-0 overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:max-w-[110px] ${active ? 'max-w-[110px]' : ''}`;

  const toggleSearch = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!searchOpen) { setIsMenuOpen(false); setAccOpen(false); }
    setSearchOpen(v => !v);
  };

  const toggleAcceder = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!accOpen) { setSearchOpen(false); setIsMenuOpen(false); }
    setAccOpen(v => !v);
  };

  const accountLabel = user ? (user.display_name || user.username) : guestName;

  return (
    <>
      {/* Global navigation loader — green when navigating between pages */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-black/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 ${
          isNavigating
            ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
            : 'translate-y-10 opacity-0 pointer-events-none border-neon-blue/50 text-neon-blue'
        }`}
      >
        <svg
          className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <nav className={`fixed z-50 transition-all duration-500 ease-out ${
          floating
            ? 'top-3 inset-x-3 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]'
            : `top-0 left-0 w-full ${scrolled ? 'bg-black/92 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'} ${isZoomWarning ? 'mt-8' : 'mt-0'}`
        }`}>

        {/* Animated gradient separator under the header */}
        <div className={`${floating ? 'hidden' : ''} absolute bottom-0 left-0 w-full h-[2px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${floating ? 'h-14' : 'h-16'} gap-3`}>
            <Link href="/" className="flex items-center gap-2 group shrink-0 active:scale-95 transition-all duration-300">
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"
                alt="Ciszuko" width={28} height={25}
                className="drop-shadow-brand group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300"
              />
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png"
                alt="Ciszuko Antony" width={120} height={28}
                className="hidden sm:block group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300"
              />
              <SmartImage
                src="projects/ciszukoantony/content/assets/youtube_canal.png"
                alt="Ciszuko Antony — Canal de YouTube" width={34} height={34}
                className="hidden sm:block rounded-full ring-2 ring-brand/40 shadow-[0_0_15px_rgba(167,139,250,0.35)] shrink-0"
              />
            </Link>

            <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0 hidden md:block" />

            <div className="flex items-center gap-1 flex-1 overflow-visible min-w-0">
              {NAV_MAIN.map((item) => {
                if ('items' in item) {
                  const group = item as NavGroup;
                  const responsiveClass = infoActive ? 'flex' : 'hidden min-[440px]:flex';
                  return (
                    <div key={group.name} className={`relative ${responsiveClass}`} ref={infoRef}
                      onMouseEnter={() => setInfoOpen(true)}>
                      <button onClick={() => setInfoOpen(!infoOpen)} className={navLinkCls(infoActive)}>
                        <span className="opacity-80 shrink-0">{group.icon}</span>
                        <span className={navLabelCls(infoActive)}>{group.name}</span>
                        <span className={`opacity-70 transition-transform duration-200 ${infoOpen ? 'rotate-180' : ''}`}>{I.chevronDown}</span>
                      </button>
                      {infoOpen && (
                        <div className="absolute top-full left-0 pt-2 w-56 z-50 animate-fade-in-down origin-top drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                          <div className="bg-[#070712]/95 backdrop-blur-2xl border border-white/10 rounded-xl py-2 shadow-2xl">
                            {group.items.map((sub) => (
                              <Link key={sub.href} href={sub.href} onClick={() => setInfoOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 text-sm font-header font-bold transition-all cursor-pointer ${
                                  isActive(sub.href) ? 'text-neon-blue bg-neon-blue/5 hover:text-white' : 'text-white hover:text-neon-blue hover:bg-white/5'
                                }`}>
                                <span className="opacity-70 w-4 h-4 shrink-0">{sub.icon}</span>{sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                const link = item as NavItem;
                const active = isActive(link.href);
                const { name } = link;
                const hideCls =
                  { '/': 'hidden min-[300px]:flex', '/projects': 'hidden min-[540px]:flex', '/feedback': 'hidden min-[640px]:flex', '/descargas': 'hidden min-[740px]:flex' }[link.href] ?? 'hidden min-[850px]:flex';
                const responsiveClass = active ? 'flex' : hideCls;
                return (
                  <Link key={link.href} href={link.href} className={`${navLinkCls(active)} ${responsiveClass}`}>
                    <span className="opacity-80 shrink-0">{link.icon}</span>
                    <span className={navLabelCls(active)}>{name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0 min-w-fit">
              {/* Search toggle */}
              <button ref={searchToggleRef} onClick={toggleSearch}
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(61,106,223,0.25)] ${
                  searchOpen ? 'bg-neon-blue border-neon-blue text-white' : 'bg-white/5 border-white/20 text-white hover:border-neon-blue'
                }`}
                title="Search">
                {searchOpen ? I.close : I.search}
              </button>

              {/* Hamburger contextual toggle (always visible) */}
              <button onClick={() => { setSearchOpen(false); setAccOpen(false); setSidebarView('main'); setIsMenuOpen(!isMenuOpen); }}
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(61,106,223,0.25)] ${
                  isMenuOpen ? 'bg-neon-blue border-neon-blue text-white' : 'bg-white/5 border-white/20 text-white hover:border-neon-blue'
                }`}
                title="Menu">
                {isMenuOpen ? I.close : I.menu}
              </button>

              {/* Account button + dropdown (CISZU ID auth + preferencias) */}
              <div className="relative" ref={accRef}>
                <button onClick={toggleAcceder}
                  className={`flex items-center gap-2 pl-2.5 pr-3 h-10 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_15px_rgba(255,51,204,0.4)] ${
                    accOpen
                      ? 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink border-transparent text-white'
                      : 'bg-gradient-to-r from-neon-blue/20 via-[#6600ff]/20 to-neon-pink/20 border-white/20 text-white hover:border-neon-pink opacity-90 hover:opacity-100'
                  }`}
                  title={user ? `Account: ${accountLabel}` : `Guest: ${accountLabel}`}>
                  {user ? (
                    user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-neon-blue/60 shrink-0" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-[#6600ff] flex items-center justify-center text-white font-header font-black text-xs shrink-0">
                        {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )
                  ) : (
                    <span className="text-white/80 shrink-0"><GuestIcon className="w-5 h-5" /></span>
                  )}
                  <span className="hidden min-[900px]:block max-w-[120px] truncate text-xs font-header font-bold">
                    {user ? (user.display_name || user.username) : (guestName || 'Guest')}
                  </span>
                </button>
                {accOpen && (
                  <div className="absolute right-0 top-full pt-3 w-72 max-w-[calc(100vw-2rem)] z-50 origin-top">
                    <AuthMenu onClose={() => setAccOpen(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width search bar with suggestions grid */}
        {searchOpen && (
          <div ref={searchRef} className="border-t border-white/5 bg-[#070712]/95 backdrop-blur-2xl">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{I.search}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && suggestions[0]) { router.push(suggestions[0].href); closeSearch(); } }}
                  placeholder="Search pages in Ciszuko Antony (example: projects, team)..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 focus:border-neon-blue rounded-xl text-white placeholder:text-gray-600 outline-none text-sm transition-all font-header font-bold"
                />
              </div>

              {q.length > 0 && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 animate-fade-in-down space-y-3">
                  <p className="text-gray-500 font-header font-black uppercase text-xs tracking-widest italic">No results found for &quot;{searchQuery.trim()}&quot;</p>
                  <button onClick={() => setSearchQuery('')}
                    className="px-6 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-full font-header font-bold text-[10px] uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all active:scale-95">
                    Reset Search
                  </button>
                </div>
              )}

              {q.length > 0 && suggestions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3 animate-fade-in-down">
                  {suggestions.map((p) => (
                    <Link key={p.href} href={p.href} onClick={closeSearch}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-neon-blue/50 hover:text-neon-blue text-white text-xs font-header font-bold transition-all cursor-pointer">
                      <span className="opacity-70 shrink-0">{pageIcon(p.href)}</span>
                      <span className="truncate">{p.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Slide-right contextual menu (sidebar) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute top-[64px] right-0 w-[320px] max-w-[85vw] h-[calc(100vh-64px)] bg-[#05050a]/95 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-in-right">
            {/* Animated left divider to match the header */}
            <div className="absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-neon-blue/60 to-transparent shadow-[0_0_15px_rgba(61,106,223,0.5)] z-10" />

            {/* Header: Theme toggle | MENU | Language | Close */}
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/5 shrink-0">
              <button onClick={toggleTheme}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                  theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </button>

              <h2 className="text-neon-blue text-base font-header font-black tracking-widest drop-shadow-[0_0_8px_rgba(61,106,223,0.8)]">
                {sidebarView === 'main' ? 'MENU' : 'LANGUAGES'}
              </h2>

              <button
                onClick={() => setSidebarView(sidebarView === 'main' ? 'lang' : 'main')}
                className="group flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg cursor-pointer"
                title="Language"
              >
                <svg className={`w-5 h-5 transition-transform duration-500 ${sidebarView === 'lang' ? 'rotate-90 text-neon-blue' : 'group-hover:rotate-12 text-white/70'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                  {(LANGS.find(l => l.code === currentLangCode) || LANGS[0]).flag}
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
              {sidebarView === 'main' ? (
                <>
              <div className="mb-4">
                <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Navigation</p>
                {ALL_PAGES.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                    className={`flex justify-start items-center px-4 py-3 rounded-2xl transition-all font-header font-bold text-[15px] group mb-1 active:scale-95 border ${
                      isActive(link.href)
                        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(61,106,223,0.3)] text-neon-blue hover:text-white'
                        : 'border-transparent text-gray-300 hover:text-neon-blue hover:bg-white/5 hover:border-white/10'
                    }`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isActive(link.href) ? 'bg-neon-cyan/20 text-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]' : 'bg-black/40 text-gray-500 group-hover:text-neon-blue group-hover:bg-neon-blue/10'
                      }`}>{link.icon}</span>
                      <span>{link.name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/10 my-4" />
              <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Account</p>
              {user ? (
                <button onClick={async () => { const { supabase } = await import('@/config/supabase'); await supabase.auth.signOut(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl font-header font-bold hover:bg-neon-pink/20 hover:text-white text-xs shadow-[0_4px_15px_rgba(255,51,204,0.1)] transition-all">
                  <SignOutIcon /> Cerrar sesión ({user.display_name || user.username})
                </button>
              ) : (
                <Link href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-xl font-header font-bold hover:bg-neon-blue/20 hover:text-white text-xs shadow-[0_4px_15px_rgba(61,106,223,0.1)] transition-all">
                  <UserIcon /> Get Started
                </Link>
              )}

              <div className="h-px bg-white/10 my-4" />
              <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Social</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SOCIALS.slice(0, 8).map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/50 hover:shadow-[0_0_12px_rgba(61,106,223,0.4)] hover:scale-110 transition-all"
                    title={s.name}>
                    {s.icon}
                  </a>
                ))}
              </div>
              </>
              ) : (
                <div className="grid grid-cols-1 gap-1 animate-fade-in-up pb-10">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangSelect(l.code)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-header font-bold transition-all cursor-pointer group ${
                        currentLangCode === l.code ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                        {l.flag}
                      </span>
                      <span className="flex-1 text-left">{l.label}</span>
                      {currentLangCode === l.code && (
                        <svg className="w-4 h-4 text-neon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5" />
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
