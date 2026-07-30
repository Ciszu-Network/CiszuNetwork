'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAppStore } from '@/store/useAppStore';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { motion, AnimatePresence } from 'framer-motion';
import { isTauri } from '@/lib/isTauri';

type GuardState = 'loading' | 'verifying' | 'error';

export function CloudflareGuard({ children }: { children: React.ReactNode }) {
  const { isCloudflareVerified, setIsCloudflareVerified } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [state, setState] = useState<GuardState>('loading');
  const [statusText, setStatusText] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  useEffect(() => {
    setIsDesktop(isTauri());
  }, []);

  useEffect(() => {
    setMounted(true);
    const verified = sessionStorage.getItem('cf_verified');
    if (verified === 'true') {
      setIsCloudflareVerified(true);
    } else {
      setState('loading');
    }
  }, [setIsCloudflareVerified]);

  const handleSuccess = useCallback(async (token: string) => {
    setState('verifying');
    setStatusText('Validando token de seguridad…');
    try {
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusText('Verificación exitosa');
        sessionStorage.setItem('cf_verified', 'true');
        setTimeout(() => {
          setIsCloudflareVerified(true);
        }, 800);
      } else {
        setState('error');
        setStatusText(data.error || 'Error de verificación en el servidor');
      }
    } catch (err) {
      console.error('Turnstile server verification error:', err);
      setState('error');
      setStatusText('No se pudo conectar con el servidor de verificación');
    }
  }, [setIsCloudflareVerified]);

  const handleError = useCallback(() => {
    setState('error');
    setStatusText('Error al cargar el desafío de seguridad');
  }, []);

  const handleExpired = useCallback(() => {
    setState('loading');
    setStatusText('El token expiró, resuelve el desafío nuevamente');
  }, []);

  const handleRetry = useCallback(() => {
    setState('loading');
    setStatusText('');
    setTurnstileKey(k => k + 1);
  }, []);

  // En Tauri (desktop), saltar verificación Cloudflare
  if (isDesktop) {
    return <>{children}</>;
  }

  if (!mounted) return null;

  if (isCloudflareVerified) {
    return <>{children}</>;
  }

  const iconError = (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="w-24 h-24 relative drop-shadow-[0_0_30px_rgba(0,212,255,0.8)]">
          <img
            src={resolveAssetPath('apps/muzicmania/content/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
            alt="MuzicMania"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-neon-cyan font-black tracking-widest uppercase text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
            {state === 'error' ? 'Error de Verificación' : 'Verificando Conexión Segura'}
          </h2>
          <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">
            MuzicMania Security • Cloudflare
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-h-[100px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === 'error' ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 text-red-400">{iconError}</div>
                <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-[240px] text-center">
                  {statusText}
                </p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-neon-cyan text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]"
                >
                  REINTENTAR
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="turnstile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Turnstile
                  key={turnstileKey}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAADm0pqu349Um-eH8'}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onExpire={handleExpired}
                  options={{
                    theme: 'dark',
                    language: 'es',
                  }}
                />
                {state === 'verifying' && (
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{statusText}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
