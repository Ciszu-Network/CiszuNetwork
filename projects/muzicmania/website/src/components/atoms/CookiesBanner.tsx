'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { isTauri } from '@/lib/isTauri';
import { getCookieConsent, setCookieConsent, useToast } from '@ciszu/ui';

export function CookiesBanner() {
  const [show, setShow] = useState(false);
  const { hasAcceptedCookies, setHasAcceptedCookies } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isTauri()) {
      setHasAcceptedCookies(true);
      return;
    }
    const consent = getCookieConsent();
    // Solo se muestra si NO hay decisión aún ('false' = rechazado → oculto).
    if (consent === null && !hasAcceptedCookies) {
      setShow(true);
    } else if (consent === 'accepted' && !hasAcceptedCookies) {
      setHasAcceptedCookies(true);
    }
  }, [hasAcceptedCookies, setHasAcceptedCookies]);

  useEffect(() => {
    // Escuchar si fue aceptado desde otro lado (ej. Register form)
    if (hasAcceptedCookies) {
      setShow(false);
    }
  }, [hasAcceptedCookies]);

  const handleAccept = () => {
    setCookieConsent('accepted');
    setHasAcceptedCookies(true);
    setShow(false);
    toast('Cookies aceptadas. Gracias por apoyar a MuzicMania.', 'info');
  };

  const handleReject = () => {
    setCookieConsent('rejected');
    setHasAcceptedCookies(false);
    setShow(false);
    toast('Cookies rechazadas: los servicios opcionales están desactivados.', 'info');
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
          <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-xl border-t border-neon-cyan/30 md:border md:rounded-[2rem] p-6 shadow-[0_0_40px_rgba(0,212,255,0.15)] flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 flex-1 text-center md:text-left">
              <h3 className="text-white font-header font-black uppercase italic tracking-widest text-lg flex items-center justify-center md:justify-start gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-6.88 17.26c1.89 1.74 4.3 2.74 6.88 2.74 5.52 0 10-4.48 10-10 0-2.58-1-5-2.74-6.88C17.52 3 15 2 12 2zm1 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
                Uso de Cookies y Privacidad
              </h3>
              <p className="text-gray-400 text-xs md:text-sm font-bold leading-relaxed">
                Utilizamos cookies propias y de terceros (incluyendo servicios de Google y Cloudflare) para mantener tu sesión activa, proteger el juego de bots, y mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
                <Link href="/terms" className="text-neon-cyan hover:text-neon-blue underline transition-colors">
                  Política de Privacidad y Términos de Servicio
                </Link>.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={handleReject}
                className="w-full md:w-auto px-6 py-3 bg-white/5 text-gray-300 font-black uppercase text-sm rounded-full hover:bg-white/10 hover:text-white active:scale-95 transition-all border border-white/20"
              >
                RECHAZAR
              </button>
              <button
                onClick={handleAccept}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/10"
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
