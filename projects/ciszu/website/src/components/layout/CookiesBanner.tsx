'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore } from '@/store';

export function CookiesBanner() {
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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-xl border-t border-neon-cyan/30 md:border md:rounded-[2rem] p-6 shadow-[0_0_40px_rgba(104,207,255,0.15)] flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 flex-1 text-center md:text-left">
              <h3 className="text-white font-header font-black uppercase italic tracking-widest text-lg flex items-center justify-center md:justify-start gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-6.88 17.26c1.89 1.74 4.3 2.74 6.88 2.74 5.52 0 10-4.48 10-10 0-2.58-1-5-2.74-6.88C17.52 3 15 2 12 2zm1 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
                Uso de Cookies y Privacidad
              </h3>
              <p className="text-gray-400 text-xs md:text-sm font-bold leading-relaxed">
                Utilizamos cookies propias y de terceros (incluyendo servicios de Google y Cloudflare) para mantener tu sesión activa, proteger la web de bots y mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
                <Link href="/policies" className="text-neon-cyan hover:text-neon-blue underline transition-colors">
                  Política de Privacidad y Términos de Servicio
                </Link>.
              </p>
            </div>

            <div className="shrink-0 flex gap-4 w-full md:w-auto">
              <button
                onClick={handleAccept}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-black uppercase text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/10 dark:bg-gradient-to-r dark:from-neon-blue dark:to-neon-purple"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}