'use client';

import { Icon } from '@ciszu/ui';
import { COMMANDS, CATEGORIES, CATEGORY_ICONS } from '@/data/commands';
import type { Dict } from '@/lib/i18n';
import Reveal from './Reveal';

interface FeaturesSectionProps {
  dict: Dict;
}

/** Un acento literal por tarjeta (Tailwind escanea clases completas). */
const FEATURE_STYLES = [
  {
    icon: 'rocket',
    accent: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'hover:border-neon-blue/60',
    glow: 'hover:shadow-[0_0_35px_rgba(0,212,255,0.15)]',
  },
  {
    icon: 'globe',
    accent: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'hover:border-neon-cyan/60',
    glow: 'hover:shadow-[0_0_35px_rgba(34,211,238,0.15)]',
  },
  {
    icon: 'gamepad',
    accent: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'hover:border-neon-purple/60',
    glow: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.15)]',
  },
  {
    icon: 'shield',
    accent: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'hover:border-neon-pink/60',
    glow: 'hover:shadow-[0_0_35px_rgba(255,51,204,0.15)]',
  },
];

/**
 * Características reales del bot (diccionario existente) + el mapa real de
 * categorías de comandos con su conteo (`COMMANDS`), sin datos de relleno.
 */
export default function FeaturesSection({ dict }: FeaturesSectionProps) {
  const categories = CATEGORIES.map((category) => ({
    category,
    icon: CATEGORY_ICONS[category],
    count: COMMANDS.filter((cmd) => cmd.category === category).length,
  }));

  return (
    <section id="features" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">{dict.features.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{dict.features.subtitle}</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {dict.features.items.map((item, i) => {
            const style = FEATURE_STYLES[i % FEATURE_STYLES.length];
            return (
              <Reveal key={item.title} delay={i * 90}>
                <div
                  className={`group h-full soft-card rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1.5 ${style.border} ${style.glow}`}
                >
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${style.bg} ${style.accent} mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon name={style.icon} size={24} />
                  </span>
                  <h3 className="font-header font-bold text-ink mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Mapa real de categorías (conteos desde COMMANDS) */}
        <Reveal delay={200}>
          <div className="mt-12 max-w-5xl mx-auto">
            <p className="text-center text-xs text-muted mb-5">
              {dict.commandsSection.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((c) => (
                <a
                  key={c.category}
                  href="#comandos"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-card border border-border px-4 py-2 text-xs font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-purple/60 hover:text-neon-purple"
                >
                  <Icon name={c.icon} size={14} className="text-neon-purple" />
                  {dict.commandsSection.categories[c.category]}
                  <span className="tabular-nums text-faint group-hover:text-neon-purple">{c.count}</span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
