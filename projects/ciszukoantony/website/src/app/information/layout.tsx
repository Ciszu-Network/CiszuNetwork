import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Information | Ciszuko Antony',
  description:
    'Identidad visual, colorología, iconografía y stack tecnológico del portfolio de Ciszuko Antony: la marca personal de Ciszu Network en una sola página.',
};

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
