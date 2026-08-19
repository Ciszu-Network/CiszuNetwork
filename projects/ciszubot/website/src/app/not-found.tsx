import Link from 'next/link';
import { Bot, BotOff, Terminal, Command } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] bg-bg flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Fondo neon cian/violeta */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 pointer-events-none" />

      {/* Grid de seguridad */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at center, black, transparent 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Botón de bot desconectado */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-neon-purple/25 blur-2xl rounded-full" />
          <BotOff className="relative w-20 h-20 md:w-24 md:h-24 text-neon-purple drop-shadow-[0_0_18px_rgba(167,139,250,0.9)]" />
        </div>

        {/* 404 con efecto glitch cian/violeta */}
        <div className="relative">
          <h1
            aria-hidden
            className="absolute top-0 left-0 text-8xl md:text-[11rem] font-black tracking-tighter text-neon-blue/40 mix-blend-screen"
            style={{ transform: 'translate(4px,-3px)' }}
          >
            404
          </h1>
          <h1
            aria-hidden
            className="absolute top-0 left-0 text-8xl md:text-[11rem] font-black tracking-tighter text-neon-purple/40 mix-blend-screen"
            style={{ transform: 'translate(-4px,3px)' }}
          >
            404
          </h1>
          <h1 className="relative text-8xl md:text-[11rem] font-black tracking-tighter text-ink leading-none drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            404
          </h1>
        </div>

        <div className="mt-8 flex items-center gap-3 bg-surface/80 border border-neon-cyan/30 px-6 py-2 backdrop-blur">
          <Terminal className="w-5 h-5 text-neon-cyan animate-pulse" />
          <p className="text-neon-cyan font-bold tracking-[0.4em] uppercase text-xs md:text-sm">
            COMANDO NO ENCONTRADO
          </p>
        </div>

        <div className="mt-5 max-w-xl space-y-2">
          <p className="text-ink/90 text-sm md:text-base font-semibold uppercase tracking-wider">
            ERROR 404: LA RUTA SOLICITADA NO EXISTE.
          </p>
          <p className="text-muted text-xs md:text-sm uppercase tracking-widest">
            Comprueba el comando e inténtalo de nuevo. Si creíste encontrar algo aquí, se ha purgado del sistema.
          </p>
        </div>

        <div className="pt-10">
          <Link
            href="/"
            className="group relative overflow-hidden bg-bg border-2 border-neon-cyan px-10 py-4 font-black text-neon-cyan uppercase tracking-[0.3em] text-base transition-all hover:text-bg hover:border-neon-cyan"
          >
            <span className="absolute inset-0 bg-neon-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              <Command className="w-5 h-5" />
              VOLVER AL HOME
            </span>
          </Link>
        </div>
      </div>

      {/* Easter egg sys_log */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 text-muted">
        <Bot className="w-4 h-4 text-neon-purple/60" />
        <span className="text-[10px] uppercase font-bold tracking-widest">cz!sys_log · ciszubot core</span>
      </div>
    </div>
  );
}