'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SmartImage, useZoomStatus, publishHeaderMode, useToast, LANGUAGE_OPTIONS, isLangAvailable, LANG_BLOCKED_MESSAGE } from '@ciszu/ui';
import { NAV_MAIN, SOCIALS, I, ALL_PAGES, SEARCH_INDEX, type NavGroup, type NavItem } from '@/config/navigation';
import { useAppStore } from '@/store';
import { getGuestName } from '@/lib/guest';
import QuickDocks from '@/components/molecules/QuickDocks';

const infoItems = (NAV_MAIN.find(n => 'items' in n && n.name === 'Info') as NavGroup)?.items || [];

const navLinkCls = (active: boolean) =>
  `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
    active
      ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(61,106,223,0.4)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-white'
      : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(61,106,223,0.25)]'
  }`;

const navLabelCls = (active: boolean) =>
  `max-w-0 overflow-hidden transition-all duration-300 whitespace-nowrap group-hover:max-w-[110px] ${active ? 'max-w-[110px]' : ''}`;

export default function InformationPage({ lang, dict }: { lang: string; dict: Record<string, any> }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMenuOpen, setIsMenuOpen, theme, setTheme, language, setLanguage, searchQuery, setSearchQuery, sidebarView, setSidebarView } = useAppStore();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [guestName, setGuestName] = useState('');
  const firstRender = useRef(true);

  const zoom = useZoomStatus();
  const isZoomWarning = !zoom.dismissed && zoom.status !== 'normal';

  const floating = scrolled && !isMenuOpen && !isZoomWarning;

  const prevHeaderMode = useRef<'island' | 'full' | null>(null);
  useEffect(() => {
    const mode = floating ? 'island' : 'full';
    if (prevHeaderMode.current !== mode) {
      prevHeaderMode.current = mode;
      publishHeaderMode(mode);
    }
  }, [floating]);

  useEffect(() => {
    setMounted(true);
    setGuestName(getGuestName());
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsNavigating(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-black/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 ${
        isNavigating ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400' : 'translate-y-10 opacity-0 pointer-events-none border-neon-blue/50 text-neon-blue'
      }`}>
        <svg className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <nav className={`fixed z-50 transition-all duration-500 ease-out ${
        floating ? 'top-3 inset-x-3 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]' : `top-0 left-0 w-full ${scrolled ? 'bg-black/92 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'}`
      }`}>
        <div className={`${floating ? 'hidden' : ''} absolute bottom-0 left-0 w-full h-[2px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${floating ? 'h-14' : 'h-16'} gap-3`}>
            <Link href="/" className="flex items-center gap-2 group shrink-0 active:scale-95 transition-all duration-300">
              <SmartImage src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png" alt="Ciszuko" width={28} height={25} className="drop-shadow-brand group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300" />
              <SmartImage src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png" alt="Ciszuko Antony" width={120} height={28} className="hidden sm:block group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300" />
            </Link>
            <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0 hidden md:block" />
            <div className="flex items-center gap-1 flex-1 overflow-visible min-w-0">
              {infoItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`${navLinkCls(active)} ${active ? 'flex' : 'hidden min-[300px]:flex'}`}>
                    <span className="opacity-80 shrink-0">{item.icon}</span>
                    <span className={navLabelCls(active)}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent uppercase tracking-tighter mb-4">
              Information
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Explora las diferentes secciones de Ciszuko Antony.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {infoItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={`p-6 rounded-2xl border transition-all duration-300 group ${
                  active ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(61,106,223,0.2)]' : 'border-white/10 bg-white/5 hover:border-neon-blue/50 hover:bg-white/10'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'text-neon-blue' : 'text-gray-400 group-hover:text-neon-blue'}`}>{item.icon}</div>
                    <h3 className="font-header font-bold text-white">{item.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <QuickDocks />
    </>
  );
}
