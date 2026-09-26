'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { useDict } from '@/lib/useDict';

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const I = {
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function AuthWarningModal({ isOpen, onClose, message }: AuthWarningModalProps) {
  const t = useDict();
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
              <h3 className="text-2xl font-header font-black text-white uppercase tracking-tighter">{t.authWarning.guest}</h3>
              <p className="text-white/40 font-bold uppercase text-[10px] leading-relaxed tracking-widest px-4">{message || t.authWarning.message}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="outline" size="lg" onPress={onClose} className="w-full font-black uppercase tracking-widest text-sm">
                {t.authWarning.continueGuest.toUpperCase()}
              </Button>
              <div className="flex gap-3">
                <Link href="/login" className="flex-1 inline-flex items-center justify-center h-12 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-neon-pink/20">
                  {t.authWarning.login.toUpperCase()}
                </Link>
                <Link href="/register" className="flex-1 inline-flex items-center justify-center h-12 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                  {t.authWarning.register.toUpperCase()}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
