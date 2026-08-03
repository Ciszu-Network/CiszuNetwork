'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const I = {
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function AuthWarningModal({ isOpen, onClose, message }: AuthWarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-sm bg-black border-2 border-neon-red/30 p-10 rounded-[3rem] text-center space-y-8 shadow-[0_0_80px_rgba(255,0,0,0.15)]"
          >
            <div className="w-20 h-20 bg-neon-red/10 border border-neon-red/30 rounded-full flex items-center justify-center mx-auto text-neon-red">
              <div className="w-10 h-10">{I.user}</div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-header font-black text-white uppercase tracking-tighter">Invitado</h3>
              <p className="text-white/40 font-bold uppercase text-[10px] leading-relaxed tracking-widest px-4">{message || 'Necesitas una cuenta para interactuar en esta sección.'}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={onClose} className="w-full py-4 rounded-2xl font-header font-black uppercase tracking-widest text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">CONTINUAR COMO INVITADO</button>
              <div className="flex gap-3">
                <Link href="/login" className="flex-1 h-12 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-2xl font-header font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-neon-pink/20">INICIAR SESIÓN</Link>
                <Link href="/register" className="flex-1 h-12 border border-white/20 text-white rounded-2xl font-header font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-white/10 transition-all">REGISTRARSE</Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
