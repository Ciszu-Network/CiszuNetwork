import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-8xl font-black text-brand-light mb-4">404</div>
      <h1 className="text-2xl font-header font-black text-white mb-4 uppercase tracking-tighter">
        Página no encontrada
      </h1>
      <p className="text-gray-400 max-w-md mb-8">
        La ruta solicitada no existe en Ciszu Network.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  );
}