'use client';

import { useState, useCallback } from 'react';
import { isTauri } from '@/lib/isTauri';
import { DesktopSettings } from './DesktopSettings';
import { resolveAssetPath } from '@ciszunetwork/cdn';

export function DesktopTitlebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_window');
      } catch { /* not in tauri */ }
    }
  }, []);

  const handleMaximize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
      setIsMaximized(v => !v);
    } catch { /* not in tauri */ }
  }, []);

  const handleClose = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('close_window');
    } catch {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch {
        window.close();
      }
    }
  }, []);

  if (typeof window === 'undefined' || !isTauri()) return null;

  return (
    <>
      <div
        data-tauri-drag-region
        className="h-10 bg-[#05050a] border-b border-white/5 flex items-center justify-between select-none shrink-0"
      >
        <div data-tauri-drag-region className="flex items-center gap-3 px-4">
          <img
            src={resolveAssetPath('apps/muzicmania/content/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
            alt="M"
            className="w-5 h-5"
          />
          <span className="text-[10px] font-header font-black text-white uppercase tracking-widest">
            MuzicMania Desktop
          </span>
        </div>
        <div className="flex items-center h-full">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).__toggleFocusMode) {
                (window as any).__toggleFocusMode();
              }
            }}
            className="w-11 h-full flex items-center justify-center text-gray-500 hover:text-neon-green hover:bg-white/5 transition-all"
            title="Modo concentración (ocultar interfaz)"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-11 h-full flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:bg-white/5 transition-all"
            title="Ajustes de escritorio"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            onClick={handleMinimize}
            className="w-11 h-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="w-11 h-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMaximized ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="14" height="14" rx="1" />
                <line x1="9" y1="5" x2="9" y2="19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="14" height="14" rx="1" />
              </svg>
            )}
          </button>
          <button
            onClick={handleClose}
            className="w-11 h-full flex items-center justify-center text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {showSettings && <DesktopSettings onClose={() => setShowSettings(false)} />}
    </>
  );
}
