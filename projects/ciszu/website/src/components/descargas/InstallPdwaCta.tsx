'use client';

import { useCallback, useEffect, useState } from 'react';
import { detectPdwaBrowser } from '@ciszu/ui';
import { Download, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPdwaCtaProps {
  site: string;
}

export function InstallPdwaCta({ site }: InstallPdwaCtaProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [detail, setDetail] = useState(false);

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

  const handleInstall = useCallback(async () => {
    if (deferred) {
      const promptEvent = deferred;
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferred(null);
      return;
    }
    setDetail((v) => !v);
  }, [deferred]);

  const browser = typeof window === 'undefined' ? null : detectPdwaBrowser(navigator.userAgent);

  if (installed) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand/10 border border-brand/40 text-brand-light font-black text-sm uppercase tracking-widest">
        PDWA instalada en este dispositivo
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(35,63,146,0.3)]"
      >
        <Download className="w-4 h-4" /> Instalar PDWA
      </button>

      {detail && (
        <div className="w-full max-w-md p-5 rounded-2xl bg-black/40 border border-white/10 text-left text-sm">
          <p className="text-brand-light font-header font-bold mb-2">
            {browser?.nativa ? `Instalación nativa (${browser.label})` : `Tu navegador (${browser?.label ?? 'desconocido'}) no ofrece instalación nativa`}
          </p>
          {browser?.nativa ? (
            <ul className="list-disc pl-5 text-gray-400 space-y-1.5 text-sm">
              <li>Pulsa de nuevo el botón y confirma el diálogo del navegador.</li>
              <li>La PDWA queda en Inicio / Escritorio con tu logo.</li>
            </ul>
          ) : browser?.id === 'opera-gx' || browser?.id === 'opera' ? (
            <ul className="list-disc pl-5 text-gray-400 space-y-1.5 text-sm">
              <li>Menú Opera → "Guardar y compartir" → "Crear acceso directo".</li>
              <li>
                En Propiedades añade al final: <code className="text-brand-light">--app=&quot;{typeof window !== 'undefined' ? window.location.origin : ''}&quot;</code>
              </li>
              <li>Se abre como ventana de app independiente, igual que una PDWA.</li>
            </ul>
          ) : browser?.id === 'safari' ? (
            <ul className="list-disc pl-5 text-gray-400 space-y-1.5 text-sm">
              <li>Menú Archivo → "Añadir al Dock" (macOS).</li>
              <li>O Compartir → "Añadir a pantalla de inicio" en iPhone/iPad.</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 text-gray-400 space-y-1.5 text-sm">
              <li>
                La vía más fiable: abre {site} en <strong className="text-white">Microsoft Edge o Chrome</strong> e instálala desde el icono de la barra de direcciones.
              </li>
              <li>Se crea una app de escritorio con la misma experiencia que la PDWA.</li>
            </ul>
          )}
          <a
            href="#pasos"
            className="inline-flex items-center gap-1.5 mt-3 text-brand-light text-xs font-bold hover:text-white transition-all"
          >
            Ver pasos detallados arriba <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}