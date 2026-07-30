"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SYMBOLS = ["♪", "♫", "♬", "♩", "||", "::", ">>"];

export function FloatingSymbols() {
  const [symbols, setSymbols] = useState<{ id: number; x: number; delay: number; duration: number; text: string }[]>([]);

  useEffect(() => {
    const newSymbols = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 10,
      text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }));
    setSymbols(newSymbols);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-20">
      {symbols.map((s) => (
        <motion.div
          key={s.id}
          initial={{ y: "110vh", opacity: 0, rotate: 0 }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.2, 0.2, 0],
            rotate: 360,
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "linear",
          }}
          className="absolute text-neon-blue font-bold text-2xl"
          style={{ left: `${s.x}%` }}
        >
          {s.text}
        </motion.div>
      ))}
    </div>
  );
}
