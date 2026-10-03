'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  InfoAccordion,
  InfoCardGrid,
  InfoCtaRow,
  InfoHero,
  InfoSteps,
  Modal,
  Icon,
  type InfoTheme,
} from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import {
  COMMISSIONS,
  COMMISSIONS_CONTACT,
  COMMISSIONS_WHATSAPP_URL,
  COMMISSION_GROUPS,
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PRICE_LABEL,
  PRICE_NOTE,
  PRICE_TAG,
  commissionWhatsappUrl,
  commissionsByGroup,
  type CommissionService,
} from '@/data/commissions';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

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

const PRICE_FACTORS = [
  'Alcance y número de entregables',
  'Integraciones externas (pagos, auth, APIs)',
  'Diseño de identidad visual desde cero',
  'Plataformas objetivo (web, Discord, escritorio)',
  'Urgencia y fecha de entrega',
  'Mantenimiento posterior contratado',
];

/* -------------------------------------------------------------------------- */
/* Tarjeta de un servicio (flyer + acento de color propio)                     */
/* -------------------------------------------------------------------------- */

function ServiceCard({
  service,
  index,
  onOpen,
}: {
  service: CommissionService;
  index: number;
  onOpen: (service: CommissionService) => void;
}) {
  const color = service.color;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      onClick={() => onOpen(service)}
      style={{ borderColor: `${color}44` }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white/5 text-left transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.7)]"
    >
      <span className="absolute inset-x-0 top-0 z-20 h-0.5" style={{ background: color }} />

      <span className="relative block overflow-hidden">
        <img
          src={service.flyer}
          alt={service.flyerAlt}
          width={FLYER_WIDTH}
          height={FLYER_HEIGHT}
          loading="lazy"
          className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <span
          className="absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur"
          style={{ color, background: `${color}1f`, borderColor: `${color}66` }}
        >
          {PRICE_LABEL}
        </span>
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="mb-3 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: `${color}22`, color }}
          >
            <Icon name={service.icon} size={20} style={service.icon === 'server' ? 'filled' : 'outline'} />
          </span>
          <span className="min-w-0">
            <span className="block font-header text-base font-black leading-tight text-white">{service.name}</span>
            <span
              className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color }}
            >
              {service.tagline}
            </span>
          </span>
        </span>

        <span className="flex-grow text-xs leading-relaxed text-white/50">{service.description}</span>

        <span className="mt-4 flex flex-wrap gap-1.5">
          {service.includes.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40"
            >
              {item}
            </span>
          ))}
        </span>

        <span
          className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-2.5"
          style={{ color }}
        >
          Ver detalles
          <Icon name="chevronRight" size={14} />
        </span>
      </span>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* Subpanel de detalle de una comisión                                         */
/* -------------------------------------------------------------------------- */

function ServiceDetail({ service }: { service: CommissionService }) {
  const color = service.color;
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img
            src={service.flyer}
            alt={service.flyerAlt}
            width={FLYER_WIDTH}
            height={FLYER_HEIGHT}
            className="h-auto w-full"
          />
          <span
            className="absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur"
            style={{ color, background: `${color}1f`, borderColor: `${color}66` }}
          >
            {PRICE_LABEL} · {PRICE_TAG}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
              style={{ color, background: `${color}1a`, borderColor: `${color}55` }}
            >
              <Icon name={service.icon} size={12} style={service.icon === 'server' ? 'filled' : 'outline'} />
              {service.tagline}
            </span>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{service.description}</p>
          </div>

          {service.programs.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Herramientas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {service.programs.map((program) => (
                  <span
                    key={program}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50"
                  >
                    {program}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Qué incluye
            </p>
            <ul className="grid gap-1.5">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            Cómo lo trabajo
          </p>
          <ol className="space-y-3">
            {service.process.map((step, stepIndex) => (
              <li key={step.title} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-header text-[10px] font-black"
                  style={{ color, background: `${color}14`, borderColor: `${color}44` }}
                >
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-wider text-white/80">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            Entregables
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.deliverables.map((item, itemIndex) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                style={{ borderColor: `${color}33` }}
              >
                <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/30 font-header text-[10px] font-black text-white/50">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                <p className="text-xs leading-relaxed text-white/60">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-white/50">{PRICE_NOTE}</p>
        <a
          href={commissionWhatsappUrl(service)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-3 text-sm font-bold text-[#25D366] transition-all hover:bg-[#25D366] hover:text-black"
        >
          <Icon name="comment" size={16} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function CommissionsPage() {
  usePageTitle('COMMISSIONS');
  const [selected, setSelected] = useState<CommissionService | null>(null);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="money"
          title="Commissions"
          subtitle="Servicios que atiendo en persona —desarrollo, diseño, bots, juegos, identidad visual y automatización—. Trabajo directo conmigo, con alcance claro, hitos visibles y trato justo."
          kicker={`Comisiones personales · ${COMMISSIONS_CONTACT.name}`}
          theme={THEME}
        />

        {/* Marco personal: la empresa es el canal oficial del servicio */}
        <div className="mb-10 grid gap-4 rounded-[2rem] border border-neon-blue/25 bg-neon-blue/5 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue">
              Servicios personales, respaldo de empresa
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Soy <span className="font-bold text-white">{COMMISSIONS_CONTACT.name}</span>. Cada comisión la atiendo
              directamente contigo, de principio a fin. Mis servicios los propago a través de{' '}
              <span className="font-bold text-white">{COMMISSIONS_CONTACT.companyName}</span>, la empresa con la que se
              cotizan, facturan y entregan, y donde vive el catálogo oficial con sus flyers.
            </p>
            <a
              href={COMMISSIONS_CONTACT.companyCatalog}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neon-blue/40 bg-neon-blue/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-neon-blue transition-all hover:bg-neon-blue/20"
            >
              <Icon name="globe" size={14} />
              Ver catálogo oficial de {COMMISSIONS_CONTACT.companyName}
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
            <p className="font-header text-3xl font-black text-white">{COMMISSIONS.length}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Servicios disponibles
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              Precios {PRICE_LABEL.toLowerCase()} y {PRICE_TAG.toLowerCase()}: se ajustan a tu proyecto.
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-neon-green/30 bg-neon-green/5 p-6 text-center">
          <p className="font-header text-sm font-bold uppercase tracking-widest text-neon-green">
            Comisiones abiertas
          </p>
          <p className="mt-2 text-xs text-white/50">
            Cupos limitados por mes para garantizar dedicación. Respuesta habitual en 24-48 horas.
          </p>
        </div>

        {/* Familias de servicios */}
        <div className="mb-14">
          <InfoCardGrid
            title="Qué ofrezco"
            items={COMMISSION_GROUPS.map((group) => ({
              icon: group.icon,
              title: group.label,
              body: group.kicker,
            }))}
            theme={THEME}
            columns={3}
          />
        </div>

        {/* Catálogo por grupos */}
        <div className="mb-14 space-y-14">
          {COMMISSION_GROUPS.map((group) => {
            const items = commissionsByGroup(group.id);
            if (items.length === 0) return null;
            return (
              <section key={group.id}>
                <div className="mb-6 flex items-start gap-4">
                  <span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                    style={{ color: group.color, background: `${group.color}1a`, borderColor: `${group.color}55` }}
                  >
                    <Icon name={group.icon} size={20} style={group.icon === 'server' ? 'filled' : 'outline'} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-header text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                      {group.label}
                    </h2>
                    <p
                      className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] opacity-80"
                      style={{ color: group.color }}
                    >
                      {group.kicker} · {items.length}
                    </p>
                    <span
                      className="mt-3 block h-0.5 w-14 rounded-full"
                      style={{ background: group.color }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((service, index) => (
                    <ServiceCard key={service.slug} service={service} index={index} onOpen={setSelected} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mb-14">
          <InfoSteps title="Proceso de una comisión" steps={PROCESS} theme={THEME} />
        </div>

        <section className="mb-14 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className={`mb-5 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>Tarifas</h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            No publico precios fijos porque cada proyecto es distinto. La cotización se calcula según:
          </p>
          <ul className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRICE_FACTORS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-blue" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40">
            Pago en dos partes: 50% de anticipo y 50% contra entrega. Presupuesto cerrado por escrito antes de empezar.
          </p>
        </section>

        <section className="mb-14">
          <h2 className={`mb-5 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
            Términos y condiciones (resumen)
          </h2>
          <InfoAccordion items={TERMS} theme={THEME} />
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Contacto', href: '/contact', icon: 'mail' },
            { label: 'WhatsApp', href: COMMISSIONS_WHATSAPP_URL, icon: 'comment', external: true },
            { label: 'Portfolio', href: '/portfolio', icon: 'portfolio', variant: 'ghost' },
            { label: 'Proyectos', href: '/projects', icon: 'rocket', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? selected.name : ''}
        description={selected ? selected.tagline : undefined}
        size="lg"
        className="max-w-4xl max-h-[88vh] overflow-y-auto"
      >
        {selected ? <ServiceDetail service={selected} /> : null}
      </Modal>

      <QuickDocks />
    </div>
  );
}
