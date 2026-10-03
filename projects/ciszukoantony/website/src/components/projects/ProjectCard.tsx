'use client';

import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import CdnImage from '@/components/shared/CdnImage';
import type { Project } from '@/data/projects';

/** Imagen del proyecto: CDN (`projects/`, `shared/`) o pública local (`/...`). */
function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (src.startsWith('projects/') || src.startsWith('shared/')) {
    return <CdnImage src={src} alt={alt} className={className} />;
  }
  // Assets locales de public/ (p. ej. portadas del musicboard, que no están en el CDN).
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

/**
 * Tarjeta de proyecto compartida por /projects y /portfolio.
 *
 * Cada proyecto es un mundo: banner con su isotipo o portada real, fondo con
 * su gradiente de marca, chips con icono, mini-estadísticas y acciones.
 * Si recibe `onOpen`, la card abre el modal del explorador; si no, enlaza
 * directamente a `/projects/[slug]`.
 */
export default function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen?: (project: Project) => void;
}) {
  const openButton = onOpen ? (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:brightness-150 ${project.accent.chipBg} ${project.accent.chipBorder}`}
    >
      <Icon name="search" size={13} />
      Explorar
    </button>
  ) : (
    <Link
      href={`/projects/${project.slug}`}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:brightness-150 ${project.accent.chipBg} ${project.accent.chipBorder}`}
    >
      <Icon name="chevronRight" size={13} />
      Ver proyecto
    </Link>
  );

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border bg-[#05060c]/80 transition-all duration-500 hover:-translate-y-2 ${project.accent.border} ${project.accent.glow}`}
    >
      {/* Fondo único: gradiente de la marca + retícula del acento. */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.accent.surface}`} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `radial-gradient(${project.accent.hex} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
      />

      {/* Banner con imagen real (isotipo o portada). */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${project.accent.gradient}`}>
        <div className="absolute inset-0 bg-black/25" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 14px)',
          }}
        />
        <ProjectImage
          src={project.preview}
          alt={`Identidad de ${project.name}`}
          className="relative mx-auto mt-6 h-32 w-auto object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition-transform duration-700 group-hover:scale-110"
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
          {project.status}
        </span>
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm">
          <Icon name="flag" size={11} />
          {project.categories[0]}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-7">
        <h2 className="font-header text-2xl font-black text-white">{project.name}</h2>
        <p className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${project.accent.text}`}>
          {project.tagline}
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.highlights.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/70 ${project.accent.chipBg} ${project.accent.chipBorder}`}
            >
              <Icon name={item.icon} size={12} />
              {item.label}
            </span>
          ))}
        </div>

        <div className={`mt-5 grid grid-cols-2 gap-2 rounded-2xl border p-3 ${project.accent.chipBg} ${project.accent.chipBorder}`}>
          {project.stats.slice(0, 2).map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className={project.accent.text}>
                <Icon name={stat.icon} size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-header text-sm font-black leading-none text-white">{stat.value}</p>
                <p className="mt-0.5 truncate text-[8px] uppercase tracking-wider text-white/45">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          {openButton}
          <div className="flex items-center gap-2">
            {project.links
              .filter((link) => link.external)
              .slice(0, 3)
              .map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-white/70 transition-all hover:text-white ${project.accent.chipBg} ${project.accent.chipBorder}`}
                >
                  <Icon name={link.icon ?? 'external'} size={15} />
                </a>
              ))}
          </div>
        </div>
      </div>

      {/* Capa clicable: abre el modal cuando el explorador la usa. */}
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(project)}
          aria-label={`Abrir ficha de ${project.name}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        />
      ) : null}
    </article>
  );
}
