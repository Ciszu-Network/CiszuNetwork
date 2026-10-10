import type { Metadata } from 'next';
import InformationContent from './InformationContent';

export const metadata: Metadata = {
  title: 'Ciszu Network | INFORMATION',
  description:
    'Branding completo de Ciszu Network: identidad visual, colorología, iconografía, ecosistema tecnológico, misión, visión y todas las secciones del ecosistema.',
};

export default function InformationPage() {
  return <InformationContent />;
}
