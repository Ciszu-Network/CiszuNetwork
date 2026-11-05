'use client';

import { useState } from 'react';
import { declareAdult } from '@/lib/economy/client';

export function AgeGateModal({ open, onClose, onDeclared }: { open: boolean; onClose: () => void; onDeclared: () => void }) {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#08080c] p-5">
        <h3 className="font-header text-xl font-black uppercase text-white">Verificación 18+</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-white/50">Declara tu fecha de nacimiento para comprar MZP. Quedará bloqueada al confirmar.</p>
        <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mt-4 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white" />
        {error && <p className="mt-2 text-[10px] text-red-300">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/50">Cancelar</button>
          <button type="button" onClick={async () => {
            setError('');
            try {
              await declareAdult(birthDate, 'store-v1');
              onDeclared();
              onClose();
            } catch (cause) {
              setError(cause instanceof Error && cause.message === 'minor' ? 'Debes ser mayor de 18 años.' : 'No se pudo verificar.');
            }
          }} className="rounded-xl bg-neon-cyan px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
