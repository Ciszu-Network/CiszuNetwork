import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Mail,
  MessageCircle,
  Package,
  Sparkles,
} from 'lucide-react';
import { InfoCtaRow, InfoSteps, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import QuickDocks from '@/components/molecules/QuickDocks';
import { ACCENT_STYLES, type EcosystemAccent } from '@/data/ecosystem';
import {
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PRICE_LABEL,
  PRICE_NOTE,
  PRICE_TAG,
  SERVICES,
  SERVICE_SLUGS,
  getService,
  serviceWhatsappUrl,
} from '@/data/services';
import { CISZU_NETWORK } from '@/config/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    return { title: 'Servicio no encontrado | Ciszu Network' };
  }
  return {
    title: `${service.name} | Servicios | Ciszu Network`,
    description: service.description,
    openGraph: {
      title: `${service.name} | Servicios | Ciszu Network`,
      description: service.description,
      type: 'website',
      images: [
        {
          url: service.flyer,
          width: FLYER_WIDTH,
          height: FLYER_HEIGHT,
          alt: service.flyerAlt,
        },
      ],
    },
  };
}

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const BADGE_ACCENTS: Record<EcosystemAccent, string> = {
  brand: 'border-brand/40 bg-brand/15 text-brand-light',
  cyan: 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan',
  pink: 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink',
  purple: 'border-neon-purple/40 bg-neon-purple/15 text-neon-purple',
  green: 'border-neon-green/40 bg-neon-green/15 text-neon-green',
  discord: 'border-[#5865F2]/40 bg-[#5865F2]/15 text-[#8b95ff]',
};

const HEADING_ACCENTS: Record<EcosystemAccent, { text: string; bg: string; bar: string }> = {
  brand: { text: 'text-brand-light', bg: 'bg-brand/10', bar: 'bg-brand-light' },
  cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', bar: 'bg-neon-cyan' },
  pink: { text: 'text-neon-pink', bg: 'bg-neon-pink/10', bar: 'bg-neon-pink' },
  purple: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', bar: 'bg-neon-purple' },
  green: { text: 'text-neon-green', bg: 'bg-neon-green/10', bar: 'bg-neon-green' },
  discord: { text: 'text-[#8b95ff]', bg: 'bg-[#5865F2]/10', bar: 'bg-[#5865F2]' },
};

function SectionHeading({
  icon,
  title,
  kicker,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  kicker: string;
  accent: EcosystemAccent;
}) {
  const ui = HEADING_ACCENTS[accent];
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${ui.bg} ${ui.text}`}>
        {icon}
      </span>
      <div>
        <h2 className="font-header text-xl font-black uppercase tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.3em] ${ui.text} opacity-80`}>
          {kicker}
        </p>
        <span className={`mt-3 block h-0.5 w-14 rounded-full ${ui.bar}`} />
      </div>
    </div>
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const accent = ACCENT_STYLES[service.accent];
  const badge = BADGE_ACCENTS[service.accent];
  const whatsapp = serviceWhatsappUrl(service);
  const index = SERVICES.findIndex((item) => item.slug === service.slug);
  const others = [1, 2, 3].map((offset) => SERVICES[(index + offset) % SERVICES.length]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.name,
    provider: {
      '@type': 'Organization',
      name: CISZU_NETWORK.name,
      url: 'https://ciszunetwork.vercel.app',
      telephone: CISZU_NETWORK.phone,
    },
    areaServed: 'Worldwide',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        description: `${PRICE_LABEL} (${PRICE_TAG})`,
      },
    },
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative mx-auto max-w-screen-xl space-y-16">
        <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="transition-colors hover:text-brand-light">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/services" className="transition-colors hover:text-brand-light">
            Servicios
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className={accent.text}>{service.name}</span>
        </nav>

        <section className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-2 lg:order-1">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${badge}`}>
              Servicio oficial
            </span>
            <h1 className={`mt-5 font-header text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl ${accent.text}`}>
              {service.name}
            </h1>
            <p className="mt-3 text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
              {service.tagline}
            </p>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-300">
              {service.description}
            </p>

            {service.programs.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {service.programs.map((program) => (
                  <span
                    key={program}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {program}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent.tile} text-white`}>
                  <Clock className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Precio</p>
                  <p className="flex items-center gap-2 font-header text-xl font-black text-white">
                    {PRICE_LABEL}
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${badge}`}>
                      {PRICE_TAG}
                    </span>
                  </p>
                </div>
              </div>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-3 text-sm font-bold text-[#25D366] transition-all hover:bg-[#25D366] hover:text-black"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-gray-500">{PRICE_NOTE}</p>
          </div>

          <div className="order-1 lg:order-2">
            <div className={`group relative overflow-hidden rounded-[2rem] border-2 border-white/10 transition-all duration-500 hover:-translate-y-1 ${accent.border}`}>
              <Image
                src={service.flyer}
                alt={service.flyerAlt}
                width={FLYER_WIDTH}
                height={FLYER_HEIGHT}
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-auto w-full"
              />
              <span className={`absolute left-5 top-5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur ${badge}`}>
                {PRICE_LABEL} · {PRICE_TAG}
              </span>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Qué incluye"
            kicker="Alcance del servicio"
            accent={service.accent}
          />

          <ul className="grid gap-3 sm:grid-cols-2">
            {service.includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accent.text}`} />
                <span className="text-sm leading-relaxed text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading
            icon={<Layers className="h-5 w-5" />}
            title="Proceso"
            kicker="Paso a paso"
            accent={service.accent}
          />
          <InfoSteps steps={service.process} theme={THEME} />
        </section>

        <section>
          <SectionHeading
            icon={<Package className="h-5 w-5" />}
            title="Entregables"
            kicker="Lo que recibes"
            accent={service.accent}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.deliverables.map((item, itemIndex) => (
              <article
                key={item}
                className={`group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 ${accent.border}`}
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 font-header text-xs font-black text-white/60">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-white/70">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            icon={<Sparkles className="h-5 w-5" />}
            title="Otros servicios"
            kicker="Sigue explorando el catálogo"
            accent={service.accent}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => {
              const otherAccent = ACCENT_STYLES[other.accent];
              return (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className={`group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 ${otherAccent.border}`}
                >
                  <span className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={other.flyer}
                      alt={other.flyerAlt}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate font-header text-base font-black ${otherAccent.text}`}>
                      {other.name}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {other.tagline}
                    </span>
                    <span className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 transition-all group-hover:gap-2 group-hover:text-white">
                      Ver servicio <ChevronRight className="h-3 w-3" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center md:p-12">
          <h2 className="bg-gradient-to-r from-brand-light via-brand-accent to-neon-cyan bg-clip-text font-header text-3xl font-black uppercase tracking-tighter text-transparent md:text-4xl">
            Solicita {service.name}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
            Cuéntanos tu caso y te cotizamos sin compromiso. Precio {PRICE_LABEL.toLowerCase()} y {PRICE_TAG.toLowerCase()}:
            se ajusta al alcance y a los tiempos de tu proyecto.
          </p>
          <InfoCtaRow
            theme={THEME}
            actions={[
              { label: 'Escribir por WhatsApp', href: whatsapp, icon: 'support', external: true },
              { label: 'Ver todo el catálogo', href: '/services', icon: 'star', variant: 'ghost' },
              { label: 'Ir a contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
            ]}
          />
          <p className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            <Mail className="h-3.5 w-3.5" />
            {CISZU_NETWORK.email} · {CISZU_NETWORK.phone}
          </p>
        </section>
      </div>

      <QuickDocks />
    </div>
  );
}
