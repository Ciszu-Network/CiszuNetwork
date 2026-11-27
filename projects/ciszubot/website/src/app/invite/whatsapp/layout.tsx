import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | WHATSAPP',
  description:
    'La invitación oficial de CiszuBot para WhatsApp estará disponible próximamente. Mientras tanto, úsalo en Discord.',
};

export default function WhatsAppInviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
