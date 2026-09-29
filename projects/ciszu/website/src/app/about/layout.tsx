import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | ABOUT',
  description: 'Conoce a Ciszu Network: nuestra misión, visión y compañía de innovación digital.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
