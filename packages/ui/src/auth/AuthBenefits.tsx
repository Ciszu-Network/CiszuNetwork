'use client';

/**
 * AuthBenefitsPanel — panel de beneficios de las páginas de auth (login/register).
 *
 * Diseño "libro de 2 caras": a la izquierda el cuestionario/formulario y a la
 * derecha las características y beneficios, con una línea vertical central que
 * imita el lomo de un libro abierto. En móvil se apila (beneficios primero).
 *
 * Beneficios (punto 5 de la tarea de anuncios):
 *   - Menos anuncios al registrarse e iniciar sesión (se quitan los de footer).
 *   - Guardar datos y preferencias entre dispositivos.
 *   - Obtener recompensas (futuro) y rango VIP para quitar anuncios.
 */

import type { ReactNode } from 'react';

export interface AuthBenefit {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface AuthBenefitsPanelProps {
  items: AuthBenefit[];
  title?: string;
  badge?: string;
  footerNote?: string;
  accent?: string;
  accentAlt?: string;
}

export function AuthBenefitsPanel({
  items,
  title = 'Beneficios de tu cuenta',
  badge = 'CISZU ID',
  footerNote,
  accent = '#22d3ee',
  accentAlt = '#f472b6',
}: AuthBenefitsPanelProps) {
  return (
    <aside
      className="rounded-[2rem] border border-white/10 p-7 md:p-8 backdrop-blur-2xl bg-[#0a0a14]/80"
      style={{ boxShadow: `0 0 60px ${accent}11`, borderColor: `${accent}22` }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span
          className="inline-flex items-center gap-2 text-black font-black uppercase tracking-widest text-[0.6rem] px-3 py-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accentAlt})` }}
        >
          {badge}
        </span>
      </div>
      <h3 className="text-white font-header font-black uppercase tracking-tight text-xl md:text-2xl mt-3">
        {title}
      </h3>
      <div className="h-[2px] w-16 mt-2 mb-6 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accentAlt})` }} />

      <ul className="space-y-5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 items-start">
            <div
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
              style={{ background: `${accent}1a`, color: accent, border: `1px solid ${accent}33` }}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-white text-sm font-bold">{item.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {footerNote && (
        <p className="mt-7 pt-5 border-t border-white/10 text-[11px] text-gray-500 leading-relaxed">
          {footerNote}
        </p>
      )}
    </aside>
  );
}

export default AuthBenefitsPanel;