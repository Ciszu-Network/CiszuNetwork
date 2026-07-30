'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const team = [
  { name: 'Ciszuko Antony (Francisco Garcia Antonio M. / y8)', role: 'CEO & Founder', desc: 'Created Ciszuko Network. Full-stack developer and leader of innovative projects.', photo: '/images/francisco_selfie/cisco (2).png' },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent mb-4">
            Team
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Meet the founders</p>
        </motion.div>

        <div className="flex justify-center">
          {team.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 text-center"
            >
              <Image
                src={m.photo}
                alt={m.name}
                width={120} height={120}
                className="rounded-full object-cover mx-auto mb-6 border-2 border-brand/30 w-28 h-28"
              />
              <h3 className="text-xl font-header font-bold text-white mb-2">{m.name}</h3>
              <p className="text-brand text-sm font-bold mb-4">{m.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
