import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feliz Día del Padre 2026 💙',
  robots: { index: false, follow: false },
};

export default function FddpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}