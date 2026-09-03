'use client';

/**
 * AfterGameAd — dispara el anuncio INTRUSIVO TEMPORAL OPCIONAL al terminar una
 * partida de MuzicMania. Se monta en la fase de resultados.
 *
 * Política (AD_SYSTEM): NUNCA hay recompensas que modifiquen el resultado del
 * gameplay. El anuncio tras ganar/perder es intrusivo temporal con opción de
 * cierre (X), sin espera ni recompensa. El sistema de recompensas (reward)
 * existe en @ciszu/ui para un futuro, pero NO se aplica a este evento.
 */
import { useEffect } from 'react';
import { useAds } from '@ciszu/ui';

export default function AfterGameAd() {
  const { trigger } = useAds();

  useEffect(() => {
    const t = window.setTimeout(() => {
      trigger('intrusive', 'game_end');
    }, 800);
    return () => window.clearTimeout(t);
  }, [trigger]);

  return null;
}