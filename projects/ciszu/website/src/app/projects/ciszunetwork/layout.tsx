import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZU NETWORK',
  description: 'Ciszu Network: compañía de innovación digital con desarrollo web, cloud y UI/UX.',
};

export default function CiszuNetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}