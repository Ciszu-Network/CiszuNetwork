import { MonitorDown, Smartphone, ShieldCheck } from 'lucide-react';
import { CISZU_NETWORK } from '@/config/site';
import type { Metadata } from 'next';
import { InstallPdwaCta } from '@/components/descargas/InstallPdwaCta';
import { FabRestore, InfoHero, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | DESCARGAS',
  description: 'Instala Ciszu Network como PDWA (App de Escritorio Progresiva) en tu PC o móvil, sin pestañas ni barra de dirección.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const steps = [
  {
    icon: MonitorDown,
    title: 'Abrir en un navegador compatible',
    content: 'Microsoft Edge y Chrome instalan la PDWA de forma nativa desde el icono de la barra de direcciones o desde el botón "Instalar PDWA" que encontrarás aquí abajo. Opera usa un método alternativo (acceso directo con --app=URL), explicado en el propio botón.',
  },
  {
    icon: Smartphone,
    title: 'En móvil (iOS / Android)',
    content: 'Abre la web en Safari o Chrome: menú Compartir → "Añadir a pantalla de inicio". Se crea un acceso directo tipo app con tu logo.',
  },
  {
    icon: ShieldCheck,
    title: 'Segura y sin cuentas',
    content: `${CISZU_NETWORK.name} funciona 100% en tu navegador. La PDWA no requiere registro ni instala archivos en el sistema: solo crea una ventana de app.`,
  },
];

export default function DescargasPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="download"
          title="Descargas"
          subtitle={`Instala ${CISZU_NETWORK.name} como App de Escritorio Progresiva (PDWA) en tu PC o móvil, sin pestañas ni barra de dirección.`}
          kicker="PDWA"
          theme={THEME}
        />

        <div className="space-y-6 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-brand/10 text-brand-light flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-header font-bold text-white mb-2">{s.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/10 to-transparent border border-brand/30 text-center">
          <h2 className="text-2xl md:text-3xl font-header font-black text-white uppercase tracking-tighter mb-4">
            Instalar {CISZU_NETWORK.name} como PDWA
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
            Tu web favorita sin pestañas, con tu logo y acceso directo desde el escritorio o el menú de inicio.
          </p>
          <InstallPdwaCta site={CISZU_NETWORK.name} />
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-header font-bold text-sm mb-1">¿Cerraste el botón flotante?</p>
            <p className="text-gray-400 text-xs">El botón "Instalar PDWA" de abajo a la izquierda se puede volver a mostrar cuando quieras.</p>
          </div>
          <FabRestore accent="#22d3ee" keys={['ciszu-pdwa-dismissed']} />
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}