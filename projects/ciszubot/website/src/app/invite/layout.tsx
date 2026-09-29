import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | INVITE',
  description:
    'Invita a CiszuBot a tu servidor de Discord: autorización oficial en un clic, permisos, pasos de instalación y soporte. Gratis y sin registro.',
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
