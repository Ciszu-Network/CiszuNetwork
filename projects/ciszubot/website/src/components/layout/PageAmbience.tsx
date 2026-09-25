/**
 * Ambiente decorativo común de las páginas de contenido de CiszuBot.
 *
 * Un único fondo (glows neon-blue + neon-purple fijos) para que todas las
 * páginas compartan el mismo ambiente visual y ninguna introduzca su propio
 * fondo decorativo.
 */
export default function PageAmbience() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -top-32 -right-32 w-[900px] h-[900px] bg-neon-blue/5 rounded-full blur-[220px]" />
      <div className="absolute -bottom-32 -left-32 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px]" />
    </div>
  );
}
