'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, BotOff, Terminal, Command, CornerDownLeft } from 'lucide-react';
import QuickDocks from '@/components/molecules/QuickDocks';

type Tone = 'system' | 'ok' | 'warn' | 'err' | 'muted' | 'echo';

interface ConsoleLine {
  id: number;
  text: string;
  tone: Tone;
}

interface CommandResult {
  lines: { text: string; tone: Tone }[];
  awake?: boolean;
}

const TONE_CLASS: Record<Tone, string> = {
  system: 'text-neon-cyan/80',
  ok: 'text-green-400',
  warn: 'text-yellow-300',
  err: 'text-red-400',
  muted: 'text-white/40',
  echo: 'text-white/80',
};

const BOOT_LOG: ConsoleLine[] = [
  { id: 0, text: '[SYS] ciszubot core v2.6 — modo recuperación', tone: 'muted' },
  { id: 1, text: '[WARN] ruta solicitada no indexada en la tabla de comandos', tone: 'warn' },
  { id: 2, text: '[ERR] ERR_CZ404 — recurso purgado del sistema', tone: 'err' },
  { id: 3, text: 'pista: escribe cz!help para hablar con el bot', tone: 'system' },
];

const HELP_LINES: { text: string; tone: Tone }[] = [
  { text: '[CMD] comandos disponibles:', tone: 'system' },
  { text: 'cz!status · cz!404 · cz!ping · cz!boot · cz!shutdown · cz!sudo · cz!sys_log · cz!clear', tone: 'muted' },
];

function runCommand(raw: string): CommandResult {
  const command = raw.toLowerCase();
  switch (command) {
    case 'cz!help':
      return { lines: HELP_LINES };
    case 'cz!404':
      return {
        lines: [
          { text: '[404] encontré la ruta. la perdí. la volví a encontrar.', tone: 'warn' },
          { text: '[404] bienvenido al único comando que vive en esta página.', tone: 'system' },
        ],
      };
    case 'cz!status':
      return {
        lines: [
          { text: '[OK] uptime: 404 días, 4 horas y 4 minutos', tone: 'ok' },
          { text: '[WARN] rutas caídas: 1 (esta)', tone: 'warn' },
        ],
      };
    case 'cz!ping':
      return { lines: [{ text: '[NET] pong — 404 ms (sospechosamente exacto)', tone: 'ok' }] };
    case 'cz!boot':
      return {
        awake: true,
        lines: [
          { text: '[..] reiniciando núcleo de ciszubot...', tone: 'muted' },
          { text: '[OK] bot en línea. hola, operador.', tone: 'ok' },
        ],
      };
    case 'cz!shutdown':
      return {
        awake: false,
        lines: [
          { text: '[..] apagando núcleo de ciszubot...', tone: 'muted' },
          { text: '[OFF] bot desconectado. el 404 sigue a cargo.', tone: 'warn' },
        ],
      };
    case 'cz!sudo':
      return { lines: [{ text: '[DENIED] privilegios insuficientes: incidente registrado en cz!sys_log', tone: 'err' }] };
    case 'cz!sys_log':
      return {
        lines: [
          { text: '[LOG] 404 · ruta fantasma · acceso anónimo', tone: 'muted' },
          { text: '[LOG] el bot culpa al DNS. como siempre.', tone: 'muted' },
        ],
      };
    default:
      return {
        lines: [
          { text: `[ERR] comando desconocido: ${raw.slice(0, 40)}`, tone: 'err' },
          { text: 'prueba con cz!help', tone: 'system' },
        ],
      };
  }
}

export default function NotFound() {
  const [awake, setAwake] = useState(false);
  const [lines, setLines] = useState<ConsoleLine[]>(BOOT_LOG);
  const [input, setInput] = useState('');
  const nextId = useRef(BOOT_LOG.length);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    setInput('');

    if (raw.toLowerCase() === 'cz!clear') {
      nextId.current = 0;
      setLines([]);
      return;
    }

    const result = runCommand(raw);
    if (result.awake !== undefined) setAwake(result.awake);

    const appended: ConsoleLine[] = [
      { id: nextId.current++, text: `> ${raw}`, tone: 'echo' },
      ...result.lines.map((line) => ({ id: nextId.current++, ...line })),
    ];
    setLines((prev) => [...prev, ...appended].slice(-10));
  };

  return (
    <>
    <div className="relative min-h-[80vh] bg-bg flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <style>{`
        .czbot-line { animation: czbot-in 0.18s ease-out both; }
        @keyframes czbot-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .czbot-cursor { animation: czbot-blink 1s steps(1) infinite; }
        @keyframes czbot-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .czbot-wake { animation: czbot-pop 0.4s ease-out both; }
        @keyframes czbot-pop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .czbot-line,
          .czbot-cursor,
          .czbot-wake { animation: none !important; }
        }
      `}</style>

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

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        {/* Estado del bot (cz!boot lo enciende) */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 blur-2xl rounded-full ${awake ? 'bg-green-400/25' : 'bg-neon-purple/25'}`} />
          {awake ? (
            <Bot className="czbot-wake relative w-20 h-20 md:w-24 md:h-24 text-green-400 drop-shadow-[0_0_18px_rgba(74,222,128,0.9)]" />
          ) : (
            <BotOff className="relative w-20 h-20 md:w-24 md:h-24 text-neon-purple drop-shadow-[0_0_18px_rgba(167,139,250,0.9)]" />
          )}
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
            className="group relative inline-flex items-center justify-center overflow-hidden bg-bg border-2 border-neon-cyan px-10 py-4 font-black text-neon-cyan uppercase tracking-[0.3em] text-base transition-all hover:text-bg hover:border-neon-cyan"
          >
            <span className="absolute inset-0 bg-neon-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2 whitespace-nowrap">
              <Command className="w-5 h-5 shrink-0" />
              VOLVER AL HOME
            </span>
          </Link>
        </div>

        {/* Consola de recuperación: easter egg del bot caído */}
        <form onSubmit={submitCommand} className="mt-10 w-full max-w-xl text-left">
          <div
            className={`rounded-2xl border bg-surface/80 backdrop-blur transition-colors ${
              awake ? 'border-green-400/40 shadow-[0_0_30px_rgba(74,222,128,0.15)]' : 'border-neon-cyan/30'
            }`}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${awake ? 'bg-green-400 czbot-cursor' : 'bg-yellow-300'}`}
                aria-hidden
              />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                ciszubot consola · {awake ? 'en línea' : 'offline'}
              </span>
              <span className="ml-auto hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-white/30">
                cz!sys_log
              </span>
            </div>

            <div className="space-y-1 px-4 py-3 font-mono text-[10px] md:text-xs leading-relaxed" aria-live="polite">
              {lines.map((line) => (
                <p key={line.id} className={`czbot-line break-words ${TONE_CLASS[line.tone]}`}>
                  {line.text}
                </p>
              ))}
              <span className="czbot-cursor inline-block text-neon-cyan" aria-hidden>
                _
              </span>
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
              <CornerDownLeft className="w-4 h-4 shrink-0 text-neon-cyan/70" aria-hidden />
              <label htmlFor="czbot-command" className="sr-only">
                Comando para ciszubot
              </label>
              <input
                ref={inputRef}
                id="czbot-command"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="escribe cz!help"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent font-mono text-xs text-ink placeholder:text-white/25 outline-none"
              />
              <button
                type="submit"
                className="shrink-0 border border-neon-cyan/40 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neon-cyan transition-colors hover:bg-neon-cyan hover:text-bg"
              >
                Enviar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Easter egg sys_log */}
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 text-muted transition-colors hover:text-neon-cyan"
      >
        <Bot className="w-4 h-4 text-neon-purple/60" />
        <span className="text-[10px] uppercase font-bold tracking-widest">cz!sys_log · ciszubot core</span>
      </button>
    </div>
    <QuickDocks />
    </>
  );
}
