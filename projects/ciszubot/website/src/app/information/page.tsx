'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, useZoomStatus, publishHeaderMode, useToast, LANGUAGE_OPTIONS, isLangAvailable, getLangLabel, LANG_BLOCKED_MESSAGE } from '@ciszu/ui';
import { INVITE_URL, LOGO_ISOTIPO, LOGO_LOGOTIPO, type Dict, type Lang } from '@/lib/i18n';
import { useAppStore } from '@/store';
import QuickDocks from '@/components/molecules/QuickDocks';

const INFO_ITEMS: { name: string; href: string; icon: string; key: string; desc: string }[] = [
  { name: 'About', href: '/about', icon: 'info', key: 'about', desc: 'Acerca de CiszuBot' },
  { name: 'Team', href: '/team', icon: 'users', key: 'team', desc: 'Nuestro equipo' },
  { name: 'FAQ', href: '/faq', icon: 'help', key: 'faq', desc: 'Preguntas frecuentes' },
  { name: 'Documentation', href: '/documentation', icon: 'file-text', key: 'documentation', desc: 'Documentación' },
  { name: 'Help', href: '/help', icon: 'help', key: 'help', desc: 'Centro de ayuda' },
  { name: 'Contact', href: '/contact', icon: 'mail', key: 'contact', desc: 'Contáctanos' },
  { name: 'Support', href: '/support', icon: 'support', key: 'support', desc: 'Soporte técnico' },
];

export default function InformationPage({ lang, dict }: { lang: Lang; dict: Dict }) {
  const pathname = usePathname();
  const { isMenuOpen, setIsMenuOpen, user, setUser } = useAppStore();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-bg/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 ${
        isNavigating ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400' : 'translate-y-10 opacity-0 pointer-events-none border-neon-blue/50 text-neon-blue'
      }`}>
        <svg className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <nav className={`fixed z-50 transition-all duration-500 ease-out ${
        floating ? 'top-3 inset-x-3 rounded-2xl bg-bg/60 backdrop-blur-2xl border border-border/80 shadow-[0_10px_40px_rgba(0,0,0,0.55)]' : `top-0 left-0 w-full bg-bg/85 backdrop-blur-2xl border-b border-border`
      }`}>
        <div className={`${floating ? 'hidden' : ''} absolute bottom-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x transition-colors duration-500 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]`} />
        <div className="max-w-screen-xl mx-auto px-4">
          <div className={`flex items-center ${floating ? 'h-14' : 'h-[64px]'} gap-3`}>
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
              <Icon name="home" size={28} className="text-neon-blue group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300" />
              <span className="hidden lg:block text-lg font-header font-black text-neon-blue group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300">CiszuBot</span>
            </Link>
            <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />
            <div className="flex items-center gap-1 flex-1 overflow-visible">
              {INFO_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
                    active ? 'border-neon-blue bg-neon-blue/15 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-ink' : 'border-transparent text-muted hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                  }`}>
                    <span className="shrink-0"><Icon name={item.icon} size={16} /></span>
                    <span className="max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[100px] whitespace-nowrap">{dict.nav[item.key as keyof typeof dict.nav] || item.name}</span>
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
            <h1 className="text-4xl md:text-6xl font-header font-black text-neon-blue uppercase tracking-tighter mb-4">
              Information
            </h1>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Explora las diferentes secciones de CiszuBot.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INFO_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={`p-6 rounded-2xl border transition-all duration-300 group ${
                  active ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'border-border bg-card hover:border-neon-blue/50 hover:bg-neon-blue/5'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'text-neon-blue' : 'text-muted group-hover:text-neon-blue'}`}><Icon name={item.icon} size={18} /></div>
                    <h3 className="font-header font-bold text-ink">{dict.nav[item.key as keyof typeof dict.nav] || item.name}</h3>
                  </div>
                  <p className="text-xs text-muted">{item.desc}</p>
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
