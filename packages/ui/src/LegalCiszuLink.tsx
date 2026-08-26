/**
 * LegalCiszuLink — aviso en las páginas legales de las webs hermanas.
 *
 * Ciszu Network es la web con la documentación legal MÁS COMPLETA del ecosistema
 * (privacidad, uso de datos, anuncios, geolocalización, cuentas, cookies). Este
 * componente añade un enlace a esa versión completa desde cualquier página legal
 * de ciszukoantony, ciszubot y muzicmania.
 *
 * Uso (dentro de una página legal):
 *   import { LegalCiszuLink } from '@ciszu/ui';
 *   <LegalCiszuLink />
 */
export interface LegalCiszuLinkProps {
  label?: string;
  url?: string;
}

export function LegalCiszuLink({
  label = 'Ciszu Network',
  url = 'https://ciszunetwork.vercel.app/policies',
}: LegalCiszuLinkProps) {
  return (
    <div className="my-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
      <p className="text-neutral-400 leading-relaxed">
        La versión completa de las bases legales del ecosistema (privacidad, uso de datos,
        anuncios, geolocalización, cuentas y cookies) está publicada en{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-cyan-300 hover:underline"
        >
          {label} → Políticas
        </a>
        .
      </p>
    </div>
  );
}