'use client';

// Cabecera de marca de auth (LOGIN_REGISTER_PROTOCOLS §1.1): [CISZU isotipo] X
// [isotipo de la web]. Click en CISZU -> ciszunetwork.vercel.app; click en el
// isotipo de la web -> home de la web. Los isotipos llegan como ReactNode (enlaces
// opcionales) para no acoplar el paquete a Next Link ni al resolver de cada web.
export interface CiszuIdBrandProps {
  ciszuIsotype: React.ReactNode;
  appIsotype: React.ReactNode;
  ciszuHref?: string;
  appHref?: string;
  title?: string;
  subtitle?: string;
  onCiszuClick?: () => void;
  onAppClick?: () => void;
  /** Variante "solo": 1 aliado (isotipo de la propia web) grande, sin la X.
   *  Útil en ciszunetwork donde la app es Ciszu Network mismo. */
  solo?: boolean;
  /** Tamaño del isotipo en la variante solo (clases Tailwind de tamaño). */
  soloSize?: string;
}

export const BrandX = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 text-white/40"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export function CiszuIdBrand({
  ciszuIsotype,
  appIsotype,
  ciszuHref,
  appHref,
  title = 'CISZU ID',
  subtitle,
  onCiszuClick,
  onAppClick,
  solo = false,
  soloSize = 'w-20 h-20',
}: CiszuIdBrandProps) {
  const clickHandler = (fn?: () => void) => (e: React.MouseEvent) => {
    if (!fn) return;
    e.preventDefault();
    fn();
  };

  if (solo) {
    const href = appHref ?? ciszuHref;
    const onClick = onAppClick ?? onCiszuClick;
    const node = (
      <span
        className={`inline-flex items-center justify-center ${soloSize} rounded-full border border-white/10 bg-white/5 shadow-lg`}
      >
        {appIsotype ?? ciszuIsotype}
      </span>
    );
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-3">
          {href ? (
            <a
              href={href}
              onClick={clickHandler(onClick)}
              className={`inline-flex items-center justify-center ${soloSize} rounded-full border border-white/10 bg-white/5 shadow-lg transition-all hover:border-cyan-400/60 hover:scale-110 active:scale-95 cursor-pointer`}
              title={subtitle}
            >
              {appIsotype ?? ciszuIsotype}
            </a>
          ) : (
            node
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-header font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-tighter mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 font-black tracking-[0.35em] uppercase text-[10px] md:text-xs">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center gap-5 mb-2">
        {ciszuHref ? (
          <a
            href={ciszuHref}
            onClick={clickHandler(onCiszuClick)}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 shadow-lg transition-all hover:border-cyan-400/60 hover:scale-110 active:scale-95 cursor-pointer"
            title="Ciszu Network"
          >
            {ciszuIsotype}
          </a>
        ) : (
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 shadow-lg">
            {ciszuIsotype}
          </span>
        )}
        <BrandX />
        {appHref ? (
          <a
            href={appHref}
            onClick={clickHandler(onAppClick)}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 shadow-lg transition-all hover:border-cyan-400/60 hover:scale-110 active:scale-95 cursor-pointer"
            title={subtitle}
          >
            {appIsotype}
          </a>
        ) : (
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 shadow-lg">
            {appIsotype}
          </span>
        )}
      </div>
      <h1 className="text-3xl md:text-4xl font-header font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-tighter mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-white/60 font-black tracking-[0.35em] uppercase text-[10px] md:text-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default CiszuIdBrand;