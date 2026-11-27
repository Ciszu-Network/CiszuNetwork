'use client';

import ComingSoonInvite from '@/components/invite/ComingSoonInvite';
import { useClientI18n } from '@/hooks/useClientI18n';

const TELEGRAM_THEME = {
  accent: 'text-[#229ED9]',
  accentBg: 'bg-[#229ED9]/10',
  accentBorder: 'border-[#229ED9]/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-[#229ED9] to-neon-blue',
};

export default function TelegramInvitePage() {
  const { dict } = useClientI18n();
  return <ComingSoonInvite icon="telegram" theme={TELEGRAM_THEME} copy={dict.telegramInvitePage} />;
}
