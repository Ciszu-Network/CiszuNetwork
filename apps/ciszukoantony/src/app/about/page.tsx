'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const timeline = [
  { year: '2022', event: 'Started software development and created personal projects.' },
  { year: '2023', event: 'Founded <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand font-bold hover:text-brand-200 transition-colors">Ciszuko Network</a>. First bots and digital tools.' },
  { year: '2024', event: 'Expanded across multiple platforms: Minecraft, Discord, Telegram, WhatsApp.' },
  { year: '2025', event: 'Launched <a href="https://muzicmania.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand font-bold hover:text-brand-200 transition-colors">MuzicMania</a> and grew the community.' },
  { year: '2026', event: 'Consolidated as CEO. New projects and a vision for the future.' },
];

const skills = [
  { name: 'TypeScript', level: 90 },
  { name: 'Node.js', level: 85 },
  { name: 'Next.js', level: 80 },
  { name: 'Python', level: 75 },
  { name: 'Java', level: 65 },
  { name: 'MongoDB', level: 80 },
  { name: 'Docker', level: 60 },
  { name: 'Linux', level: 70 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent mb-4">
            About Me
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Learn more about Ciszuko Antony (Francisco Garcia Antonio M. / y8)</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-white/5 border border-white/10 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src="/images/francisco_selfie/cisco (1).png"
              alt="Ciszuko Antony"
              width={128} height={128}
              className="rounded-full object-cover shrink-0 border-2 border-brand/30"
            />
            <div>
              <h2 className="text-2xl font-header font-bold text-white mb-3">Ciszuko Antony (Francisco Garcia Antonio M. / y8)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                CEO &amp; Founder of{' '}
                <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">
                  Ciszuko Network
                </a>. Full-stack developer passionate about technology,
                innovation and creating unique digital experiences. My mission is to build
                tools and platforms that connect people and empower creativity.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Based in Venezuela, I work on projects ranging from Minecraft servers
                to messaging bots, modern web applications and CLI tools.
                Every project is an opportunity to learn, innovate and share with the community.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{s.name}</span>
                  <span className="text-brand font-bold">{s.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: `${s.level}%` }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-200"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-brand via-brand-200 to-transparent" />
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-brand border-2 border-black" />
                  <span className="text-sm font-bold text-brand">{t.year}</span>
                  <p className="text-gray-400 text-sm mt-1" dangerouslySetInnerHTML={{ __html: t.event }} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
