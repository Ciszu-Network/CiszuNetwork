'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isTauri } from '@/lib/isTauri';

interface DesktopSettings {
  close_confirm: boolean;
  link_confirm: boolean;
}

async function getSettings(): Promise<DesktopSettings> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<DesktopSettings>('get_settings');
  } catch {
    return { close_confirm: true, link_confirm: true };
  }
}

async function setSettings(s: DesktopSettings) {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('update_settings', { settings: s });
  } catch { /* fallback */ }
}

export function DesktopSettings({ onClose }: { onClose: () => void }) {
  const [closeConfirm, setCloseConfirmState] = useState(true);
  const [linkConfirm, setLinkConfirmState] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setCloseConfirmState(s.close_confirm);
      setLinkConfirmState(s.link_confirm);
    });
  }, []);

  const toggleCloseConfirm = useCallback(() => {
    setCloseConfirmState((prev) => {
      const next = !prev;
      getSettings().then((s) => setSettings({ ...s, close_confirm: next }));
      return next;
    });
  }, []);

  const toggleLinkConfirm = useCallback(() => {
    setLinkConfirmState((prev) => {
      const next = !prev;
      getSettings().then((s) => setSettings({ ...s, link_confirm: next }));
      return next;
    });
  }, []);

  if (typeof window !== 'undefined' && !isTauri()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="bg-[#05050a] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-neon-cyan">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 className="text-xl font-header font-black text-white uppercase tracking-tight italic">
              AJUSTES DE ESCRITORIO
            </h2>
          </div>

          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Preferencias exclusivas para la versión compilada de MuzicMania.
          </p>

          <div className="space-y-4">
            <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/[0.07] transition-all">
              <div>
                <span className="text-xs font-header font-black text-white uppercase tracking-wider">Confirmar al cerrar</span>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Mostrar advertencia al salir del programa</p>
              </div>
              <div
                onClick={toggleCloseConfirm}
                className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${closeConfirm ? 'bg-neon-blue' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${closeConfirm ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/[0.07] transition-all">
              <div>
                <span className="text-xs font-header font-black text-white uppercase tracking-wider">Confirmar enlaces externos</span>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Advertir antes de abrir un enlace en el navegador</p>
              </div>
              <div
                onClick={toggleLinkConfirm}
                className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${linkConfirm ? 'bg-neon-blue' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${linkConfirm ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-header font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            CERRAR AJUSTES
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
