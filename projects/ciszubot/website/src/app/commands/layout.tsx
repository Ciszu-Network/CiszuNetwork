import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | COMMANDS',
  description:
    'Todos los comandos de CiszuBot con descripción, uso y aliases. Diversión, información, social y utilidad.',
};

export default function CommandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
