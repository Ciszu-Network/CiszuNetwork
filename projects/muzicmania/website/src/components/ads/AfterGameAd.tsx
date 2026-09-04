'use client';

/**
 * AfterGameAd — dispara el anuncio INTRUSIVO TEMPORAL OPCIONAL al terminar una
 * partida de MuzicMania. Se monta en la fase de resultados.
 *
 * Política (AD_SYSTEM):
 *   - NUNCA hay recompensas que modifiquen el resultado del gameplay. El
 *     anuncio tras ganar/perder es intrusivo temporal con opción de cierre (X),
 *     sin espera ni recompensa. El sistema de recompensas (reward) existe en
 *     @ciszu/ui para un futuro, pero NO se aplica a este evento.
 *   - El anuncio tras la partida usa el MISMO pool creativo que los anuncios de
 *     esquina (marcas de Ciszu Network: cuenta CISZU ID, CiszuBot, Ciszuko
 *     Antony, Ciszugamens + huecos de terceros). NUNCA un anuncio de la propia
 *     web tipo "¿disfrutaste la partida?" (no auto-propagar).
 *   - Usuarios REGISTRADOS (sesión CISZU ID en MuzicMania): no ven anuncios
 *     tras la partida. Los invitados sí, y en ellos se mantiene el CTA
 *     "Regístrate y ve menos anuncios" del modal.
 *
 * Retry: el `trigger('intrusive', 'game_end')` puede fallar si el periodo de
 * gracia (10s al entrar) o el cooldown lo bloquean al inicio. Se reintenta
 * cada 700ms hasta ~15s (por encima de la gracia de 10s) para que el anuncio
 * SIEMPRE aparezca tras la partida (en invitados).
 */
import { useEffect, useRef } from 'react';
import { useAds } from '@ciszu/ui';

export default function AfterGameAd() {
  const { trigger, authenticated, catalog } = useAds();
  const shownRef = useRef(false);

  useEffect(() => {
    // Registrados: política AD_SYSTEM, sin anuncios tras la partida.
    if (authenticated) {
      console.log('[AfterGameAd] User authenticated, skipping ad');
      return;
    }
    console.log('[AfterGameAd] Starting retry loop for game_end ad');
    const attempts = window.setInterval(() => {
      if (shownRef.current) { 
        console.log('[AfterGameAd] Already shown, clearing interval');
        window.clearInterval(attempts); 
        return; 
      }
      const ad = trigger('intrusive', 'game_end');
      console.log('[AfterGameAd] trigger result:', ad ? 'AD SHOWN' : 'null (no ad/cooldown)');
      if (ad) {
        shownRef.current = true;
        window.clearInterval(attempts);
      }
    }, 700);
    const stop = window.setTimeout(() => {
      console.log('[AfterGameAd] Timeout reached, stopping retries');
      window.clearInterval(attempts); 
    }, 15000);
    return () => { window.clearInterval(attempts); window.clearTimeout(stop); };
  }, [trigger, authenticated]);

  // Debug: log catalog ads for game_end
  useEffect(() => {
    const gameEndAds = catalog.filter(a => a.type === 'intrusive' && a.placement === 'game_end');
    console.log('[AfterGameAd] Available game_end ads in catalog:', gameEndAds.map(a => ({ id: a.id, type: a.type, placement: a.placement, source: a.content.source })));
  }, [catalog]);

  return null;
}