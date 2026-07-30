'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons nativos (evita dependencia de lucide-react y exports inexistentes)
const IconCheck    = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconAlert    = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconLoader   = () => <svg viewBox="0 0 24 24" className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IconShield   = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IconArrow    = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

interface AuthFeedbackProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'loading' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
}

export default function AuthFeedback({ isVisible, type, title, message, onConfirm }: AuthFeedbackProps) {
  const themes = {
    success: {
      color: 'text-neon-cyan',
      glow: 'shadow-neon-blue',
      icon: <IconCheck />,
      border: 'border-neon-cyan/50',
      bg: 'bg-neon-cyan/5'
    },
    error: {
      color: 'text-red-500',
      glow: 'shadow-red-500/50',
      icon: <IconAlert />,
      border: 'border-red-500/50',
      bg: 'bg-red-500/5'
    },
    loading: {
      color: 'text-neon-purple',
      glow: 'shadow-neon-purple/50',
      icon: <IconLoader />,
      border: 'border-neon-purple/50',
      bg: 'bg-neon-purple/5'
    },
    info: {
      color: 'text-neon-blue',
      glow: 'shadow-neon-blue/50',
      icon: <IconShield />,
      border: 'border-neon-blue/50',
      bg: 'bg-neon-blue/5'
    }
  };

  const theme = themes[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative max-w-sm w-full p-8 rounded-[2.5rem] border ${theme.border} ${theme.bg} backdrop-blur-2xl ${theme.glow} shadow-2xl space-y-6 text-center`}
          >
            <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-black border border-white/10 ${theme.color}`}>
              {theme.icon}
            </div>

            <div className="space-y-2">
              <h3 className={`text-xl font-header font-black uppercase tracking-tighter ${theme.color}`}>
                {title}
              </h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                {message}
              </p>
            </div>

            {type !== 'loading' && onConfirm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`w-full py-4 rounded-xl bg-white text-black font-header font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-neon-cyan`}
              >
                Continuar
                <IconArrow />
              </motion.button>
            )}

            {/* Decorative scanline effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
