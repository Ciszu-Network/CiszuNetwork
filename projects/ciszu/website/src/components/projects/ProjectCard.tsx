'use client';

import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { useDict } from '@/lib/useDict';
import { Icon } from '@ciszu/ui';
import type { Project } from '@/data/projects';

/**
 * Card única por proyecto para `/projects`.
 *
 * Cada proyecto tiene su propio "mundo": fondo con su gradiente y color,
 * banner con su isotipo/logotipo real (nada de iconos genéricos), tagline,
 * chips con icono, mini-estadísticas y dos acciones (abrir el modal del
 * proyecto o visitar su página oficial).
 *
 * La card completa abre el modal; los enlaces externos viven por encima
 * (z-20) para no robarse el clic.
 */
export default function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  const t = useDict();
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border ${project.accent.border} bg-[#05060c]/80 transition-all duration-500 hover:-translate-y-2 ${project.accent.glow}`}
    >
      {/* Fondo único: gradiente del color del logo + retícula sutil del acento. */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.accent.surface}`} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `radial-gradient(${project.accent.hex} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
      />

      {/* Banner superior: banda con el gradiente de la marca y el isotipo real. */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${project.accent.gradient}`}>
        <div className="absolute inset-0 bg-black/25" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 14px)',
          }}
        />
        <Image
          src={assetResolver.resolve(project.logo)}
          alt={`Isotipo oficial de ${project.name}`}
          width={220}
          height={220}
          className="relative mx-auto mt-6 h-32 w-auto object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition-transform duration-700 group-hover:scale-110"
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
          {project.status}
        </span>
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm">
          <Icon name="calendar" size={11} />
          Desde {project.launched}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-7">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${project.accent.text}`}>
          {project.kicker}
        </p>
        <h2 className="mt-2 font-header text-2xl font-black text-white">{project.name}</h2>
        <p className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${project.accent.text}`}>
          {project.tagline}
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">{project.description}</p>

        {/* Chips del proyecto con icono real. */}
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

        {/* Mini-estadísticas (2 por card para no saturar). */}
        <div className={`mt-5 grid grid-cols-2 gap-2 rounded-2xl border ${project.accent.chipBorder} ${project.accent.chipBg} p-3`}>
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
          <button
            type="button"
            onClick={() => onOpen(project)}
            className={`relative z-20 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:brightness-150 ${project.accent.chipBg} ${project.accent.chipBorder}`}
          >
            <Icon name="search" size={13} />
            {t.projectsPage.exploreProject}
          </button>
          <div className="relative z-20 flex items-center gap-2">
            {project.official ? (
              <a
                href={project.official}
                target="_blank"
                rel="noopener noreferrer"
                title={`Página oficial de ${project.name}`}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-white/70 transition-all hover:text-white ${project.accent.chipBg} ${project.accent.chipBorder}`}
              >
                <Icon name="globe" size={15} />
              </a>
            ) : null}
            {project.community ? (
              <a
                href={project.community}
                target="_blank"
                rel="noopener noreferrer"
                title={`Comunidad de ${project.name}`}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-white/70 transition-all hover:text-white ${project.accent.chipBg} ${project.accent.chipBorder}`}
              >
                <Icon name="discord" size={15} />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Capa clicable: toda la card abre el modal personalizado. */}
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Abrir ficha de ${project.name}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      />
    </article>
  );
}
