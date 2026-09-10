'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuickDocks from '@/components/molecules/QuickDocks';
import { supabase } from "@/config/supabase";
import { Icon } from "@ciszu/ui";
import { usePageTitle } from '@/lib/usePageTitle';

type Stats = {
  visitors: number;
  page_views: number;
  reviews_count: number;
  tickets_open: number;
  avg_rating: number;
  updated_at: string;
};

type StatCard = {
  key: keyof Stats;
  label: string;
  sub: string;
  icon: string;
  format?: (value: string | number) => string;
};

const statCards: StatCard[] = [
  { key: 'visitors', label: 'Visitantes', sub: 'Visitors', icon: 'users' },
  { key: 'page_views', label: 'Vistas', sub: 'Page views', icon: 'flame' },
  { key: 'reviews_count', label: 'Reseñas', sub: 'Reviews', icon: 'star' },
  { key: 'tickets_open', label: 'Tickets abiertos', sub: 'Open tickets', icon: 'warning' },
  { key: 'avg_rating', label: 'Rating promedio', sub: 'Average rating', icon: 'verified' },
  { key: 'updated_at', label: 'Última actualización', sub: 'Last updated', icon: 'clock', format: (value) => new Date(value as string).toLocaleString() },
];

export default function StatsPage() {
  usePageTitle('STATS');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ciszukoantony_stats')
      .select('visitors, page_views, reviews_count, tickets_open, avg_rating, updated_at')
      .single();

    if (data) {
      setStats({
        visitors: data.visitors || 0,
        page_views: data.page_views || 0,
        reviews_count: data.reviews_count || 0,
        tickets_open: data.tickets_open || 0,
        avg_rating: data.avg_rating || 0,
        updated_at: data.updated_at || new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20V14" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Stats
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Estadísticas del ecosistema / Ecosystem statistics
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-brand-light border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Cargando métricas...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((s) => (
              <div key={s.key} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 text-center hover:border-brand-light/30 transition-all">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 text-brand-light mb-3">
                  <Icon name={s.icon} size={20} />
                </div>
                <div className="text-4xl md:text-5xl font-header font-black text-brand-light mb-2">
                  {s.format ? s.format(stats[s.key] as string) : s.key === 'avg_rating' ? (stats[s.key] as number).toFixed(1) : (stats[s.key] as number).toLocaleString()}
                </div>
                <div className="text-white font-bold text-sm mb-1">{s.label}</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest">{s.sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 text-sm">No hay métricas disponibles aún.</p>
          </div>
        )}
      </div>

      <QuickDocks />
    </div>
  );
}
