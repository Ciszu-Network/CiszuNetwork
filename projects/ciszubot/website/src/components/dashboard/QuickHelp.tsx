'use client';

import { Icon } from '@ciszu/ui';

export interface HelpCommand {
  name: string;
  description: string;
  premium?: boolean;
}

interface QuickHelpProps {
  title: string;
  commands: HelpCommand[];
  /** Nota al pie del popover (p. ej. "Se configura con cz!drops on"). */
  note?: string;
  /** Texto del botón (por defecto "?"). */
  label?: string;
}

/**
 * QuickHelp — icono de interrogación con popover al hover/focus que muestra
 * los comandos de la sección y para qué sirven, sin salir del dashboard.
 * CSS puro (group-hover + focus-within): sin estado ni clics.
 */
export function QuickHelp({ title, commands, note, label = '?' }: QuickHelpProps) {
  if (commands.length === 0) return null;
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Ayuda: ${title}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neon-blue/40 bg-neon-blue/10 text-[11px] font-black text-neon-blue transition hover:bg-neon-blue/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50"
      >
        {label}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-80 max-w-[80vw] translate-y-1 rounded-xl border border-white/15 bg-[#0b0f1a]/95 p-3 opacity-0 shadow-2xl backdrop-blur transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <span className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neon-blue">
          <Icon name="help" size={11} /> {title}
        </span>
        <span className="block max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {commands.map((cmd) => (
            <span key={cmd.name} className="block text-[11px] leading-snug text-white/70">
              <code className="rounded bg-black/40 px-1.5 py-0.5 font-bold text-neon-pink">cz!{cmd.name}</code>
              {cmd.premium && <span className="ml-1 text-[9px] font-black text-amber-300">PREMIUM</span>}
              <span className="mt-0.5 block text-white/50">{cmd.description}</span>
            </span>
          ))}
        </span>
        {note && <span className="mt-2 block border-t border-white/10 pt-2 text-[10px] text-white/40">{note}</span>}
      </span>
    </span>
  );
}

/**
 * HelpZone — caja de información dentro de una sección con los comandos de esa
 * opción (para que el usuario sepa qué usar sin salir del dashboard).
 */
export function HelpZone({ title, commands, note }: QuickHelpProps) {
  if (commands.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-4">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon-blue">
        <Icon name="help" size={12} /> {title}
      </p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {commands.map((cmd) => (
          <div key={cmd.name} className="text-[11px] leading-snug text-white/70">
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-bold text-neon-pink">cz!{cmd.name}</code>
            {cmd.premium && <span className="ml-1 text-[9px] font-black text-amber-300">PREMIUM</span>}
            <span className="text-white/50"> — {cmd.description}</span>
          </div>
        ))}
      </div>
      {note && <p className="mt-2 text-[10px] text-white/40">{note}</p>}
    </div>
  );
}
