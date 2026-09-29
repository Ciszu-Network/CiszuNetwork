import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | ABOUT',
  description:
    'Acerca de CiszuBot: qué es, cómo funciona, su stack técnico y cómo empezar a usarlo.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
