'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';
import Link from 'next/link';

const DONATION_OPTIONS = [
  {
    name: 'Patreon',
    href: 'https://www.patreon.com/cw/ciszukoantony',
    desc: 'Suscripción mensual con recompensas exclusivas',
    color: 'from-[#FF424D] to-[#FF6B81]',
  },
  {
    name: 'Ko-fi',
    href: 'https://ko-fi.com/ciszukoantony',
    desc: 'Compra un café a CiszukoAntony',
    color: 'from-[#29ABE0] to-[#5BC0DE]',
  },
  {
    name: 'Buy Me a Coffee',
    href: 'https://buymeacoffee.com/ciszukoantony',
    desc: 'Donación única, sin suscripción',
    color: 'from-[#FFDD00] to-[#FFE066]',
  },
];

export default function DonationPage() {
  usePageTitle('DONATION');

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[180px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-32 space-y-16">
        <motion.header
          id="hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative space-y-8 pt-12 text-center"
        >
          <div className="flex items-center justify-center gap-6 group">
            <div className="w-12 h-12 text-neon-pink flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black] whitespace-nowrap">
              DONACIONES
            </h1>
          </div>
          <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
            Apoya el desarrollo de MuzicMania
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="soft-card rounded-3xl p-8 border border-border">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-ink mb-4">
                ¿Por qué donar?
              </h2>
              <p className="text-muted max-w-2xl mx-auto leading-relaxed">
                MuzicMania es un proyecto sin ánimo de lucro desarrollado por Ciszuko Antony.
                Tu apoyo ayuda a mantener los servidores, mejorar la experiencia de juego y
                agregar nuevas funcionalidades.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {DONATION_OPTIONS.map((option, i) => (
                <motion.a
                  key={option.name}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-pink/50 transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${option.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} mb-4 opacity-80 group-hover:scale-110 transition-transform flex items-center justify-center`}>
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-header font-bold text-white mb-2 group-hover:text-neon-pink transition-colors">
                    {option.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {option.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
                    Donar
                    <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
