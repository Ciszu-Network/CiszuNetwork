'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';

export default function LeaderboardPage() {
  usePageTitle('LEADERBOARD');
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Ranking de jugadores / Player rankings
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-gray-400 text-sm leading-relaxed">
            Próximamente: tablas de clasificación y rankings.
            <br />
            Coming soon: leaderboards and rankings.
          </p>
        </motion.div>
      </div>

      <QuickDocks />
    </div>
  );
}
