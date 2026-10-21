'use client';

/**
 * EcosystemSection — sección homogénea "Project provided by CiszuNetwork"
 * para reutilizar en las 4 webs. Muestra:
 *  - isotipo de Ciszu Network
 *  - título + descripción
 *  - botones: visitar Ciszu Network y ver proyectos
 */
import { assetResolver } from '@ciszunetwork/cdn';
import Image from 'next/image';

const CISZU_LOGO = assetResolver.resolve(
  'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg'
);

export interface EcosystemSectionProps {
  title?: string;
  description?: string;
  visitHref?: string;
  projectsHref?: string;
  visitLabel?: string;
  projectsLabel?: string;
  /** Idioma forzado; si falta se detecta del <html lang> / localStorage. */
  lang?: 'es' | 'en';
  /** 'help' cambia el segundo botón a "Ayuda/Help" (webs sin /projects). */
  variant?: 'projects' | 'help';
}

export function EcosystemSection({
  title,
  description,
  visitHref = 'https://ciszunetwork.vercel.app',
  projectsHref = '/projects',
  visitLabel,
  projectsLabel,
  lang,
  variant = 'projects',
}: EcosystemSectionProps) {
  // Detección de idioma del sitio (los toggles de las webs actualizan <html lang>).
  const detected =
    typeof document === 'undefined'
      ? 'es'
      : document.documentElement.lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null) || 'es';
  const L: 'es' | 'en' = (lang ?? detected).toLowerCase().startsWith('en') ? 'en' : 'es';
  const TXT =
    L === 'en'
      ? {
          title: 'Project provided by CiszuNetwork',
          description: 'This project is part of the Ciszu Network ecosystem. Discover more projects and tools built by Ciszuko Antony.',
          visit: 'Visit CiszuNetwork',
          projects: 'View All Projects',
          help: 'Help & info',
        }
      : {
          title: 'Proyecto promovido por CiszuNetwork',
          description: 'Este proyecto forma parte del ecosistema de Ciszu Network. Descubre más proyectos y herramientas creados por Ciszuko Antony.',
          visit: 'Visitar CiszuNetwork',
          projects: 'Ver todos los proyectos',
          help: 'Ayuda e información',
        };
  const finalTitle = title ?? TXT.title;
  const finalDescription = description ?? TXT.description;
  const finalVisitLabel = visitLabel ?? TXT.visit;
  const finalProjectsLabel = projectsLabel ?? (variant === 'help' ? TXT.help : TXT.projects);
  return (
    <section className="relative py-16 border-t border-white/5">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <div className="soft-card relative max-w-4xl mx-auto border border-white/10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-accent/10 rounded-full blur-[80px]" />
          <div className="relative p-8 md:p-12 flex flex-col items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(35,63,146,0.35)]">
              <Image
                src={CISZU_LOGO}
                alt="Ciszu Network"
                width={40}
                height={40}
                className="w-10 h-10 md:w-12 md:h-12 text-white"
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{finalTitle}</h2>
              <p className="text-muted max-w-xl mx-auto text-sm md:text-base">{finalDescription}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href={visitHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand to-brand-light text-white font-bold rounded-xl shadow-lg shadow-brand/30 hover:shadow-2xl hover:shadow-brand/40 hover:scale-105 transition-all"
              >
                {finalVisitLabel}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href={projectsHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 hover:scale-105 transition-all"
              >
                {finalProjectsLabel}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EcosystemSection;
