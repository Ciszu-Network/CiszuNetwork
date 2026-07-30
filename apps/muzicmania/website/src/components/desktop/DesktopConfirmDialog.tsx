'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  showDontAsk: boolean;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}

export function DesktopConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, showDontAsk, onConfirm, onCancel
}: ConfirmDialogProps) {
  const [dontAsk, setDontAsk] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9997] bg-black/70 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#05050a] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl space-y-5"
          >
            <h3 className="text-lg font-header font-black text-white uppercase tracking-tight italic">
              {title}
            </h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed">
              {message}
            </p>
            {showDontAsk && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setDontAsk(!dontAsk)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${dontAsk ? 'bg-neon-blue border-neon-blue' : 'border-white/20 group-hover:border-white/40'}`}
                >
                  {dontAsk && (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-300 transition-all">
                  No volver a preguntar
                </span>
              </label>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDontAsk(false); onCancel(); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-header font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => { const d = dontAsk; setDontAsk(false); onConfirm(d); }}
                className="flex-1 py-3 bg-neon-pink/20 hover:bg-neon-pink border border-neon-pink/30 hover:border-neon-pink rounded-xl text-[10px] font-header font-black uppercase tracking-widest text-neon-pink hover:text-black transition-all cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
