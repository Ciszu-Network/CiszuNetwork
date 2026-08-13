/**
 * InstallPdwaInline — botón "Instalar PDWA" grande para la página /descargas.
 *
 * Reutiliza `detectPdwaBrowser` de @ciszu/ui (el mismo que usa el InstallPdwaButton
 * flotante del layout) y el listener `beforeinstallprompt`: si el navegador ofrece
 * instalación nativa lanza el prompt; si no, hace scroll a la sección de pasos de
 * la página (Equivalente al panel del botón flotante).
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { detectPdwaBrowser } from '@ciszu/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPdwaInline() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const browser = useMemo(() => (typeof window === 'undefined' ? null : detectPdwaBrowser(navigator.userAgent)), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (deferred) {
      const promptEvent = deferred;
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferred(null);
      return;
    }
    document.getElementById('instalacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [deferred]);

  if (installed) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center">
        <p className="text-emerald-400 font-header font-bold">
          <span className="mr-2">✓</span>Ya tienes Ciszuko Antony instalada como app en este dispositivo.
        </p>
      </div>
    );
  }

  const hasNative = browser !== null && (browser.nativa || deferred !== null);
  const label = hasNative ? 'Instalar PDWA' : browser?.id === 'opera-gx' ? 'Alternativa PDWA (GX)' : 'Instalar PDWA';

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-r from-neon-blue/10 via-[#6600ff]/10 to-neon-pink/10 border border-neon-blue/30 text-center">
      <p className="text-gray-300 text-sm leading-relaxed mb-2">
        {browser?.nativa || deferred
          ? `Tu navegador (${browser?.label ?? 'compatible'}) permite instalarla directamente.`
          : 'Pulsa el botón y sigue los pasos de la sección de arriba para instalarla según tu navegador.'}
      </p>
      <button
        type="button"
        onClick={() => void handleClick()}
        className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-header font-bold text-base shadow-[0_0_25px_rgba(61,106,223,0.4)] hover:shadow-[0_0_40px_rgba(61,106,223,0.6)] transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {label}
      </button>
    </div>
  );
}