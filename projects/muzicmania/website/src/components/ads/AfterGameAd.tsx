'use client';

/**
 * AfterGameAd — dispara el anuncio intrusivo (y el de recompensa como respaldo)
 * al terminar una partida de MuzicMania. Se monta en la fase de resultados.
 * Los anuncios son overlay flotante: no alteran el layout de la página.
 */
import { useEffect } from 'react';
import { useAds } from '@ciszu/ui';

export default function AfterGameAd() {
  const { trigger } = useAds();

  useEffect(() => {
    const t = window.setTimeout(() => {
      // Intrusivo siempre tras la acción; si está en intervalo, cae el de recompensa.
      if (!trigger('intrusive', 'game_end')) {
        trigger('reward', 'game_end');
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [trigger]);

  return null;
}