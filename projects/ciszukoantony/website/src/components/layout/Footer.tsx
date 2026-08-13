'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '@ciszu/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SOCIALS, I, FOOTER_SECTIONS } from '@/config/navigation';

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

export default function Footer() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState('EN');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark') as 'dark' | 'light');
    setToast('[SISTEMA]: Theme changer is in beta — some styles may not apply correctly yet.');
  };

  const toggleLang = () => {
    setLang(l => (l === 'EN' ? 'ES' : 'EN'));
    setToast('[SISTEMA]: Language changer is in beta — translations are incomplete.');
  };

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const isActive = (href: string) => pathname === href.split('#')[0];

  const pillCls = (active: boolean) =>
    `flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(61,106,223,0.3)] text-neon-blue hover:text-white'
        : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(61,106,223,0.2)]'
    }`;

  return (
    <footer className="relative bg-black border-t-2 border-white/10 pt-16 pb-8 px-4 overflow-hidden">
      {/* Animated gradient separator at top of footer */}
      <div className="absolute top-0 left-0 w-full h-[3px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_15px_rgba(61,106,223,0.4)]" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 mb-10 rounded-[2rem] bg-[#050505] border border-white/5 p-6 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand + socials with glow */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:w-[38%] gap-7 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-3 group hover:scale-105 active:scale-95 transition-all duration-300">
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"
                alt="Ciszuko" width={28} height={25}
                className="drop-shadow-brand"
              />
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png"
                alt="Ciszuko Antony" width={140} height={32}
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </Link>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 hover:text-neon-blue hover:border-neon-blue/60 hover:shadow-[0_0_15px_rgba(61,106,223,0.5)] hover:bg-gradient-to-tr hover:from-neon-blue/30 hover:to-transparent"
                  title={s.name}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Nav columns with muzicmania-style pills */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.label}>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span className="w-4 h-4 shrink-0">{section.icon}</span>
                  {section.label}
                </h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {'external' in link && link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={pillCls(isActive(link.href))}>
                          <span className="opacity-70 shrink-0">{link.icon}</span>
                          <span className="tracking-wide whitespace-nowrap">{link.name}</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={pillCls(isActive(link.href))}>
                          <span className="opacity-70 shrink-0">{link.icon}</span>
                          <span className="tracking-wide whitespace-nowrap">{link.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
          {/* Theme + Language controls */}
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </button>

            <button onClick={toggleLang}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
              title="Language">
              {I.globe}
              <span className="text-gray-400 group-hover:text-white uppercase tracking-widest text-xs font-bold">{lang}</span>
            </button>
          </div>

          {/* Copyright */}
          <p className="text-gray-600 text-xs text-center md:text-right leading-relaxed">
            &copy; {new Date().getFullYear()} Ciszuko Network. All rights reserved.
            <br />
            Designed & built by{' '}
            <Link href="/" className="text-neon-blue hover:text-neon-cyan transition-colors">Ciszuko Antony</Link>.
            <br />
            Ciszuko Network&reg; is a registered trademark.
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
          <div className="px-5 py-3 rounded-xl bg-brand/20 border border-brand/30 backdrop-blur-xl text-sm text-white shadow-lg shadow-brand/10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            {toast}
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-2">{I.close}</button>
          </div>
        </div>
      )}
    </footer>
  );
}
