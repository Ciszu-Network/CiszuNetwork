'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { assetResolver } from '@ciszunetwork/cdn';
import { useZoomStatus, useToast } from '@ciszu/ui';
import { CISZU_NETWORK } from '@/config/site';
import { useAppStore } from '@/store';
import QuickDocks from '@/components/molecules/QuickDocks';

const INFO_ITEMS = [
  { name: 'About', href: '/about', icon: 'info', desc: 'Conoce Ciszu Network' },
  { name: 'Team', href: '/team', icon: 'users', desc: 'Nuestro equipo' },
  { name: 'FAQ', href: '/faq', icon: 'help', desc: 'Preguntas frecuentes' },
  { name: 'Documentation', href: '/documentation', icon: 'file-text', desc: 'Docs técnicas' },
  { name: 'Help', href: '/help', icon: 'help', desc: 'Centro de ayuda' },
  { name: 'Contact', href: '/contact', icon: 'mail', desc: 'Escríbenos' },
  { name: 'Support', href: '/support', icon: 'support', desc: 'Soporte' },
];

export default function InformationPage() {
  const pathname = usePathname();
  const { isMenuOpen, setIsMenuOpen } = useAppStore();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firstRender = useRef(true);

  const zoom = useZoomStatus();
  const isZoomWarning = !zoom.dismissed && zoom.status !== 'normal';

  const floating = scrolled && !isMenuOpen && !isZoomWarning;

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
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-black/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 ${
        isNavigating ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400' : 'translate-y-10 opacity-0 pointer-events-none border-brand-light/50 text-brand-light'
      }`}>
        <svg className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
              Information
            </h1>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Explora las diferentes secciones de Ciszu Network.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INFO_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={`p-6 rounded-2xl border transition-all duration-300 group ${
                  active ? 'border-brand-light bg-brand-light/10 shadow-[0_0_15px_rgba(58,107,240,0.2)]' : 'border-white/10 bg-white/5 hover:border-brand-light/50 hover:bg-white/10'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'text-brand-light' : 'text-gray-400 group-hover:text-brand-light'}`}>{item.icon}</div>
                    <h3 className="font-header font-bold text-white">{item.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{item.desc}</p>
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
