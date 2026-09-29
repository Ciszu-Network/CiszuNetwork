import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | HELP',
  description:
    'Centro de ayuda de CiszuBot: invitar el bot, comandos, permisos, música, economía, moderación y solución de problemas.',
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
