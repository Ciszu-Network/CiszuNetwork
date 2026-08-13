'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/lib/usePageTitle';

const certificates = [
  { name: 'JavaScript Algorithms and Data Structures', issuer: 'freeCodeCamp', year: '2024', color: 'from-green-500 to-green-700' },
  { name: 'Responsive Web Design', issuer: 'freeCodeCamp', year: '2024', color: 'from-blue-400 to-blue-600' },
  { name: 'Back End Development and APIs', issuer: 'freeCodeCamp', year: '2024', color: 'from-yellow-500 to-orange-600' },
  { name: 'Fundamentos de Node.js', issuer: 'Platzi', year: '2024', color: 'from-green-400 to-emerald-600' },
  { name: 'Desarrollo Web Completo', issuer: 'Udemy', year: '2023', color: 'from-purple-500 to-pink-600' },
  { name: 'TypeScript Avanzado', issuer: 'Platzi', year: '2024', color: 'from-blue-500 to-indigo-700' },
  { name: 'Docker y Contenedores', issuer: 'Udemy', year: '2025', color: 'from-cyan-400 to-blue-600' },
  { name: 'Python para Data Science', issuer: 'freeCodeCamp', year: '2025', color: 'from-yellow-400 to-orange-500' },
];

export default function CertificatesPage() {
  usePageTitle('CERTIFICATES');
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Certificates
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Training & academic achievements</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} mb-4`} />
              <h3 className="text-base font-header font-bold text-white mb-2 group-hover:text-brand transition-colors">{c.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">{c.issuer}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">{c.year}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
        >
          <p className="text-gray-500 text-sm">
            Always learning. New certificates will be added soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
