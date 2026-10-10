'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import useLiveBotStatus from '@/components/home/useLiveBotStatus';
import { resolveBotStatus } from '@/lib/botStatus';
import { useClientI18n } from '@/hooks/useClientI18n';

const ACK_KEY = 'cz-bot-offline-ack';

/**
 * Aviso de entrada al dashboard cuando el bot está desconectado.
 *
 * Aparece al entrar (una vez por episodio de offline y sesión): botón para
 * continuar asumiendo el aviso y botón para volver al inicio. Si el bot
 * vuelve a estar en línea, el modal desaparece solo.
 */
export default function BotOfflineModal() {
  const router = useRouter();
  const { dict } = useClientI18n();
  const status = useLiveBotStatus(null);
  const resolved = resolveBotStatus(status, Date.now());
  const [acked, setAcked] = useState(true);

  const signature = status ? `${resolved.reason ?? 'unknown'}|${(resolved.since ?? '').slice(0, 16)}` : '';

  useEffect(() => {
    if (!status) return;
    try {
      setAcked(sessionStorage.getItem(ACK_KEY) === signature);
    } catch {
      setAcked(false);
    }
  }, [status, signature]);

  const offline = status !== null && !resolved.online;
  if (!offline || acked) return null;

  const reason = dict.botStatus.reasons[resolved.reason ?? 'unknown'];

  const continueInDashboard = () => {
    try {
      sessionStorage.setItem(ACK_KEY, signature);
    } catch {
      /* sin storage: se muestra una vez por montaje */
    }
    setAcked(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.botStatus.modalTitle}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-3xl border border-amber-400/40 bg-[#0a0a14] p-7 text-center shadow-[0_0_60px_-12px_rgba(251,191,36,0.5)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-2xl">
          ⚠️
        </div>
        <h2 className="font-header text-xl font-black uppercase tracking-wide text-amber-400">
          {dict.botStatus.modalTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          {dict.botStatus.modalBody.replace('{reason}', reason)}
        </p>
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/50">
          {dict.botStatus.refreshHint}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={continueInDashboard}
            className="flex-1 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
          >
            {dict.botStatus.modalContinue}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 rounded-xl border border-white/20 px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white/70 transition hover:border-neon-blue/60 hover:text-white"
          >
            <Icon name="arrow-right" size={14} className="mr-2 inline rotate-180" />
            {dict.botStatus.modalHome}
          </button>
        </div>
      </div>
    </div>
  );
}
