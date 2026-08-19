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
    <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden bg-bg-darker">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(72,0,255,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-purple/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent mb-4 drop-shadow-neon-cyan">
          {title}
        </h1>
        <p className="text-neon-pink font-bold text-xs uppercase tracking-[0.4em] mb-4">{tagline}</p>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-accent">{description}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={ctaHref} className="inline-flex items-center gap-2 px-8 py-4 bg-neon-cyan/10 text-neon-cyan font-bold rounded-xl border-2 border-neon-cyan/50 shadow-neon-cyan hover:bg-neon-cyan hover:text-black hover:scale-105 transition-all text-lg font-header">
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
    <section className="py-20 bg-black border-t border-white/5">
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
              className="text-center p-8 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 hover:border-neon-cyan/60 hover:shadow-neon-cyan transition-all"
            >
              <div className="text-4xl md:text-5xl font-header font-black text-neon-cyan mb-2">{s.value}</div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type FeaturesProps = {
  title: string;
  features: { title: string; description: string }[];
};

export function FeaturesBlock({ title, features }: FeaturesProps) {
  return (
    <section className="py-20 bg-bg-darker border-t border-white/5">
      <div className="container mx-auto px-4">
        {title ? (
          <h2 className="text-3xl md:text-4xl font-header font-black text-center mb-12 text-white uppercase tracking-tighter">
            {title}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-black/40 border border-neon-purple/20 hover:border-neon-pink/60 hover:shadow-neon-pink transition-all"
            >
              <div className="text-lg font-header font-bold text-neon-cyan mb-2">{f.title}</div>
              <div className="text-gray-400 text-sm font-accent">{f.description}</div>
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
    <section className="py-24 bg-black border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-[2rem] bg-gradient-to-r from-neon-purple/20 via-neon-blue/10 to-transparent border border-neon-purple/40 shadow-neon-purple">
          <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            {title}
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm uppercase tracking-widest font-accent">
            {description}
          </p>
          <Link href={buttonHref} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-neon-cyan text-black font-header font-bold rounded-xl hover:bg-neon-pink hover:text-white hover:scale-105 transition-all uppercase tracking-widest shadow-neon-cyan">
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
      <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent uppercase tracking-tighter">
        {title}
      </h2>
      {eyebrow ? (
        <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest font-accent">
          {eyebrow}
        </p>
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