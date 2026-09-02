import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | DONAR',
  description: 'Apoya a Ciszu Network con una donación. Ko-fi, Buy Me a Coffee, Patreon, PayPal y cripto (NOWPayments).',
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}