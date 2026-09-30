'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, useToast } from '@ciszu/ui';
import { INVITE_URL } from '@/lib/i18n';

export type InviteFlowCopy = {
  title: string;
  body: string;
  done: string;
  home: string;
  wait: string;
  cancel: string;
  countdown: string;
  again: string;
  confirmed: string;
};

type Step = 'idle' | 'awaiting' | 'countdown';

/** Segundos que se muestran antes de volver al inicio tras confirmar. */
const COUNTDOWN = 10;

/**
 * Flujo central de invitación de `/invite`.
 *
 *  1. El usuario pulsa el botón → se le FELICITA (toast) y, tras 3 s (para
 *     que alcance a verlo), se abre Discord en una pestaña nueva con la
 *     autorización oficial.
 *  2. Se le pide confirmar que terminó la invitación (acción del usuario).
 *  3. Al confirmar empieza una cuenta atrás; al llegar a 0 se redirige al
 *     inicio (o antes, si pulsa «Ir al inicio ahora»).
 *
 * Todo el estado es local: no depende de la respuesta de Discord (que es
 * cross-origin) y por eso ofrece confirmación manual + cuenta atrás.
 */
export default function InviteButton({
  label,
  thanks,
  note,
  flow,
}: {
  label: string;
  thanks: string;
  note: string;
  flow: InviteFlowCopy;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirected = useRef(false);

  /**
   * Felicita al usuario y abre la invitación oficial con 3 s de retardo: si la
   * pestaña nueva se abriera de inmediato, el agradecimiento (toast y panel)
   * no se vería porque el navegador pasa el foco a la otra pestaña.
   */
  const startInvite = () => {
    toast(thanks, 'success');
    setStep('awaiting');
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      window.open(INVITE_URL, '_blank', 'noopener,noreferrer');
    }, 3000);
  };

  // Limpia el temporizador de apertura si el componente se desmonta.
  useEffect(
    () => () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    },
    [],
  );

  // Cuenta atrás (solo en el paso 'countdown').
  useEffect(() => {
    if (step !== 'countdown') return;
    setSeconds(COUNTDOWN);
    timerRef.current = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Al terminar la cuenta atrás, volver al inicio.
  useEffect(() => {
    if (step === 'countdown' && seconds === 0 && !redirected.current) {
      redirected.current = true;
      router.push('/');
    }
  }, [step, seconds, router]);

  const progress = step === 'countdown' ? Math.min(100, ((COUNTDOWN - seconds) / COUNTDOWN) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {step === 'idle' ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              type="button"
              onClick={startInvite}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-10 py-5 font-header text-base font-black uppercase tracking-widest text-white shadow-[0_10px_40px_-8px_rgba(0,212,255,0.9)] transition-colors hover:shadow-[0_18px_50px_-8px_rgba(255,51,204,0.9)]"
            >
              <Icon
                name="discord"
                size={24}
                className="[&>g]:fill-current transition-transform duration-300 group-hover:scale-110"
              />
              {label}
            </motion.button>
            <p className="max-w-md text-center text-xs text-muted">{note}</p>
          </motion.div>
        ) : (
          <motion.div
            key="flow"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-xl rounded-2xl border border-neon-blue/40 bg-card p-6 text-center shadow-[0_0_40px_-12px_rgba(0,212,255,0.6)]"
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-pink text-2xl text-white">
              <Icon name="heart" size={26} />
            </div>
            <h3 className="font-header text-lg font-black uppercase tracking-wide text-ink">{flow.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{flow.body}</p>

            {step === 'countdown' ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-neon-blue" aria-live="polite">
                  {flow.confirmed}
                </p>
                <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-300">
                  {flow.countdown.replace('{n}', String(seconds))}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear', duration: 0.4 }}
                  />
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-400/15 border border-brand-400/40 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-300 hover:bg-brand-400/25 transition-all"
                  >
                    <Icon name="home" size={14} />
                    {flow.home}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeconds((s) => s + COUNTDOWN)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted hover:text-ink transition-all"
                  >
                    <Icon name="clock" size={14} />
                    {flow.wait}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('awaiting')}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted hover:text-ink transition-all"
                  >
                    <Icon name="close" size={14} />
                    {flow.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('countdown')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_25px_-8px_rgba(0,212,255,0.8)] hover:scale-[1.03] active:scale-95 transition-transform"
                >
                  <Icon name="check" size={15} />
                  {flow.done}
                </button>
                <button
                  type="button"
                  onClick={startInvite}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-xs font-black uppercase tracking-widest text-muted hover:text-ink hover:border-brand-400/40 transition-all"
                >
                  <Icon name="discord" size={15} />
                  {flow.again}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('idle')}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-xs font-black uppercase tracking-widest text-muted hover:text-ink transition-all"
                >
                  <Icon name="close" size={15} />
                  {flow.cancel}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
