import Link from "next/link";
import type { ReactNode } from "react";

export type HeroProps = {
  title: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function HeroBlock({
  title,
  tagline,
  description,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(35,63,146,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light via-brand to-neon-cyan bg-clip-text text-transparent mb-4">
          {title}
        </h1>
        <p className="text-brand font-bold text-xs uppercase tracking-[0.4em] mb-4">{tagline}</p>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-accent">{description}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={ctaHref} className="inline-flex items-center gap-2 px-8 py-4 bg-brand/10 text-brand font-bold rounded-xl border-2 border-brand/50 hover:bg-brand hover:text-white hover:scale-105 transition-all text-lg font-header">
            {ctaLabel}
          </Link>
          <Link href={secondaryHref} className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white hover:text-black hover:scale-105 transition-all text-lg font-header">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export type StatsProps = {
  title: string;
  stats: { value: string; label: string }[];
};

export function StatsBlock({ title, stats }: StatsProps) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="container mx-auto px-4">
        {title ? (
          <h2 className="text-3xl md:text-4xl font-header font-black text-center mb-12 text-white uppercase tracking-tighter">
            {title}
          </h2>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand/40 hover:shadow-neon-blue transition-all"
            >
              <div className="text-4xl md:text-5xl font-header font-black text-brand-light mb-2">{s.value}</div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type ProjectsProps = {
  title: string;
  projects: { name: string; description: string }[];
};

export function ProjectsBlock({ title, projects }: ProjectsProps) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="container mx-auto px-4">
        {title ? (
          <h2 className="text-3xl md:text-4xl font-header font-black text-center mb-12 text-white uppercase tracking-tighter">
            {title}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {projects.map((p, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:shadow-neon-cyan transition-all"
            >
              <div className="text-lg font-header font-bold text-brand-light mb-2">{p.name}</div>
              <div className="text-gray-400 text-sm">{p.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type CtaProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

export function CtaBlock({ title, description, buttonLabel, buttonHref }: CtaProps) {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-[2rem] bg-gradient-to-r from-brand/20 via-brand-dark/10 to-transparent border border-brand/30">
          <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-white via-brand-light to-brand bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            {title}
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm uppercase tracking-widest">{description}</p>
          <Link href={buttonHref} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-header font-bold rounded-xl hover:bg-gray-200 hover:scale-105 transition-all uppercase tracking-widest">
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export type SectionTitleProps = {
  eyebrow: string;
  title: string;
};

export function SectionTitle({ eyebrow, title }: SectionTitleProps) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand to-neon-cyan bg-clip-text text-transparent uppercase tracking-tighter">
        {title}
      </h2>
      {eyebrow ? (
        <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest">{eyebrow}</p>
      ) : null}
    </div>
  );
}

export type WrapperProps = {
  children: ReactNode;
  label?: string;
};

export function Wrapper({ children }: WrapperProps) {
  return <div className="container mx-auto px-4">{children}</div>;
}