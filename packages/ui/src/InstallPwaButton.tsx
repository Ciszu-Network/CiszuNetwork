/**
 * InstallPwaButton — botón "Instalar app" para las 4 webs.
 *
 * - Si el navegador dispara `beforeinstallprompt` (Chrome/Edge escritorio
 *   y Android), el botón lanza el prompt nativo de instalación.
 * - Si no se dispara (Opera GX, Firefox, Safari escritorio, etc.), el botón
 *   abre un panel con instrucciones por navegador (icono de la barra de
 *   direcciones, "Añadir a pantalla de inicio", etc.).
 * - Oculto si la app ya está instalada (display-mode: standalone o
 *   evento `appinstalled`).
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isOpera() {
  return /Opera|OPR\//i.test(navigator.userAgent);
}

export default function InstallPwaButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);

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
    setOpen((v) => !v);
  }, [deferred]);

  if (installed) return null;

  const steps = isOpera()
    ? [
        'Opera GX no permite instalar webs como apps.',
        'Abre la web en Edge o Chrome y pulsa el icono de instalación de la barra de direcciones.',
      ]
    : isIOS()
      ? [
          'Abre el menú Compartir (icono de la flecha arriba).',
          'Pulsa "Añadir a pantalla de inicio" y confirma.',
        ]
      : [
          'Busca el icono de instalación en la barra de direcciones (o menú ⋮ → "Instalar…").',
        ];

  if (!deferred) {
    return (
      <>
        {open && (
          <div
            className="fixed z-50 right-4 bottom-20 w-72 rounded-xl border border-cyan-400/30 bg-zinc-900/95 p-4 text-sm text-zinc-200 shadow-[0_0_24px_rgba(0,202,255,0.25)] backdrop-blur"
            role="dialog"
            aria-label="Cómo instalar la app"
          >
            <p className="mb-2 font-semibold text-cyan-300">
              Instalar la app
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <button
              type="button"
              className="mt-3 rounded-full border border-zinc-500/60 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-cyan-400/50 bg-zinc-900/90 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-[0_0_18px_rgba(0,202,255,0.35)] backdrop-blur transition hover:bg-cyan-400 hover:text-zinc-900`}
        >
          <InstallIcon aria-hidden={true} />
          Instalar app
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-deferred="true"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-[0_0_22px_rgba(0,202,255,0.5)] backdrop-blur transition hover:bg-cyan-400 hover:text-zinc-900"
    >
      <InstallIcon aria-hidden={true} />
      Instalar app
    </button>
  );
}

interface InstallIconProps {
  'aria-hidden'?: boolean;
}

function InstallIcon({ 'aria-hidden': ariaHidden = true }: InstallIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden ? true : undefined}
      className="h-4 w-4"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  );
}