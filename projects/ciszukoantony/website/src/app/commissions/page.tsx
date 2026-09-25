'use client';

import React from 'react';
import { InfoAccordion, InfoCardGrid, InfoCtaRow, InfoHero, InfoSteps, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const SERVICES = [
  {
    icon: 'globe',
    title: 'Sitios y aplicaciones web',
    body: 'Webs y apps Next.js/React con diseño responsive, SEO, CDN propio y despliegue continuo.',
  },
  {
    icon: 'robot',
    title: 'Bots y automatización',
    body: 'Bots de Discord, WhatsApp y Telegram; integraciones, comandos y tareas programadas.',
  },
  {
    icon: 'gamepad',
    title: 'Juegos y experiencias',
    body: 'Juegos web y apps de escritorio, como MuzicMania (Next.js + Tauri para Windows).',
  },
  {
    icon: 'palette',
    title: 'Identidad visual',
    body: 'Logos, paletas, iconografía y sistemas de diseño coherentes con tu marca.',
  },
  {
    icon: 'server',
    title: 'Backend y datos',
    body: 'Supabase/Postgres con RLS, autenticación, APIs y paneles de administración.',
  },
  {
    icon: 'settings',
    title: 'Mantenimiento y soporte',
    body: 'Actualizaciones, monitorización, corrección de errores y mejoras por iteraciones.',
  },
];

const PROCESS = [
  {
    title: 'Contacto',
    body: 'Cuéntame la idea por el formulario, correo o WhatsApp: objetivo, referencias y fecha deseada.',
  },
  {
    title: 'Propuesta y presupuesto',
    body: 'Recibes alcance, entregables, calendario y cotización detallada. Sin compromiso.',
  },
  {
    title: 'Anticipo y arranque',
    body: 'Con la propuesta aprobada se reserva el cupo con un anticipo del 50% y comienza el desarrollo.',
  },
  {
    title: 'Desarrollo con avances',
    body: 'Trabajo por hitos con avances visibles: puedes revisar y ajustar durante el proceso.',
  },
  {
    title: 'Entrega y cierre',
    body: 'Entrega final, ajustes acordados, traspaso de accesos y liquidación del 50% restante.',
  },
];

const TERMS = [
  {
    q: '¿Cómo se calcula el precio?',
    a: 'La cotización es personalizada: depende del alcance, la complejidad, las integraciones y la fecha de entrega. Cada propuesta detalla qué incluye y qué no, sin costos ocultos.',
  },
  {
    q: '¿Cómo funcionan los pagos?',
    a: '50% de anticipo para reservar el cupo y arrancar; 50% restante contra entrega final. El anticipo no es reembolsable una vez iniciado el desarrollo.',
  },
  {
    q: '¿Cuántas revisiones incluye?',
    a: 'Cada hito incluye una ronda de ajustes sobre lo acordado. Los cambios de alcance se cotizan aparte como trabajo adicional.',
  },
  {
    q: '¿De quién es el trabajo?',
    a: 'El código y el diseño entregados pasan a ser tuyos al liquidar el proyecto. El portfolio y los proyectos de Ciszu Network pueden mostrarse como referencia salvo acuerdo de confidencialidad.',
  },
  {
    q: '¿Qué pasa si se cancela?',
    a: 'Si cancelas después del anticipo, se entrega el trabajo realizado hasta la fecha y se factura por las horas invertidas. Si la cancelación es mía, devuelvo la parte proporcional no trabajada.',
  },
  {
    q: '¿Ofreces mantenimiento?',
    a: 'Sí. El mantenimiento continuo se contrata aparte, con tarifa mensual según el tamaño del proyecto y el nivel de soporte requerido.',
  },
];

export default function CommissionsPage() {
  usePageTitle('COMMISSIONS');
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="money"
          title="Commissions"
          subtitle="Servicios de desarrollo, bots, juegos, identidad visual y automatización. Trabajo directo conmigo, con alcance claro, hitos visibles y trato justo."
          kicker="Servicios"
          theme={THEME}
        />

        <div className="p-6 rounded-2xl bg-neon-green/5 border border-neon-green/30 text-center mb-12">
          <p className="text-neon-green font-header font-bold text-sm uppercase tracking-widest">
            Comisiones abiertas
          </p>
          <p className="text-white/50 text-xs mt-2">
            Cupos limitados por mes para garantizar dedicación. Respuesta habitual en 24-48 horas.
          </p>
        </div>

        <div className="mb-14">
          <InfoCardGrid title="Qué ofrezco" items={SERVICES} theme={THEME} columns={3} />
        </div>

        <div className="mb-14">
          <InfoSteps title="Proceso de una comisión" steps={PROCESS} theme={THEME} />
        </div>

        <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 mb-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            Tarifas
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            No publico precios fijos porque cada proyecto es distinto. La cotización se calcula según:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              'Alcance y número de pantallas o funciones',
              'Integraciones externas (pagos, auth, APIs)',
              'Diseño de identidad visual desde cero',
              'Plataformas objetivo (web, Discord, escritorio)',
              'Urgencia y fecha de entrega',
              'Mantenimiento posterior contratado',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-white/40 text-xs">
            Pago en dos partes: 50% de anticipo y 50% contra entrega. Presupuesto cerrado por escrito
            antes de empezar.
          </p>
        </section>

        <section className="mb-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            Términos y condiciones (resumen)
          </h2>
          <InfoAccordion items={TERMS} theme={THEME} />
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Contacto', href: '/contact', icon: 'mail' },
            { label: 'WhatsApp', href: 'https://wa.me/584126858111', icon: 'comment', external: true },
            { label: 'Portfolio', href: '/portfolio', icon: 'palette', variant: 'ghost' },
            { label: 'Proyectos', href: '/projects', icon: 'rocket', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
