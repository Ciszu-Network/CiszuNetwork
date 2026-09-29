import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | FEEDBACK',
  description: 'Envíanos tu opinión, reporta un problema o abre el reporte de seguridad. Tus comentarios hacen crecer Ciszu Network.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
