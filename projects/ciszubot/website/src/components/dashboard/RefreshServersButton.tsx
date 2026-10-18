'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@ciszu/ui';

/**
 * Botón "Actualizar servidores": re-fetch del servidor (router.refresh) para
 * recuperar la lista cuando una sesión vieja la deja vacía sin recargar la
 * página entera.
 */
export default function RefreshServersButton({ label }: { label: string }) {
  const router = useRouter();
  const [refreshing, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      disabled={refreshing}
      className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-muted transition hover:border-neon-blue/60 hover:text-ink disabled:opacity-50"
    >
      <Icon name="history" size={16} className={refreshing ? 'animate-spin' : ''} />
      {label}
    </button>
  );
}
