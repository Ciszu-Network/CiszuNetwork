import type { Metadata } from 'next';
import TeamContent from './TeamContent';

export const metadata: Metadata = {
  title: 'Ciszu Network | TEAM',
  description: 'Conoce al equipo de Ciszu Network y la visión de su fundador, Ciszuko Antony.',
};

export default function TeamPage() {
  return <TeamContent />;
}
