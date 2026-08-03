import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-black text-neon-cyan">404</h1>
        <p className="text-gray-400 text-lg">Página no encontrada</p>
        <Link href="/" className="inline-block px-8 py-4 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl hover:bg-neon-cyan hover:text-black transition-all">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
