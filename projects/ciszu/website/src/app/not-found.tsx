'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 404 de Ciszu Network — estética de "error de sistema / terminal corporativa".
 *
 * Todo el movimiento es CSS (keyframes propios, con `prefers-reduced-motion`).
 * Easter eggs:
 *  - Palabras clave al teclear: `ciszu`, `sudo`, `help`, `ping`, `home`.
 *  - Botón oculto en la barra de estado que abre el diagnóstico del nodo.
 */

const KEYWORDS: { key: string; line: string }[] = [
  { key: 'ciszu', line: '[OK] ACCESO CONCEDIDO — bienvenido de vuelta, operador.' },
  { key: 'sudo', line: '[DENIED] privilegios insuficientes: incidente registrado en /var/log/ciszu.log' },
  { key: 'help', line: '[CMD] comandos disponibles: ciszu · sudo · ping · home · help' },
  { key: 'ping', line: '[NET] pong — 12ms · nodo ciszunetwork: estable.' },
];

const BOOT_LOG = [
  '[OK] núcleo ciszunetwork v2026 — arranque verificado',
  '[OK] cdn ciszu-cdn — assets sincronizados',
  '[WARN] ruta solicitada no indexada en la tabla de rutas',
  '[ERR] ERR_CISZU_404 — recurso inexistente o retirado',
];

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const bufferRef = useRef('');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = useCallback((line: string) => {
    setDiagnosticsOpen(true);
    setLog((prev) => [...prev.slice(-5), line]);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (!/^[a-z0-9]$/.test(key)) return;
      bufferRef.current = (bufferRef.current + key).slice(-16);
      const match = KEYWORDS.find((entry) => bufferRef.current.endsWith(entry.key));
      if (match) {
        bufferRef.current = '';
        pushLog(match.line);
        return;
      }
      if (bufferRef.current.endsWith('home')) {
        bufferRef.current = '';
        pushLog('[ROUTE] redirigiendo al inicio del nodo...');
        router.push('/');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pushLog, router]);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black text-neon-cyan flex items-center justify-center px-4 py-16 select-none">
      <style>{`
        .cz404-glitch { position: relative; display: inline-block; }
        .cz404-glitch::before,
        .cz404-glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cz404-glitch::before {
          left: 2px;
          color: #68cfff;
          text-shadow: -2px 0 #3a6bf0;
          clip-path: inset(0 0 58% 0);
          animation: cz404-slice-a 3.4s infinite linear alternate-reverse;
        }
        .cz404-glitch::after {
          left: -2px;
          color: #3a6bf0;
          text-shadow: 2px 0 #68cfff;
          clip-path: inset(42% 0 0 0);
          animation: cz404-slice-b 2.6s infinite linear alternate-reverse;
        }
        @keyframes cz404-slice-a {
          0% { clip-path: inset(0 0 92% 0); transform: translateX(-3px); }
          12% { clip-path: inset(14% 0 72% 0); transform: translateX(3px); }
          24% { clip-path: inset(48% 0 36% 0); transform: translateX(-2px); }
          36% { clip-path: inset(8% 0 84% 0); transform: translateX(2px); }
          48% { clip-path: inset(64% 0 18% 0); transform: translateX(-3px); }
          60% { clip-path: inset(30% 0 56% 0); transform: translateX(3px); }
          72% { clip-path: inset(78% 0 6% 0); transform: translateX(-2px); }
          86% { clip-path: inset(22% 0 64% 0); transform: translateX(2px); }
          100% { clip-path: inset(0 0 92% 0); transform: translateX(-3px); }
        }
        @keyframes cz404-slice-b {
          0% { clip-path: inset(70% 0 10% 0); transform: translateX(3px); }
          16% { clip-path: inset(24% 0 62% 0); transform: translateX(-3px); }
          32% { clip-path: inset(52% 0 30% 0); transform: translateX(2px); }
          48% { clip-path: inset(6% 0 86% 0); transform: translateX(-2px); }
          64% { clip-path: inset(80% 0 4% 0); transform: translateX(3px); }
          82% { clip-path: inset(38% 0 48% 0); transform: translateX(-3px); }
          100% { clip-path: inset(70% 0 10% 0); transform: translateX(3px); }
        }
        .cz404-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(104, 207, 255, 0.05) 0px,
            rgba(104, 207, 255, 0.05) 1px,
            transparent 1px,
            transparent 3px
          );
        }
        .cz404-scanbar {
          height: 140px;
          background: linear-gradient(to bottom, transparent, rgba(104, 207, 255, 0.14), transparent);
          animation: cz404-scan 7s linear infinite;
        }
        @keyframes cz404-scan {
          0% { transform: translateY(-160px); }
          100% { transform: translateY(80vh); }
        }
        .cz404-flicker { animation: cz404-flicker 5s infinite steps(1); }
        @keyframes cz404-flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.62; }
          97% { opacity: 1; }
          98% { opacity: 0.78; }
        }
        .cz404-cursor { animation: cz404-blink 1s steps(1) infinite; }
        @keyframes cz404-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .cz404-shake { animation: cz404-shake 6s infinite; }
        @keyframes cz404-shake {
          0%, 92%, 100% { transform: translateX(0); }
          93% { transform: translateX(-2px); }
          94% { transform: translateX(2px); }
          95% { transform: translateX(-1px); }
          96% { transform: translateX(1px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cz404-glitch::before,
          .cz404-glitch::after,
          .cz404-scanbar,
          .cz404-flicker,
          .cz404-cursor,
          .cz404-shake { animation: none !important; }
        }
      `}</style>

      {/* Superficies decorativas */}
      <div className="pointer-events-none absolute inset-0 cz404-scanlines" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 cz404-scanbar" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(to right, #68cfff 1px, transparent 1px), linear-gradient(to bottom, #68cfff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at center, black, transparent 78%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.85) 100%)' }}
      />

      <div className="cz404-shake relative z-10 w-full max-w-3xl">
        <div className="rounded-2xl border border-neon-cyan/30 bg-black/80 shadow-[0_0_60px_rgba(104,207,255,0.15)] backdrop-blur-sm overflow-hidden">
          {/* Barra de título */}
          <div className="flex items-center gap-3 border-b border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-neon-red/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-yellow/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/70" />
            </span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-neon-cyan/70 truncate">
              ciszunetwork // node-404 — /bin/resolve
            </span>
            <span className="ml-auto hidden sm:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon-yellow/80">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow cz404-cursor" aria-hidden />
              offline
            </span>
          </div>

          {/* Cuerpo de la terminal */}
          <div className="px-5 py-8 md:px-10 md:py-12 space-y-8 cz404-flicker">
            <div className="font-mono text-[11px] md:text-xs text-neon-cyan/70 space-y-1.5 text-left">
              <p className="break-all">
                <span className="text-neon-green">$</span> ciszu --resolve{' '}
                <span className="text-white">{pathname ?? '/???'}</span>
              </p>
              <p className="text-neon-yellow/90">&gt; ERR_CISZU_404: recurso no indexado en la red.</p>
            </div>

            <div className="text-center space-y-5">
              <h1
                className="cz404-glitch font-header font-black text-[6rem] leading-none md:text-[10rem] tracking-tighter text-white"
                data-text="404"
                aria-label="Error 404"
              >
                404
              </h1>

              <p className="inline-flex items-center gap-3 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-5 py-2 font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-neon-cyan">
                <span className="w-2 h-2 bg-neon-pink rounded-sm" aria-hidden />
                ERR_CISZU_404
              </p>

              <h2 className="font-header font-black text-xl md:text-3xl uppercase tracking-tighter text-white">
                Página no encontrada
              </h2>
              <p className="mx-auto max-w-md text-sm text-white/50 leading-relaxed">
                El nodo está operativo, pero esta ruta no existe o fue retirada del sistema. Revisa la dirección o
                vuelve al inicio para restablecer la sesión.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="group inline-flex items-center gap-3 rounded-xl border-2 border-neon-cyan bg-neon-cyan/10 px-8 py-4 font-header font-black uppercase tracking-[0.2em] text-sm text-neon-cyan transition-all hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_30px_rgba(104,207,255,0.5)]"
              >
                <span aria-hidden className="font-mono">
                  &gt;_
                </span>
                Volver al inicio
              </Link>
              <button
                type="button"
                onClick={() => setDiagnosticsOpen((open) => !open)}
                aria-expanded={diagnosticsOpen}
                aria-controls="cz404-diagnostics"
                className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-all hover:border-neon-cyan/60 hover:text-neon-cyan"
              >
                {diagnosticsOpen ? 'Cerrar diagnóstico' : 'Abrir diagnóstico'}
              </button>
            </div>

            {/* Diagnóstico del nodo (easter egg) */}
            {diagnosticsOpen ? (
              <div
                id="cz404-diagnostics"
                className="rounded-xl border border-neon-cyan/20 bg-black/60 p-5 text-left font-mono text-[10px] md:text-xs leading-relaxed text-neon-cyan/70 space-y-1"
              >
                {BOOT_LOG.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {log.map((line, index) => (
                  <p key={`${line}-${index}`} className="text-neon-green/90">
                    {line}
                  </p>
                ))}
                <p className="pt-2 text-white/40">
                  pista: escribe <span className="text-neon-cyan">ciszu</span>, <span className="text-neon-cyan">help</span>{' '}
                  o <span className="text-neon-cyan">home</span>
                  <span className="cz404-cursor inline-block ml-1 text-neon-cyan" aria-hidden>
                    _
                  </span>
                </p>
              </div>
            ) : null}
          </div>

          {/* Barra de estado */}
          <div className="flex items-center gap-4 border-t border-neon-cyan/20 bg-neon-cyan/5 px-4 py-2.5 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span className="truncate">sistema: ciszunetwork v2026</span>
            <span className="hidden md:inline truncate">sesión: anónima</span>
            <button
              type="button"
              onClick={() => setDiagnosticsOpen((open) => !open)}
              aria-label="Activar consola de diagnóstico oculta"
              className="ml-auto shrink-0 text-neon-cyan/30 transition-colors hover:text-neon-cyan"
              title=">_"
            >
              &gt;_
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
