'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '@ciszu/ui';
import { assetResolver } from '@ciszunetwork/cdn';
import Link from 'next/link';
import { ALL_PAGES, SOCIALS, I, FOOTER_SECTIONS } from '@/config/navigation';

export default function Footer() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState('EN');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
    setToast('⚙ Theme changer is in beta — some styles may not apply correctly yet.');
  };

  const toggleLang = () => {
    setLang(l => l === 'EN' ? 'ES' : 'EN');
    setToast('⚙ Language changer is in beta — translations are incomplete.');
  };

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.label}>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                <span className="w-4 h-4">{section.icon}</span>
                {section.label}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {'external' in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors"
                      >
                        <span className="w-4 h-4 shrink-0">{link.icon}</span>
                        <span>{link.name}</span>
                      </a>
                    ) : (
                      <Link href={link.href}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors"
                      >
                        <span className="w-4 h-4 shrink-0">{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SmartImage
              src={assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png")}
              alt="Ciszuko" width={28} height={25}
              className="drop-shadow-brand"
            />
            <SmartImage
              src={assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png")}
              alt="Ciszuko Antony" width={140} height={32}
              className="opacity-80"
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {I.globe}
              {lang}
            </button>
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {theme === 'dark' ? I.sun : I.moon}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <p className="text-gray-600 text-xs text-center sm:text-right leading-relaxed">
            &copy; {new Date().getFullYear()} Ciszuko Network. All rights reserved.
            <br />
            Designed & built by{' '}
            <Link href="/" className="text-brand hover:text-brand-200 transition-colors">Ciszuko Antony</Link>.
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
