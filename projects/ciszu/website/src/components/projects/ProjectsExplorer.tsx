'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import { Icon, Modal, captureEvent } from '@ciszu/ui';
import ProjectCard from '@/components/projects/ProjectCard';
import { PROJECTS, PROJECT_CATEGORIES, getProject, type Project } from '@/data/projects';

type SortKey = 'recientes' | 'antiguos' | 'az' | 'za';

const SORT_OPTIONS: { id: SortKey; label: string; icon: string }[] = [
  { id: 'recientes', label: 'Más recientes', icon: 'clock' },
  { id: 'antiguos', label: 'Más antiguos', icon: 'history' },
  { id: 'az', label: 'Nombre A-Z', icon: 'signal' },
  { id: 'za', label: 'Nombre Z-A', icon: 'signal' },
];

/** Texto de búsqueda de un proyecto: nombre, tagline, stack, categorías y keywords. */
function searchableText(project: Project): string {
  return [
    project.name,
    project.shortName,
    project.tagline,
    project.description,
    project.longDescription,
    project.owner,
    project.status,
    ...project.categories,
    ...project.stack,
    ...project.highlights.map((item) => item.label),
    ...project.keywords,
  ]
    .join(' ')
    .toLowerCase();
}

export default function ProjectsExplorer() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('Todos');
  const [sort, setSort] = useState<SortKey>('recientes');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? getProject(selectedId) : undefined;

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    const filtered = PROJECTS.filter((project) => {
      const matchCategory = category === 'Todos' || project.categories.includes(category);
      const matchText = text.length === 0 || searchableText(project).includes(text);
      return matchCategory && matchText;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'antiguos':
          return a.launched.localeCompare(b.launched);
        case 'recientes':
        default:
          return b.launched.localeCompare(a.launched);
      }
    });
  }, [query, category, sort]);

  const openProject = (project: Project) => {
    setSelectedId(project.id);
    captureEvent('projects_open_modal', { project: project.id });
  };

  return (
    <section aria-label="Explorador de proyectos">
      {/* Panel de control: búsqueda + filtros + orden. */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Búsqueda */}
          <label className="relative block">
            <span className="sr-only">Buscar proyectos</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-light">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, tecnología, categoría o palabra clave…"
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-brand-light/60 focus:shadow-[0_0_25px_rgba(89,180,255,0.15)]"
            />
          </label>

          {/* Orden ascendente / descendente */}
          <div className="flex items-center gap-3">
            <span className="inline-flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
              <Icon name="signal" size={14} />
              Orden
            </span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => {
                const active = option.id === sort;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSort(option.id);
                      captureEvent('projects_sort', { sort: option.id });
                    }}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      active
                        ? 'border-brand-light/60 bg-brand/20 text-brand-light'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <Icon name={option.icon} size={12} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filtros por categoría con icono. */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
            <Icon name="target" size={14} />
            Categorías
          </div>
          <div className="flex flex-wrap gap-2">
            {['Todos', ...PROJECT_CATEGORIES].map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    captureEvent('projects_filter', { category: item });
                  }}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    active
                      ? 'border-brand-light/60 bg-brand/20 text-brand-light shadow-[0_0_18px_rgba(89,180,255,0.2)]'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Icon name={item === 'Todos' ? 'globe' : 'flag'} size={12} />
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
          <Icon name="info" size={13} />
          Mostrando {results.length} de {PROJECTS.length} proyectos del ecosistema
        </p>
      </div>

      {/* Resultados: cada proyecto es un mundo propio. */}
      {results.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
          {results.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={openProject} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
            <Icon name="search" size={24} />
          </span>
          <h3 className="font-header text-lg font-bold text-white">Sin resultados</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            No hay proyectos que coincidan con “{query}” en la categoría “{category}”. Prueba con otra
            palabra o limpia los filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('Todos');
            }}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-5 py-2.5 text-xs font-bold text-brand-light transition-all hover:bg-brand/20"
          >
            <Icon name="refresh" size={14} />
            Limpiar filtros
          </button>
        </div>
      )}

      <ProjectModal project={selected} open={selected !== undefined} onOpenChange={(open) => !open && setSelectedId(null)} />
    </section>
  );
}

/** Modal personalizado de cada proyecto: ficha completa + botón para ir al proyecto. */
function ProjectModal({
  project,
  open,
  onOpenChange,
}: {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!project) {
    return null;
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={project.name}
      description={project.tagline}
      size="lg"
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        {/* Cabecera con la identidad real del proyecto. */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 ${project.accent.border} bg-gradient-to-br ${project.accent.surface}`}
        >
          <div className="flex items-center gap-5">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border ${project.accent.chipBorder} ${project.accent.chipBg}`}>
              <Image
                src={assetResolver.resolve(project.logo)}
                alt={`Logo de ${project.name}`}
                width={64}
                height={64}
                className="h-14 w-14 object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                  {project.status}
                </span>
                {project.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${project.accent.chipBg} ${project.accent.chipBorder} ${project.accent.text}`}
                  >
                    <Icon name="flag" size={10} />
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/65">{project.longDescription}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas completas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {project.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className={`mb-2 inline-flex ${project.accent.text}`}>
                <Icon name={stat.icon} size={18} />
              </span>
              <p className="font-header text-lg font-black leading-none text-white">{stat.value}</p>
              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Qué incluye */}
        <div>
          <h3 className={`mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${project.accent.text}`}>
            <Icon name="star" size={13} />
            Qué incluye
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {project.features.map((feature) => (
              <div key={feature.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className={`mt-0.5 inline-flex shrink-0 ${project.accent.text}`}>
                  <Icon name={feature.icon} size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack tecnológico */}
        <div>
          <h3 className={`mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${project.accent.text}`}>
            <Icon name="terminal" size={13} />
            Stack tecnológico
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75 ${project.accent.chipBg} ${project.accent.chipBorder}`}
              >
                <Icon name="check" size={11} />
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Ficha: propietario y comunidad (datos pedidos en el índice). */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-2">
            <Icon name="user" size={14} />
            Propietario:
            <strong className="font-bold text-white">{project.owner}</strong>
          </span>
          {project.official ? (
            <a
              href={project.official}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Icon name="globe" size={14} />
              Página oficial
            </a>
          ) : null}
          {project.community ? (
            <a
              href={project.community}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Icon name="discord" size={14} />
              Comunidad
            </a>
          ) : null}
        </div>

        {/* Acciones: botón principal al proyecto + enlaces externos. */}
        <div className="space-y-3 border-t border-white/10 pt-5">
          <Link
            href={`/projects/${project.id}`}
            onClick={() => captureEvent('projects_go_detail', { project: project.id })}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-125 ${project.accent.solid}`}
          >
            <Icon name="rocket" size={16} />
            Ir al proyecto
          </Link>
          <div className="flex flex-wrap gap-2">
            {project.actions
              .filter((action) => action.external && action.href.startsWith('http'))
              .map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-white/40 hover:text-white"
                >
                  <Icon name={action.icon} size={13} />
                  {action.label}
                </a>
              ))}
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              <Icon name="menu" size={13} />
              Todos los proyectos
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
