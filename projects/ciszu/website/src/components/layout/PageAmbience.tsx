/**
 * PageAmbience — ambiente de fondo compartido de las páginas de contenido de
 * Ciszu Network: orbes brand/neon desenfocados sobre el fondo negro.
 *
 * Shell canónico de la web: todas las páginas de contenido usan
 * `relative min-h-screen pt-24 pb-20 px-4` + `<PageAmbience />` +
 * `<PageReveal>` para no dar saltos visuales entre rutas. Es puramente
 * decorativo (`aria-hidden`, `pointer-events-none`, `-z-10`).
 *
 * `animated`: añade rejilla en movimiento y orbes con animación (home). El
 * resto de páginas no pasan la prop y conservan el fondo estático de siempre.
 */
export default function PageAmbience({ animated = false }: { animated?: boolean } = {}) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-48 right-[-10%] h-[900px] w-[900px] rounded-full bg-brand/10 blur-[220px]" />
      <div className="absolute top-1/3 left-[-15%] h-[700px] w-[700px] rounded-full bg-neon-cyan/5 blur-[200px]" />
      <div className="absolute bottom-[-25%] left-1/3 h-[800px] w-[800px] rounded-full bg-brand-accent/5 blur-[240px]" />
      {animated && (
        <>
          <div
            className="absolute inset-0 opacity-[0.14] animate-grid-shift"
            style={{
              backgroundImage:
                'linear-gradient(rgba(58,107,240,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(58,107,240,0.35) 1px, transparent 1px)',
              backgroundSize: '56px 56px, 56px 56px',
            }}
          />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand/10 blur-[140px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-neon-cyan/10 blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 right-1/3 h-72 w-72 rounded-full bg-neon-pink/5 blur-[100px] animate-blob animation-delay-4000" />
        </>
      )}
    </div>
  );
}
