/**
 * PageAmbience — ambiente de fondo compartido de las páginas de contenido de
 * Ciszu Network: orbes brand/neon desenfocados sobre el fondo negro.
 *
 * Shell canónico de la web: todas las páginas de contenido usan
 * `relative min-h-screen pt-24 pb-20 px-4` + `<PageAmbience />` +
 * `<PageReveal>` para no dar saltos visuales entre rutas. Es puramente
 * decorativo (`aria-hidden`, `pointer-events-none`, `-z-10`).
 */
export default function PageAmbience() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-48 right-[-10%] h-[900px] w-[900px] rounded-full bg-brand/10 blur-[220px]" />
      <div className="absolute top-1/3 left-[-15%] h-[700px] w-[700px] rounded-full bg-neon-cyan/5 blur-[200px]" />
      <div className="absolute bottom-[-25%] left-1/3 h-[800px] w-[800px] rounded-full bg-brand-accent/5 blur-[240px]" />
    </div>
  );
}
