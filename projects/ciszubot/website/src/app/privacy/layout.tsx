import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | PRIVACY',
  description: 'Política de privacidad de CiszuBot, el bot de Discord de Ciszu Network.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
