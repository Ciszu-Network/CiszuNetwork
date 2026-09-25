'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * 404 de Ciszuko Antony — estética de "pérdida de señal / portfolio fuera de
 * aire": ruido de TV, bandas de distorsión, coordenadas y glitch rosa.
 *
 * Animaciones solo CSS (con `prefers-reduced-motion`). Easter egg propio:
 * un certificado oficial de pérdida de señal con contador y chistes que se
 * regeneran al pulsar.
 */

const COORDINATES = '11.4045° N · 69.6739° W — CORO, FALCÓN, VE';

const JOKES = [
  'El cable de fibra soñaba con ser inalámbrico. Lo consiguió.',
  'Tu paquete viajó seguro: llegó a un 404 con vistas al mar.',
  '401 no autorizado, 403 prohibido y 404 de paseo. Hoy toca el de paseo.',
  'El DNS dijo que conocía esta ruta, pero nunca fue a su casa.',
  'La señal no se perdió: está en modo incógnito.',
  'El router pidió vacaciones y nadie aprobó la solicitud.',
];

export default function NotFound() {
  const [losses, setLosses] = useState(0);
  const [jokeIndex, setJokeIndex] = useState(0);
  const [certificateOpen, setCertificateOpen] = useState(false);

  const registerLoss = () => {
    setLosses((count) => count + 1);
    setJokeIndex((index) => (index + 1) % JOKES.length);
    setCertificateOpen(true);
  };

  const rely = String(losses).padStart(4, '0');

  return (
    <section className="relative flex min-h-[80vh] w-full select-none items-center justify-center overflow-hidden bg-black px-4 py-16">
      <style>{`
        .cztv-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
          animation: cztv-noise 0.55s steps(4) infinite;
        }
        @keyframes cztv-noise {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(1%, -2%); }
          75% { transform: translate(-1%, 2%); }
          100% { transform: translate(2%, -1%); }
        }
        .cztv-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 51, 204, 0.05) 0px,
            rgba(255, 51, 204, 0.05) 1px,
            transparent 1px,
            transparent 4px
          );
        }
        .cztv-band {
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(255, 51, 204, 0.35), rgba(104, 207, 255, 0.25), transparent);
          animation: cztv-band 6s linear infinite;
        }
        @keyframes cztv-band {
          0% { transform: translateY(-40px) scaleX(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(85vh) scaleX(1.1); opacity: 0; }
        }
        .cztv-glitch { position: relative; display: inline-block; }
        .cztv-glitch::before,
        .cztv-glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cztv-glitch::before {
          left: 3px;
          color: #ff33cc;
          clip-path: inset(0 0 55% 0);
          animation: cztv-slice-a 3.1s infinite linear alternate-reverse;
        }
        .cztv-glitch::after {
          left: -3px;
          color: #5a82e8;
          clip-path: inset(45% 0 0 0);
          animation: cztv-slice-b 2.4s infinite linear alternate-reverse;
        }
        @keyframes cztv-slice-a {
          0% { clip-path: inset(0 0 90% 0); transform: translate(-4px, 1px); }
          15% { clip-path: inset(20% 0 66% 0); transform: translate(4px, -1px); }
          30% { clip-path: inset(54% 0 28% 0); transform: translate(-3px, 2px); }
          45% { clip-path: inset(10% 0 80% 0); transform: translate(3px, -2px); }
          60% { clip-path: inset(72% 0 12% 0); transform: translate(-4px, 1px); }
          78% { clip-path: inset(34% 0 50% 0); transform: translate(4px, -1px); }
          100% { clip-path: inset(0 0 90% 0); transform: translate(-4px, 1px); }
        }
        @keyframes cztv-slice-b {
          0% { clip-path: inset(62% 0 16% 0); transform: translate(4px, -1px); }
          18% { clip-path: inset(28% 0 58% 0); transform: translate(-4px, 1px); }
          36% { clip-path: inset(6% 0 88% 0); transform: translate(3px, -2px); }
          54% { clip-path: inset(76% 0 8% 0); transform: translate(-3px, 2px); }
          72% { clip-path: inset(44% 0 40% 0); transform: translate(4px, -1px); }
          100% { clip-path: inset(62% 0 16% 0); transform: translate(4px, -1px); }
        }
        .cztv-jitter { animation: cztv-jitter 7s infinite; }
        @keyframes cztv-jitter {
          0%, 88%, 100% { transform: translate(0, 0); }
          89% { transform: translate(-2px, 1px); }
          90% { transform: translate(2px, -1px); }
          91% { transform: translate(-1px, -1px); }
          92% { transform: translate(1px, 1px); }
        }
        .cztv-blink { animation: cztv-blink 1.1s steps(1) infinite; }
        @keyframes cztv-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.15; }
        }
        .cztv-bar { animation: cztv-bars 1.4s ease-in-out infinite; transform-origin: bottom; }
        @keyframes cztv-bars {
          0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .cztv-static { animation: cztv-static 0.2s steps(2) infinite; }
        @keyframes cztv-static {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(1px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cztv-noise,
          .cztv-band,
          .cztv-glitch::before,
          .cztv-glitch::after,
          .cztv-jitter,
          .cztv-blink,
          .cztv-bar,
          .cztv-static { animation: none !important; }
        }
      `}</style>

      {/* Ruido, scanlines y bandas de distorsión */}
      <div className="pointer-events-none absolute inset-0 cztv-noise opacity-[0.09]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 cztv-scanlines opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 cztv-band" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 cztv-band" style={{ animationDelay: '2.8s' }} aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.9) 100%)' }}
      />

      <div className="cztv-jitter relative z-10 w-full max-w-2xl text-center">
        {/* Indicador de emisión */}
        <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-5 py-2">
          <span className="cztv-blink h-2 w-2 rounded-full bg-neon-pink" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-neon-pink">
            Transmisión interrumpida
          </span>
        </div>

        {/* Glitch 404 */}
        <h1
          className="cztv-glitch cztv-static font-header text-[6rem] font-black uppercase leading-none tracking-tighter text-white md:text-[10rem]"
          data-text="404"
          aria-label="Error 404"
        >
          404
        </h1>

        <div className="mt-6 inline-flex items-center gap-3 border border-white/15 bg-white/5 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.35em] text-white/60">
          <span className="text-neon-pink">SIG_LOST_404</span>
          <span aria-hidden>{'//'}</span>
          <span>sin operador</span>
        </div>

        <h2 className="mt-8 font-header text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">
          Portfolio fuera de línea
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/50">
          La señal de esta ruta se perdió entre el ruido: el enlace no forma parte del portafolio o fue movido de
          frecuencia. Reestablece la conexión para volver a la emisión principal.
        </p>

        {/* Coordenadas y último ping */}
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
          {COORDINATES} <span className="mx-2 text-neon-pink/70">|</span> último ping: hace 404 s
        </p>

        {/* Barras de señal fluctuando */}
        <div className="mt-8 flex items-end justify-center gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((bar) => (
            <span
              key={bar}
              className="cztv-bar block w-2 rounded-sm bg-neon-pink/80"
              style={{ height: `${12 + bar * 7}px`, animationDelay: `${bar * 0.18}s` }}
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-neon-pink/70">
          Reconectando<span className="cztv-blink">...</span>
        </p>

        {/* Acciones */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl border-2 border-neon-pink bg-neon-pink/10 px-8 py-4 font-header text-sm font-black uppercase tracking-[0.2em] text-neon-pink transition-all hover:bg-neon-pink hover:text-black hover:shadow-[0_0_30px_rgba(255,51,204,0.5)]"
          >
            <span aria-hidden className="font-mono">
              &#9679;
            </span>
            Reestablecer señal
          </Link>
          <button
            type="button"
            onClick={registerLoss}
            aria-expanded={certificateOpen}
            aria-controls="cztv-certificate"
            className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-all hover:border-neon-pink/60 hover:text-neon-pink"
          >
            ¿Perdiste algo?
          </button>
        </div>

        {/* Certificado de pérdida (easter egg) */}
        {certificateOpen ? (
          <div
            id="cztv-certificate"
            className="mx-auto mt-10 max-w-xl rounded-2xl border-2 border-dashed border-neon-pink/50 bg-black/70 p-6 text-left shadow-[0_0_40px_rgba(255,51,204,0.15)] md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-pink/70">
                  Certificado oficial de pérdida de señal
                </p>
                <p className="mt-1 font-header text-lg font-black uppercase tracking-tight text-white">
                  Serie CK-404-{rely}
                </p>
              </div>
              <span className="flex h-14 w-14 shrink-0 rotate-12 items-center justify-center rounded-full border-2 border-neon-pink/70 text-center font-mono text-[8px] font-black uppercase leading-tight text-neon-pink/80">
                Pérdida
                <br />
                oficial
              </span>
            </div>

            <p className="mt-5 font-mono text-[11px] leading-relaxed text-white/60">“{JOKES[jokeIndex]}”</p>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
              <span>pérdidas registradas: {losses}</span>
              <button
                type="button"
                onClick={registerLoss}
                className="self-start rounded-lg border border-neon-pink/40 px-4 py-2 font-bold text-neon-pink/80 transition-all hover:bg-neon-pink/10 hover:text-neon-pink sm:self-auto"
              >
                Regenerar certificado
              </button>
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">
              Válido únicamente en esta frecuencia.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
