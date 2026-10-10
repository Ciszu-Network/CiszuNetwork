'use client';

import { useEffect } from 'react';
import { useDisclaimer } from '@ciszu/ui';
import useLiveBotStatus from '@/components/home/useLiveBotStatus';
import { resolveBotStatus } from '@/lib/botStatus';
import { useClientI18n } from '@/hooks/useClientI18n';

/**
 * Disclaimer OBLIGATORIO de CiszuBot cuando el bot está desconectado.
 *
 * Se publica en el sistema global de disclaimers con `dismissible: false`
 * (sin X y sin botón de cierre) y desaparece solo cuando el bot vuelve.
 * Si más adelante el bot cambia de razón, el texto se actualiza en vivo.
 */
export default function BotOfflineDisclaimer() {
  const { dict } = useClientI18n();
  const status = useLiveBotStatus(null);
  const resolved = resolveBotStatus(status, Date.now());
  const offline = status !== null && !resolved.online;

  const { push, remove } = useDisclaimer();

  useEffect(() => {
    if (!offline) {
      remove('ciszubot-offline');
      return;
    }
    const reason = dict.botStatus.reasons[resolved.reason ?? 'unknown'];
    const body = dict.botStatus.bannerBody.replace('{reason}', reason);
    push({
      id: 'ciszubot-offline',
      kind: 'warning',
      dismissible: false,
      onClose: () => {
        /* Obligatorio: sin cierre manual. Se retira solo al reconectar. */
      },
      message: `${dict.botStatus.bannerTitle} — ${body} ${dict.botStatus.refreshHint}`,
    });
    return () => remove('ciszubot-offline');
  }, [offline, resolved.reason, dict, push, remove]);

  return null;
}
