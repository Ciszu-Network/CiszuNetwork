'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SmartImage } from '@ciszu/ui';
import { assetResolver } from '@ciszunetwork/cdn';
import { SOCIALS, I } from '@/config/navigation';
import { usePageTitle } from '@/lib/usePageTitle';

const projects = [
  { name: 'MuzicMania', desc: 'Web-based rhythm game with neon futuristic aesthetic.', href: 'https://muzicmania.vercel.app', color: 'from-pink-500 to-rose-700' },
  { name: 'Ciszuko CLI', desc: 'CLI tool to automate development and deployment workflows.', href: '#', color: 'from-brand-300 to-neon-cyan' },
  { name: 'Open Source', desc: 'Open source contributions & projects for the community.', href: 'https://github.com/Ciszu-Network', color: 'from-neon-pink to-neon-orange' },
];

const featuredProjects = [
  { name: 'Minecraft Network', desc: 'Minecraft server with unique modes, economy & active community.', tag: 'Minecraft', color: 'from-green-500 to-green-700' },
  { name: 'Discord Bot', desc: 'Multi-purpose bot with moderation, music & games.', tag: 'Discord', color: 'from-indigo-500 to-purple-700' },
  { name: 'WhatsApp Bot', desc: 'Smart automation & tools for WhatsApp.', tag: 'WhatsApp', color: 'from-green-400 to-emerald-600' },
  { name: 'Telegram Bot', desc: 'Admin system & entertainment Telegram bot.', tag: 'Telegram', color: 'from-blue-400 to-cyan-600' },
];

const stats = [
  { label: 'Projects', value: '15+', icon: I.projects },
  { label: 'Users', value: '1K+', icon: I.team },
  { label: 'Repos', value: '20+', icon: I.certificates },
  { label: 'Years Exp.', value: '3+', icon: I.about },
];

export default function HomeContent() {
  usePageTitle('HOME');
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(35,63,146,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(35,63,146,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(35,63,146,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="sr-only">Ciszuko Antony — Portfolio y CEO & Founder de Ciszuko Network</h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link href="/" aria-label="Ciszuko Antony — Inicio" className="flex items-center justify-center gap-4 md:gap-6 mb-6 flex-wrap group cursor-pointer">
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"
                alt="Ciszuko Antony" width={110} height={98}
                className="drop-shadow-brand animate-float shrink-0 group-hover:drop-shadow-[0_0_35px_rgba(90,130,232,0.8)] transition-all duration-500"
                fetchPriority="high"
              />
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png"
                alt="Ciszuko Antony" width={340} height={85}
                className="drop-shadow-brand max-w-[60vw] shrink-0 group-hover:drop-shadow-[0_0_40px_rgba(90,130,232,0.9)] transition-all duration-500 animate-float-delayed"
                fetchPriority="high"
              />
              <SmartImage
                src="projects/ciszukoantony/content/assets/youtube_canal.png"
                alt="Ciszuko Antony — Canal de YouTube" width={100} height={100}
                className="rounded-full ring-2 ring-brand/40 shadow-[0_0_25px_rgba(167,139,250,0.35)] group-hover:shadow-[0_0_40px_rgba(167,139,250,0.6)] transition-all duration-500 shrink-0"
                fetchPriority="high"
              />
            </Link>

            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              CEO & Founder of{' '}
              <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">
                Ciszuko Network
              </a>
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-sm uppercase tracking-widest">
              Innovation · Development · Technology
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/projects" className="group px-8 py-4 bg-brand/10 border-2 border-brand/50 text-brand font-bold rounded-xl hover:bg-brand hover:text-white transition-all hover:scale-105 flex items-center gap-2">
                {I.projects}
                <span>VIEW PROJECTS</span>
              </Link>
              <Link href="/contact" className="group px-8 py-4 bg-white/5 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105 flex items-center gap-2">
                {I.contact}
                <span>CONTACT</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand/30 transition-all hover:-translate-y-1"
              >
                <div className="flex justify-center mb-3 text-brand/60 group-hover:text-brand transition-colors">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-header font-black text-brand mb-1">{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-projects" className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent uppercase">
              Featured Projects
            </h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest mt-4">Exploring new frontiers</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProjects.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-gradient-to-r ${p.color} text-xs font-bold text-white`}>
                  {p.tag}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} mb-4 opacity-80 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-header font-bold text-white mb-2 group-hover:text-brand transition-colors">{p.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-header font-black tracking-tighter bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent uppercase">
              Projects
            </h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest mt-4">Building the future, one project at a time</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <motion.a key={i} href={p.href} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color} mb-6 group-hover:scale-110 transition-transform`} />
                <h3 className="text-2xl font-header font-bold text-white mb-3 group-hover:text-brand transition-colors">{p.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </motion.a>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
            <Link href="/projects" className="group inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-gray-300 font-bold rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105 text-sm">
              <span>View all projects</span>
              <span className="group-hover:translate-x-1 transition-transform">{I.chevronRight}</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-header font-black tracking-tighter bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent uppercase">
              About Me
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl bg-white/5 border border-white/10"
          >
            <Image
              src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg')}
              alt="Ciszuko Antony"
              width={140} height={140}
              className="rounded-full object-cover shrink-0 border-2 border-brand/30"
            />
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                I&apos;m <span className="text-brand font-bold">Ciszuko Antony</span> (Francisco Garcia Antonio M. / y8), 
                CEO & Founder of{' '}
                <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">
                  Ciszuko Network
                </a>. 
                Passionate about technology, software development, and creating innovative digital experiences. 
                I lead projects that merge creativity, code, and community to build the future of the web.
              </p>
              <Link href="/about" className="group inline-flex items-center gap-2 px-6 py-3 bg-brand/10 border-2 border-brand/50 text-brand font-bold rounded-xl hover:bg-brand hover:text-white transition-all hover:scale-105 text-sm">
                <span>More about me</span>
                <span className="group-hover:translate-x-1 transition-transform">{I.chevronRight}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent uppercase mb-8">
              Connect With Me
            </h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">Follow me on social media</p>
            <div className="flex flex-wrap justify-center gap-4">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="group w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/50 transition-all hover:scale-110 hover:shadow-lg hover:shadow-brand/20"
                  title={s.name}
                >
                  <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}