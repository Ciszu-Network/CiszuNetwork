'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { captureEvent, trackEvent } from '@ciszu/ui';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { ACCENT_STYLES } from '@/data/ecosystem';
import {
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PRICE_LABEL,
  PRICE_NOTE,
  PRICE_TAG,
  SERVICES,
  SERVICES_WHATSAPP_URL,
} from '@/data/services';

function track(event: string, params?: Record<string, unknown>) {
  trackEvent(event, params);
  captureEvent(event, params);
}

const BADGE_ACCENTS = {
  brand: 'border-brand/40 bg-brand/15 text-brand-light',
  cyan: 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan',
  pink: 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink',
  purple: 'border-neon-purple/40 bg-neon-purple/15 text-neon-purple',
  green: 'border-neon-green/40 bg-neon-green/15 text-neon-green',
  discord: 'border-[#5865F2]/40 bg-[#5865F2]/15 text-[#8b95ff]',
} as const;

export function ServicesShowcase() {
  return (
    <section id="catalogo-servicios" className="scroll-mt-24 border-t border-white/5 py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-in-up">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-neon-pink drop-shadow-neon-pink" />
              <h2 className="bg-gradient-to-r from-neon-pink via-brand-accent to-neon-cyan bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-5xl">
                Catálogo de Servicios
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-xs uppercase tracking-widest text-gray-400">
              {SERVICES.length} servicios con flyer oficial · diseño, seguridad, contenido y tecnología
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up">
          <div className="relative -mx-4 px-4">
            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
              {SERVICES.map((service) => {
                const accent = ACCENT_STYLES[service.accent];
                const badge = BADGE_ACCENTS[service.accent];
                return (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    onClick={() => track('home_service_flyer_click', { service: service.slug })}
                    className={`group flex w-[250px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 transition-all duration-500 hover:-translate-y-2 sm:w-[270px] ${accent.border} ${accent.glow}`}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={service.flyer}
                        alt={service.flyerAlt}
                        width={FLYER_WIDTH}
                        height={FLYER_HEIGHT}
                        sizes="270px"
                        className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <span
                        className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest backdrop-blur ${badge}`}
                      >
                        {PRICE_LABEL}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="block font-header text-lg font-black leading-tight text-white">
                          {service.name}
                        </span>
                        <span className="mt-1 block max-h-0 overflow-hidden text-[11px] leading-relaxed text-gray-300 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                          {service.description}
                        </span>
                        <span className={`mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${accent.text}`}>
                          Ver servicio
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent.tile} text-white transition-transform duration-300 group-hover:scale-110`}
                      >
                        <service.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate text-[10px] font-black uppercase tracking-widest ${accent.text}`}>
                          {service.tagline}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Precio {PRICE_TAG.toLowerCase()}
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}

              <Link
                href="/services"
                onClick={() => track('home_service_flyer_click', { service: 'all' })}
                className="group flex w-[250px] shrink-0 snap-start flex-col items-center justify-center gap-5 rounded-[1.75rem] border-2 border-dashed border-brand/40 bg-brand/5 p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-brand-light/60 sm:w-[270px]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/30 bg-brand/15 text-brand-light transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight className="h-8 w-8" />
                </span>
                <span className="font-header text-xl font-black uppercase tracking-tight text-white">
                  Ver todos los servicios
                </span>
                <span className="text-xs leading-relaxed text-gray-400">
                  Catálogo completo con flyers, proceso, entregables y precios negociables.
                </span>
              </Link>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={120}>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Precios {PRICE_LABEL.toLowerCase()} y {PRICE_TAG.toLowerCase()} · {PRICE_NOTE}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              onClick={() => track('home_cta_click', { target: 'services_catalog' })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-brand/50 bg-brand/20 px-8 py-4 font-header text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand"
            >
              Explorar el catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SERVICES_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('home_cta_click', { target: 'services_whatsapp' })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#25D366]/40 bg-[#25D366]/10 px-8 py-4 font-header text-sm font-black uppercase tracking-widest text-[#25D366] transition-all hover:scale-105 hover:bg-[#25D366] hover:text-black"
            >
              <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default ServicesShowcase;
