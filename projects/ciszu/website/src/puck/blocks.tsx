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
    <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(35,63,146,0.3)_0%,rgba(0,10,30,0.2)_60%,transparent_100%)]" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter mb-4">
          {title}
        </h1>
        <p className="text-brand-light font-black text-xs uppercase tracking-[0.4em] mb-4">{tagline}</p>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-accent">{description}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={ctaHref} className="inline-flex items-center gap-2 px-8 py-4 bg-brand/20 text-white font-black rounded-xl border-2 border-brand/50 hover:bg-brand hover:scale-105 transition-all text-lg font-header">
            {ctaLabel}
          </Link>
          <Link href={secondaryHref} className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-black rounded-xl border-2 border-white/20 hover:bg-white/10 hover:scale-105 transition-all text-lg font-header">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-8 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand/40 transition-all animate-pulse-glow">
              <div className="text-5xl font-header font-black text-brand-light mb-2">{s.value}</div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">{s.label}</div>
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
          <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
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
      <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter">
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
