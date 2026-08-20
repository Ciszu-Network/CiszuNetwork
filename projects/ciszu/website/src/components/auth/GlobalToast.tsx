'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export default function GlobalToast() {
  const { toast, hideToast } = useAppStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hideToast(), 3500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-up pointer-events-none">
      <div className="bg-[#05050a]/95 border border-brand-light/40 px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(58,107,240,0.4)] backdrop-blur-md flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse shrink-0" />
        <span className="text-brand-light font-bold uppercase tracking-widest text-[10px] sm:text-xs">{toast}</span>
      </div>
    </div>
  );
}