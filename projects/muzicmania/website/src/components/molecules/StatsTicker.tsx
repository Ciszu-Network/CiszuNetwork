"use client";

import { motion } from "framer-motion";
import { Icon } from "@ciszu/ui";
import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";

export function StatsTicker() {
  const [stats, setStats] = useState([
    { label: "JUGADORES ACTIVOS", value: "0", icon: 'users' },
    { label: "PARTIDAS HOY", value: "0", icon: 'gamepad' },
    { label: "RÉCORD GLOBAL", value: "0", icon: 'trophy' },
    { label: "USUARIOS TOTALES", value: "0", icon: 'star' },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Usuarios Totales
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        // Partidas Hoy (Simulado por ahora o desde tabla scores)
        const { count: matchCount } = await supabase
          .from('scores')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

        // Récord Global
        const { data } = await supabase
          .from('scores')
          .select('score')
          .order('score', { ascending: false })
          .limit(1);
        const topScore = data?.[0];

        // Usuarios Activos (últimas 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', yesterday); // Asumiendo actividad reciente o nuevos registros

        setStats([
          { label: "JUGADORES ACTIVOS", value: (activeCount || 0).toString(), icon: 'users' },
          { label: "PARTIDAS HOY", value: (matchCount || 0).toString(), icon: 'gamepad' },
          { label: "RÉCORD GLOBAL", value: (topScore?.score || 0).toLocaleString(), icon: 'trophy' },
          { label: "USUARIOS TOTALES", value: (userCount || 0).toString(), icon: 'star' },
        ]);
      } catch (err) {
        console.error('[StatsTicker] Error cargando estadísticas:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative w-full bg-neon-blue/5 border-y border-neon-blue/10 py-4 overflow-hidden shadow-[inset_0_0_20px_rgba(0,212,255,0.05)]">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...stats, ...stats, ...stats].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 px-12 text-white font-header font-bold text-lg">
            <Icon name={stat.icon} className="text-neon-blue w-6 h-6" />
            <span>
              {stat.label}: <span className="text-neon-pink drop-shadow-neon-pink">{stat.value}</span>
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
