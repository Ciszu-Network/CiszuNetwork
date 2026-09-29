import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | TERMS',
  description: 'Términos de servicio de CiszuBot, el bot de Discord de Ciszu Network.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
