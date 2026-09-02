"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#000000"];
const FACES = ["🙂", "🙃", "😄"];
const PHRASES = [
  "YOU ARE AN IDIOT",
  "You are an idiot",
  "YOU ARE AN IDIOT!",
  "you are an idiot",
];

export default function YouAreAnIdiotPage() {
  const [bg, setBg] = useState("#ff0000");
  const [faceIdx, setFaceIdx] = useState(0);
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const colorIdx = useRef(0);
  const phraseIdx = useRef(0);

  // Pantalla completa + bloqueo de salida (imitando el virus de antaño).
  useEffect(() => {
    const enterFs = () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
      }
    };
    enterFs();
    document.addEventListener("fullscreenchange", enterFs);
    return () => document.removeEventListener("fullscreenchange", enterFs);
  }, []);

  // Background intermitente.
  useEffect(() => {
    const iv = window.setInterval(() => {
      colorIdx.current = (colorIdx.current + 1) % COLORS.length;
      setBg(COLORS[colorIdx.current]);
    }, 400);
    return () => window.clearInterval(iv);
  }, []);

  // Caras felices rotando.
  useEffect(() => {
    const iv = window.setInterval(() => {
      setFaceIdx((i) => (i + 1) % FACES.length);
    }, 500);
    return () => window.clearInterval(iv);
  }, []);

  // Frases alternando.
  useEffect(() => {
    const iv = window.setInterval(() => {
      phraseIdx.current = (phraseIdx.current + 1) % PHRASES.length;
      setPhrase(PHRASES[phraseIdx.current]);
    }, 900);
    return () => window.clearInterval(iv);
  }, []);

  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: bg, transition: "background 0.15s linear", cursor: "pointer" }}
      onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
    >
      <h1
        className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-center select-none"
        style={{
          color: "#000",
          textShadow: "0 0 10px #fff, 0 0 30px #fff",
          fontFamily: "Arial Black, Impact, sans-serif",
          animation: "youareidiot-wobble 0.3s ease-in-out infinite alternate",
        }}
      >
        {phrase}
      </h1>
      <div className="mt-6 flex gap-8 text-6xl md:text-8xl select-none">
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ transform: `rotate(${(i - 1) * 12}deg)`, display: "inline-block" }}>
            {FACES[(faceIdx + i) % FACES.length]}
          </span>
        ))}
      </div>
      <style>{`@keyframes youareidiot-wobble { from { transform: rotate(-4deg) scale(1); } to { transform: rotate(4deg) scale(1.06); } }`}</style>
    </main>
  );
}