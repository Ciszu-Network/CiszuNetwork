'use client';

/**
 * AfterGameAd — dispara el anuncio INTRUSIVO TEMPORAL OPCIONAL al terminar una
 * partida de MuzicMania. Se monta en la fase de resultados.
 *
 * Política (AD_SYSTEM): NUNCA hay recompensas que modifiquen el resultado del
 * gameplay. El anuncio tras ganar/perder es intrusivo temporal con opción de
 * cierre (X), sin espera ni recompensa. El sistema de recompensas (reward)
 * existe en @ciszu/ui para un futuro, pero NO se aplica a este evento.
 *
 * Retry: el `trigger('intrusive', 'game_end')` puede fallar si el periodo de
 * gracia (10s al entrar) o el cooldown lo bloquean al inicio. Se reintenta
 * cada 700ms hasta ~6s para que el anuncio SIEMPRE aparezca tras la partida.
 */
import { useEffect, useRef } from 'react';
import { useAds } from '@ciszu/ui';

export default function AfterGameAd() {
  const { trigger } = useAds();
  const shownRef = useRef(false);

  useEffect(() => {
    const attempts = window.setInterval(() => {
      if (shownRef.current) { window.clearInterval(attempts); return; }
      const ad = trigger('intrusive', 'game_end');
      if (ad) {
        shownRef.current = true;
        window.clearInterval(attempts);
      }
    }, 700);
    const stop = window.setTimeout(() => window.clearInterval(attempts), 7000);
    return () => { window.clearInterval(attempts); window.clearTimeout(stop); };
  }, [trigger]);

  return null;
}