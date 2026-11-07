'use client';

/**
 * Aviso exclusivo de desarrollo local. No existe en producción:
 * NODE_ENV=production devuelve null antes de renderizar.
 * La sesión y el actor los inyecta devcon al arrancar las webs.
 */
export function LocalDevDisclaimer() {
  if (process.env.NODE_ENV === 'production') return null;
  const session = process.env.NEXT_PUBLIC_LOCAL_DEV_SESSION_ID || 'manual';
  const actor = process.env.NEXT_PUBLIC_LOCAL_DEV_ACTOR || 'local';
  return (
    <div className="fixed bottom-3 left-3 z-[9999] max-w-[calc(100vw-1.5rem)] rounded-xl border border-amber-400/40 bg-black/90 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-amber-300 shadow-2xl backdrop-blur">
      LOCAL DEV · SESIÓN {session.slice(0, 10)} · {actor}
    </div>
  );
}

export default LocalDevDisclaimer;
