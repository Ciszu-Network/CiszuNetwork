/**
 * LegalCiszuLink — dock legal al final de las páginas legales de las webs
 * hermanas (ciszukoantony, ciszubot, muzicmania).
 *
 * Ciszu Network es la web con la documentación legal MÁS COMPLETA del ecosistema
 * (privacidad, uso de datos, anuncios, geolocalización, cuentas, cookies). Este
 * componente añade un DOCK (barra de botones estilo dock) al final de cualquier
 * página legal que enlaza a la versión completa de esas políticas en Ciszu Network.
 *
 * Uso (dentro de una página legal):
 *   import { LegalCiszuLink } from '@ciszu/ui';
 *   <LegalCiszuLink />
 */
export interface LegalCiszuLinkProps {
  label?: string;
  url?: string;
  supportUrl?: string;
}

export function LegalCiszuLink({
  label = 'Ciszu Network',
  url = 'https://ciszunetwork.vercel.app/policies',
  supportUrl = 'https://ciszunetwork.vercel.app/support',
}: LegalCiszuLinkProps) {
  return (
    <div className="my-10">
      <p className="text-center text-[11px] uppercase tracking-widest text-neutral-500 font-bold mb-4">
        Versión completa de las políticas del ecosistema
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Dock: botón principal hacia Ciszu Network / Políticas */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(90deg, #22d3ee, #f472b6)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {label} · Políticas
        </a>
        {/* Dock: soporte / contacto legal */}
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-200 border border-white/15 bg-white/5 transition-transform hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Soporte legal
        </a>
      </div>
      <p className="text-center text-neutral-500 text-xs leading-relaxed mt-4">
        Privacidad, uso de datos, anuncios, geolocalización, cuentas y cookies · Gestionado por Ciszu Network
      </p>
    </div>
  );
}

export default LegalCiszuLink;