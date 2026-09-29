import type { Metadata } from 'next';
import { PAGE_META } from './content';

export const metadata: Metadata = PAGE_META;

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
