'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Star({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white/50 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </motion.div>
  );
}

function FloatingIcon({ x, delay, duration, opacity, children }: { x: number; delay: number; duration: number; opacity: number; children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, bottom: '-8%' }}
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{ y: '-115vh', opacity: [0, opacity, opacity, 0], scale: [0.5, 1, 1, 0.5] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      <div className="drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
        {children}
      </div>
    </motion.div>
  );
}

export default function FddpPage() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);
  const [floatIcons, setFloatIcons] = useState<{ id: number; x: number; size: number; delay: number; duration: number; opacity: number; icon: 'star' | 'trophy' | 'zap' }[]>([]);

  useEffect(() => {
    const s = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 12,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 4,
    }));
    setStars(s);

    const icons: { icon: 'star' | 'trophy' | 'zap'; size: number }[] = [
      { icon: 'star', size: 20 }, { icon: 'trophy', size: 24 }, { icon: 'zap', size: 18 },
      { icon: 'star', size: 16 }, { icon: 'trophy', size: 22 }, { icon: 'star', size: 18 },
    ];
    const f = Array.from({ length: 10 }, (_, i) => {
      const t = icons[i % icons.length];
      return {
        id: i,
        x: Math.random() * 100,
        size: t.size + Math.random() * 8,
        delay: Math.random() * 14,
        duration: 14 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.3,
        icon: t.icon,
      };
    });
    setFloatIcons(f);
  }, []);

  const iconSvgs = {
    star: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  };

  const iconColors = ['#f97316', '#fb923c', '#3b82f6', '#60a5fa', '#ea580c', '#2563eb'];

  return (
    <>
      <style>{`
        nav, footer { display: none !important; }
        main { padding-top: 0 !important; }
      `}</style>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 25% 20%, #172554 0%, transparent 60%), radial-gradient(ellipse at 75% 80%, #431407 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, #0f172a 0%, transparent 70%), #020617',
        }}
      >
        {/* Effects layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ambient gradient overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 60%, rgba(249,115,22,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Orbs */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent)' }}
            animate={{ x: ['-30%', '30%', '-30%'], y: ['-20%', '20%', '-20%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1), transparent)' }}
            animate={{ x: ['20%', '-20%', '20%'], y: ['30%', '-30%', '30%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full blur-[80px]"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent)' }}
            animate={{ x: ['-10%', '40%', '-10%'], y: ['-30%', '10%', '-30%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Light beams */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute h-[1px] w-full top-1/3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent)' }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-[1px] w-full top-2/3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent)' }}
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Floating stars */}
          {stars.map(s => (
            <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} duration={s.duration} />
          ))}

          {/* Floating icons */}
          {floatIcons.map(f => (
            <div key={f.id} style={{ color: iconColors[f.id % iconColors.length] }}>
              <FloatingIcon x={f.x} delay={f.delay} duration={f.duration} opacity={f.opacity}>
                <svg width={f.size} height={f.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  {f.icon === 'star' && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />}
                  {f.icon === 'trophy' && <>
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                  </>}
                  {f.icon === 'zap' && <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />}
                </svg>
              </FloatingIcon>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 max-w-2xl px-6 py-12">
          {/* Trophy icon */}
          <motion.div
            className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)] cursor-default"
            animate={{ scale: [1, 1.12, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.25, filter: 'brightness(1.5)', transition: { duration: 0.3 } }}
          >
            <svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-center cursor-default pr-4"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #f97316, #fb923c)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 25px rgba(59,130,246,0.35))',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.04, filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.6))', transition: { duration: 0.3 } }}
          >
            Feliz D&iacute;a del Padre
          </motion.h1>

          {/* Decorative line */}
          <div className="flex items-center gap-3 my-2">
            <motion.div
              className="w-12 sm:w-20 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6))' }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="text-blue-400/50 cursor-default"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              whileHover={{ scale: 1.4, color: '#f97316', opacity: 1, transition: { duration: 0.3 } }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
            <motion.div
              className="w-12 sm:w-20 h-[2px]"
              style={{ background: 'linear-gradient(270deg, transparent, rgba(249,115,22,0.6))' }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>

          {/* Letter content */}
          <div className="text-center space-y-4 max-w-lg mt-2 px-4">
            <motion.p
              className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-white/80 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ color: '#f97316', transition: { duration: 0.3 } }}
            >
              Gracias pap&aacute; por todo tu apoyo, tu esfuerzo y cada enseñanza que me has dado.
            </motion.p>
            <motion.p
              className="text-sm sm:text-base font-medium leading-relaxed text-white/50 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ color: '#60a5fa', transition: { duration: 0.3 } }}
            >
              Eres mi ejemplo a seguir, mi gu&iacute;a y mi mayor inspiraci&oacute;n. Este proyecto lleva tu apoyo en cada l&iacute;nea de c&oacute;digo.
            </motion.p>
            <motion.p
              className="text-sm sm:text-base font-medium leading-relaxed text-white/50 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              whileHover={{ color: '#60a5fa', transition: { duration: 0.3 } }}
            >
              Te amo con todo mi coraz&oacute;n. Feliz D&iacute;a del Padre.
            </motion.p>
          </div>

          {/* Signature */}
          <motion.div
            className="mt-4 text-center cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.p
              className="text-lg font-black uppercase tracking-[0.3em] cursor-default"
              style={{
                background: 'linear-gradient(135deg, #f97316, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.5))', transition: { duration: 0.3 } }}
            >
              — Tu hijo —
            </motion.p>
            <motion.p
              className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] mt-2"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              2026
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #020617, transparent)' }}
        />
      </div>
    </>
  );
}