"use client";

import { useEffect, useRef, useState } from "react";

/**
 * /youareanidiot — "test funny" de Ciszu Network.
 * Imita el famoso virus de antaño: fullscreen forzado, fondo blanco/negro
 * intermitente, caras SVG, música de circo + risas (Web Audio API), spam de
 * mensajes y ventanas que se abren/cierran. NO es oficial.
 */

const PHRASES = [
  "YOU ARE AN IDIOT",
  "You are an idiot",
  "YOU ARE AN IDIOT!",
  "you are an idiot",
  "STOP",
  "HA HA HA",
  "you are an idiot :)",
];

const IDIOT_SPAM = [
  "YOU ARE AN IDIOT",
  "you are an idiot",
  "IDIOT",
  "HA HA HA",
  "LOL",
  "dumb",
  "fool",
];

// Cara feliz (contorno para verse sobre cualquier fondo).
function HappyFace({ dark }: { dark: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <svg viewBox="0 0 100 100" width="120" height="120" fill="none">
      <circle cx="50" cy="50" r="46" stroke={c} strokeWidth="5" />
      <circle cx="34" cy="42" r="6" fill={c} />
      <circle cx="66" cy="42" r="6" fill={c} />
      <path d="M28 62 Q50 84 72 62" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Cara riéndose de ti (boca abierta, ojos felices).
function LaughingFace({ dark }: { dark: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <svg viewBox="0 0 100 100" width="120" height="120" fill="none">
      <circle cx="50" cy="50" r="46" stroke={c} strokeWidth="5" />
      <path d="M34 40 q-2 -4 0 -6" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M66 40 q-2 -4 0 -6" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M32 62 Q50 92 68 62" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="70" r="4" fill={c} />
    </svg>
  );
}

interface SpamMsg { id: number; text: string; x: number; y: number; rot: number; size: number }

interface FakeWindow { id: number; x: number; y: number; w: number; h: number }

export default function YouAreAnIdiotPage() {
  const [bg, setBg] = useState("#000000");
  const [dark, setDark] = useState(true);
  const [laugh, setLaugh] = useState(false);
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [spam, setSpam] = useState<SpamMsg[]>([]);
  const [windows, setWindows] = useState<FakeWindow[]>([]);
  const phraseIdx = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const spamId = useRef(0);
  const winId = useRef(0);
  const fsRef = useRef(false);

  // ── Pantalla completa forzada: si el usuario intenta salir, vuelve. ──
  useEffect(() => {
    const enter = () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
      }
    };
    enter();
    const onFsChange = () => {
      fsRef.current = !!document.fullscreenElement;
      // Si salió (Esc/gesto), lo devolvemos en cuanto el cambio termine.
      if (!document.fullscreenElement) {
        window.setTimeout(enter, 120);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "F11") {
        e.preventDefault();
        window.setTimeout(enter, 80);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  // ── Fondo intermitente blanco/negro (rápido) ──
  useEffect(() => {
    const iv = window.setInterval(() => {
      setDark((d) => {
        const next = !d;
        setBg(next ? "#000000" : "#ffffff");
        setLaugh(next ? Math.random() > 0.5 : Math.random() > 0.5);
        return next;
      });
    }, 260);
    return () => window.clearInterval(iv);
  }, []);

  // ── Frases alternando ──
  useEffect(() => {
    const iv = window.setInterval(() => {
      phraseIdx.current = (phraseIdx.current + 1) % PHRASES.length;
      setPhrase(PHRASES[phraseIdx.current]);
    }, 600);
    return () => window.clearInterval(iv);
  }, []);

  // ── Spam de "you are an idiot" por toda la pantalla ──
  useEffect(() => {
    const spawn = () => {
      const n = 3 + Math.floor(Math.random() * 4);
      const batch: SpamMsg[] = [];
      for (let i = 0; i < n; i++) {
        batch.push({
          id: ++spamId.current,
          text: IDIOT_SPAM[Math.floor(Math.random() * IDIOT_SPAM.length)],
          x: Math.random() * 90,
          y: Math.random() * 90,
          rot: Math.random() * 60 - 30,
          size: 14 + Math.random() * 42,
        });
      }
      setSpam((prev) => [...prev, ...batch]);
    };
    spawn();
    const iv = window.setInterval(spawn, 500);
    const cleanup = window.setInterval(() => {
      setSpam((prev) => prev.filter((m) => Date.now() - m.id * 1000 < 4000));
    }, 1000);
    return () => { window.clearInterval(iv); window.clearInterval(cleanup); };
  }, []);

  // ── Ventanas falsas que se abren y cierran ──
  useEffect(() => {
    const open = () => {
      setWindows((prev) => [...prev, {
        id: ++winId.current,
        x: 5 + Math.random() * 70,
        y: 5 + Math.random() * 70,
        w: 120 + Math.random() * 200,
        h: 80 + Math.random() * 140,
      }]);
    };
    const iv = window.setInterval(open, 700);
    const close = window.setInterval(() => {
      setWindows((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
    }, 900);
    return () => { window.clearInterval(iv); window.clearInterval(close); };
  }, []);

  // ── Audio: música de circo + risas (Web Audio API, autocontenido) ──
  useEffect(() => {
    const start = () => {
      if (!audioCtx.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx.current = new Ctx();
      }
      const ctx = audioCtx.current;
      // Risa: ráfagas cortas de tonos ascendentes.
      const laughNow = () => {
        for (let i = 0; i < 5; i++) {
          const t = ctx.currentTime + i * 0.12;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(500 + i * 60, t);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          osc.connect(g).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
        }
      };
      // Melodía de circo: secuencia "calliope" repetida.
      const circus = () => {
        const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440];
        notes.forEach((f, i) => {
          const t = ctx.currentTime + i * 0.16;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          osc.connect(g).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.16);
        });
        window.setTimeout(circus, 1450);
      };
      circus();
      const laughIv = window.setInterval(laughNow, 1200);
      return () => window.clearInterval(laughIv);
    };
    // El autoplay requiere un gesto del usuario; usamos el primer click/tap.
    const onFirst = () => { start(); };
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
      audioCtx.current?.close().catch(() => {});
    };
  }, []);

  const textColor = dark ? "#fff" : "#000";
  const opposite = dark ? "#000" : "#fff";

  return (
    <main
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: bg, transition: "background 0.12s linear", cursor: "pointer" }}
      onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
    >
      {/* Mensajes spam por toda la pantalla */}
      {spam.map((m) => (
        <span
          key={m.id}
          className="absolute font-black uppercase pointer-events-none"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            transform: `rotate(${m.rot}deg)`,
            fontSize: m.size,
            color: textColor,
            fontFamily: "Arial Black, Impact, sans-serif",
            textShadow: `0 0 8px ${opposite}`,
            animation: "yid-fade 0.5s ease-in-out",
          }}
        >
          {m.text}
        </span>
      ))}

      {/* Ventanas falsas abriéndose/cerrándose */}
      {windows.map((w) => (
        <div
          key={w.id}
          className="absolute pointer-events-none"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            width: w.w,
            height: w.h,
            border: `3px solid ${textColor}`,
            background: `${opposite}cc`,
            animation: "yid-window 0.5s ease-in-out",
          }}
        >
          <div
            style={{
              height: 22,
              background: textColor,
              color: opposite,
              fontSize: 11,
              fontFamily: "monospace",
              paddingLeft: 6,
              lineHeight: "22px",
              fontWeight: 700,
            }}
          >
            YouAreAnIdiot.exe
          </div>
        </div>
      ))}

      {/* Contenido central: frase + caras SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <h1
          className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-center"
          style={{
            color: textColor,
            textShadow: `0 0 10px ${opposite}, 0 0 30px ${opposite}`,
            fontFamily: "Arial Black, Impact, sans-serif",
            animation: "youareidiot-wobble 0.18s ease-in-out infinite alternate",
          }}
        >
          {phrase}
        </h1>
        <div className="flex gap-6 items-center">
          {laugh ? (
            <LaughingFace dark={dark} />
          ) : (
            <HappyFace dark={dark} />
          )}
          <div style={{ transform: "scaleX(-1)" }}>
            {laugh ? <LaughingFace dark={dark} /> : <HappyFace dark={dark} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes youareidiot-wobble { from { transform: rotate(-5deg) scale(1); } to { transform: rotate(5deg) scale(1.1); } }
        @keyframes yid-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes yid-window { from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </main>
  );
}