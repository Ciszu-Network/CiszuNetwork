import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | FEEDBACK',
  description:
    'Envía feedback, reporta errores o sugiere comandos para CiszuBot. Formulario, email y reporte de problemas.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
