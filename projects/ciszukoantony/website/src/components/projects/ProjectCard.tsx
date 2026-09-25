'use client';

import Link from 'next/link';
import { Icon, SmartImage } from '@ciszu/ui';
import type { Project } from '@/data/projects';

/**
 * Tarjeta de proyecto compartida por /projects y /portfolio:
 * preview, categorías, stack, descripción y enlaces.
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col rounded-3xl bg-white/5 border border-white/10 hover:border-neon-blue/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-video bg-gradient-to-br from-white/5 via-transparent to-neon-blue/5 overflow-hidden"
      >
        <SmartImage
          src={project.preview}
          alt={project.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[9px] font-black uppercase tracking-widest text-neon-green">
          {project.status}
        </span>
      </Link>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue shrink-0">
            <Icon name={project.icon} size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-header font-bold text-white truncate group-hover:text-neon-blue transition-colors">
              {project.name}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue/80 truncate">
              {project.tagline}
            </p>
          </div>
        </div>

        <p className="text-sm text-white/60 leading-relaxed flex-1 mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/50 uppercase tracking-wider"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-white/5">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-neon-blue hover:text-white transition-colors"
          >
            Ver proyecto <Icon name="chevronRight" size={14} />
          </Link>
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
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-neon-blue hover:border-neon-blue/50 transition-all"
                >
                  {link.icon ? <Icon name={link.icon} size={15} /> : <Icon name="external" size={15} />}
                </a>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}
