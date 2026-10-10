import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { InfoCtaRow, InfoHero, ScrollSpy, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import QuickDocks from '@/components/molecules/QuickDocks';
import {
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PRICE_LABEL,
  PRICE_NOTE,
  PRICE_TAG,
  SERVICES,
  serviceWhatsappUrl,
  type Service,
} from '@/data/services';
import { ACCENT_STYLES } from '@/data/ecosystem';
import { CISZU_NETWORK } from '@/config/site';
import { getDict, parseLang, type Dict } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Ciszu Network | SERVICIOS',
  description:
    'Catálogo de servicios de Ciszu Network: branding, ciberseguridad, currículums, Discord, diseño gráfico, eventos y torneos, full testing, ilustración, Minecraft, ofimática, edición de imagen y video, y social media. Precios negociables.',
  openGraph: {
    title: 'Servicios | Ciszu Network',
    description:
      'Diseño, seguridad, contenido y tecnología para tu negocio. Catálogo completo con flyers y precios negociables.',
    type: 'website',
  },
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const SECTIONS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'precios', label: 'Precios' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'contacto', label: 'Contacto' },
];

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    accent: 'pink' as const,
    title: 'Diseño y contenido',
    body: 'Branding, diseño gráfico, ilustración, foto y video con acabado profesional.',
  },
  {
    icon: ShieldCheck,
    accent: 'green' as const,
    title: 'Seguridad y QA',
    body: 'Auditorías de ciberseguridad, full testing y control de calidad.',
  },
  {
    icon: Globe,
    accent: 'cyan' as const,
    title: 'Presencia digital',
    body: 'Discord, redes sociales, publishing marketing y documentación.',
  },
  {
    icon: Rocket,
    accent: 'brand' as const,
    title: 'Experiencias',
    body: 'Servidores de Minecraft, eventos y torneos de videojuegos online y presenciales.',
  },
];

const WORK_PROCESS = [
  { title: 'Cuéntanos tu idea', body: 'Escríbenos por WhatsApp o el formulario de contacto con lo que necesitas.' },
  { title: 'Cotización negociable', body: 'Definimos juntos el alcance, los tiempos y un precio que se ajuste a tu presupuesto.' },
  { title: 'Producción', body: 'Ejecutamos el servicio con avances y revisiones hasta la aprobación final.' },
  { title: 'Entrega', body: 'Recibes los entregables en los formatos acordados, listos para usar.' },
];

const HEADING_ACCENTS = {
  brand: { text: 'text-brand-light', bg: 'bg-brand/10', bar: 'bg-brand-light' },
  pink: { text: 'text-neon-pink', bg: 'bg-neon-pink/10', bar: 'bg-neon-pink' },
  green: { text: 'text-neon-green', bg: 'bg-neon-green/10', bar: 'bg-neon-green' },
  cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', bar: 'bg-neon-cyan' },
} as const;

function SectionHeading({
  icon,
  title,
  kicker,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  kicker?: string;
  accent: keyof typeof HEADING_ACCENTS;
}) {
  const styles = HEADING_ACCENTS[accent];
  return (
    <div className="mb-6 flex items-start gap-4">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${styles.bg} ${styles.text}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-header text-xl font-black uppercase tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {kicker ? (
          <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.3em] ${styles.text} opacity-80`}>
            {kicker}
          </p>
        ) : null}
        <span className={`mt-3 block h-0.5 w-14 rounded-full ${styles.bar}`} />
      </div>
    </div>
  );
}

function ServiceCard({ service, t }: { service: Service; t: Dict }) {
  const accent = ACCENT_STYLES[service.accent];
  const priceColor =
    service.accent === 'brand'
      ? 'border-brand/40 bg-brand/15 text-brand-light'
      : service.accent === 'pink'
        ? 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink'
        : service.accent === 'green'
          ? 'border-neon-green/40 bg-neon-green/15 text-neon-green'
          : service.accent === 'cyan'
            ? 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan'
            : service.accent === 'purple'
              ? 'border-neon-purple/40 bg-neon-purple/15 text-neon-purple'
              : 'border-[#5865F2]/40 bg-[#5865F2]/15 text-[#8b95ff]';

  return (
    <Link
      href={`/services/${service.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 transition-all duration-500 hover:-translate-y-1.5 ${accent.border} ${accent.glow}`}
    >
      <div className="relative overflow-hidden">
        <Image
          src={service.flyer}
          alt={service.flyerAlt}
          width={FLYER_WIDTH}
          height={FLYER_HEIGHT}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur ${priceColor}`}>
          {PRICE_LABEL}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <service.icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className={`truncate font-header text-lg font-black ${accent.text}`}>{service.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{service.tagline}</p>
          </div>
        </div>

        <p className="flex-grow text-xs leading-relaxed text-gray-400">{service.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {service.includes.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500"
            >
              {item}
            </span>
          ))}
        </div>

        <span className={`mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-2.5 ${accent.text}`}>
          {t.servicesPage.viewService} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default async function ServicesPage() {
  const t = getDict(parseLang((await cookies()).get('ciszu_lang')?.value));
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <ScrollSpy items={SECTIONS} />

      <div className="relative mx-auto max-w-screen-xl space-y-16">
        <section id="hero" className="scroll-mt-28">
          <InfoHero
            icon="support"
            title="Servicios"
            kicker="Catálogo oficial · Ciszu Network"
            subtitle="Diseño, seguridad, contenido y tecnología para tu negocio o proyecto. Todos los servicios incluyen flyer oficial, acompañamiento directo y precios negociables."
            theme={THEME}
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HIGHLIGHTS.map((item) => {
              const accent = ACCENT_STYLES[item.accent];
              return (
                <article
                  key={item.title}
                  className={`group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 ${accent.border}`}
                >
                  <item.icon className={`mb-3 h-6 w-6 ${accent.text} transition-transform duration-300 group-hover:scale-110`} />
                  <h3 className="font-header text-sm font-black uppercase text-white">{item.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="catalogo" className="scroll-mt-28">
          <SectionHeading
            icon={<Sparkles className="h-5 w-5" />}
            title={t.servicesPage.showcaseTitle}
            kicker={`${SERVICES.length} servicios · Flyers oficiales`}
            accent="pink"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.slug} service={service} t={t} />
            ))}
          </div>
        </section>

        <section id="precios" className="scroll-mt-28">
          <SectionHeading
            icon={<Wallet className="h-5 w-5" />}
            title="Precios"
            kicker="Negociables · Ajustados a tu proyecto"
            accent="green"
          />
          <div className="rounded-3xl border border-neon-green/25 bg-neon-green/5 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm leading-relaxed text-white/70">{PRICE_NOTE}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    'Cotización sin compromiso',
                    'Pago por etapas para proyectos grandes',
                    'Descuentos por paquetes de servicios',
                    'Presupuesto según alcance y tiempos',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-neon-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-neon-green/30 bg-black/30 px-8 py-6 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green">
                  Precio
                </span>
                <span className="font-header text-3xl font-black text-white">{PRICE_LABEL}</span>
                <span className="rounded-full border border-neon-green/40 bg-neon-green/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-neon-green">
                  {PRICE_TAG}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="proceso" className="scroll-mt-28">
          <SectionHeading
            icon={<Clock className="h-5 w-5" />}
            title={t.servicesPage.howWeWork}
            kicker="De la idea a la entrega"
            accent="cyan"
          />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {WORK_PROCESS.map((step, index) => (
              <li
                key={step.title}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/40"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-neon-cyan/30 bg-neon-cyan/10 font-header text-sm font-black text-neon-cyan">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-header text-sm font-black uppercase text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contacto" className="scroll-mt-28">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center md:p-12">
            <MessageSquare className="mx-auto mb-5 h-10 w-10 text-brand-light" />
            <h2 className="bg-gradient-to-r from-brand-light via-brand-accent to-neon-cyan bg-clip-text font-header text-3xl font-black uppercase tracking-tighter text-transparent md:text-4xl">
              {t.servicesPage.readyTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
              Cuéntanos qué necesitas y te respondemos con una propuesta a tu medida. Atención directa de {CISZU_NETWORK.name}.
            </p>
            <InfoCtaRow
              theme={THEME}
              actions={[
                {
                  label: 'Escribir por WhatsApp',
                  href: serviceWhatsappUrl(SERVICES[0]),
                  icon: 'support',
                  external: true,
                },
                { label: 'Ir a contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
                { label: 'Ver proyectos', href: '/projects', icon: 'rocket', variant: 'ghost' },
              ]}
            />
          </div>
        </section>
      </div>

      <QuickDocks />
    </div>
  );
}
