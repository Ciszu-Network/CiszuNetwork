import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | TELEGRAM',
  description:
    'La invitación oficial de CiszuBot para Telegram estará disponible próximamente. Mientras tanto, úsalo en Discord.',
};

export default function TelegramInviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
