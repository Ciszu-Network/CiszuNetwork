'use client';

import ComingSoonInvite from '@/components/invite/ComingSoonInvite';
import { useClientI18n } from '@/hooks/useClientI18n';

const WHATSAPP_THEME = {
  accent: 'text-[#25D366]',
  accentBg: 'bg-[#25D366]/10',
  accentBorder: 'border-[#25D366]/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-[#25D366] to-[#128C7E]',
};

export default function WhatsAppInvitePage() {
  const { dict } = useClientI18n();
  return <ComingSoonInvite icon="whatsapp" theme={WHATSAPP_THEME} copy={dict.whatsappInvitePage} />;
}
