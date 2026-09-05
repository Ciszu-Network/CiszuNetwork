'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { type Dict, type Lang, isEsLang } from '@/lib/i18n';

interface CookiesBannerProps {
  lang: Lang;
  dict: Dict;
}

export function CookiesBanner({ lang, dict }: CookiesBannerProps) {
  const [show, setShow] = useState(false);
  const { hasAcceptedCookies, setHasAcceptedCookies } = useAppStore();

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted && !hasAcceptedCookies) {
      setShow(true);
    } else if (accepted && !hasAcceptedCookies) {
      setHasAcceptedCookies(true);
    }
  }, [hasAcceptedCookies, setHasAcceptedCookies]);

  useEffect(() => {
    if (hasAcceptedCookies) {
      setShow(false);
    }
  }, [hasAcceptedCookies]);

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setHasAcceptedCookies(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-[#05050a]/95 backdrop-blur-xl border-t border-neon-cyan/30 md:border md:rounded-[2rem] p-6 shadow-[0_0_40px_rgba(8,145,178,0.15)] flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h3 className="text-white font-header font-black uppercase italic tracking-widest text-lg flex items-center justify-center md:justify-start gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-6.88 17.26c1.89 1.74 4.3 2.74 6.88 2.74 5.52 0 10-4.48 10-10 0-2.58-1-5-2.74-6.88C17.52 3 15 2 12 2zm1 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            {dict.cookiesBanner.title}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm font-bold leading-relaxed">
            {dict.cookiesBanner.text}
            <Link href="/privacidad" className="text-neon-cyan hover:text-neon-blue underline transition-colors">
              {dict.cookiesBanner.privacyLink}
            </Link>{' '}
            {isEsLang(lang) ? 'y' : 'and'}{' '}
            <Link href="/terminos" className="text-neon-cyan hover:text-neon-blue underline transition-colors">
              {dict.cookiesBanner.termsLink}
            </Link>.
          </p>
        </div>

        <div className="shrink-0 flex gap-4 w-full md:w-auto">
          <button
            onClick={handleAccept}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-black uppercase text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/10"
          >
            {dict.cookiesBanner.accept}
          </button>
        </div>
      </div>
    </div>
  );
}