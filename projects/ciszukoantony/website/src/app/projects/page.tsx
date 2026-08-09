'use client';

import React from 'react';
import { SmartImage } from '@ciszu/ui';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Minecraft', color: 'from-green-500 to-green-700',
    projects: [
      { name: 'CiszukoCraft', desc: 'Servidor survival con economía, clanes y minijuegos personalizados.', tech: ['PaperMC', 'Java', 'MySQL'] },
      { name: 'SkyBlock Network', desc: 'SkyBlock con islas personalizadas y sistema de misiones.', tech: ['Spigot', 'Redis', 'MongoDB'] },
      { name: 'KitPvP Arena', desc: 'Arena PvP con kits únicos y sistema de rangos.', tech: ['PaperMC', 'Java'] },
    ],
  },
  {
    name: 'Discord', color: 'from-indigo-500 to-purple-700',
    projects: [
      { name: 'CiszuBot', desc: 'Bot multifuncional con moderación, música, economía y juegos.', tech: ['Discord.js', 'Node.js', 'MongoDB'] },
      { name: 'Ticket System', desc: 'Sistema avanzado de tickets para soporte en servidores.', tech: ['Discord.js', 'MySQL'] },
      { name: 'Leveling Bot', desc: 'Bot de niveles y experiencia con ranking y recompensas.', tech: ['Python', 'PostgreSQL'] },
    ],
  },
  {
    name: 'WhatsApp', color: 'from-green-400 to-emerald-600',
    projects: [
      { name: 'WA Manager', desc: 'Gestor de grupos y automatización para WhatsApp.', tech: ['Baileys', 'Node.js'] },
      { name: 'WhatsApp Bot', desc: 'Bot con comandos útiles, stickers y moderación.', tech: ['whatsapp-web.js', 'TypeScript'] },
    ],
  },
  {
    name: 'Telegram', color: 'from-blue-400 to-cyan-600',
    projects: [
      { name: 'TG Admin Bot', desc: 'Bot de administración con filtros, bienvenidas y estadísticas.', tech: ['Telegraf', 'Node.js'] },
      { name: 'File Manager Bot', desc: 'Bot para subir, gestionar y compartir archivos en la nube.', tech: ['Python', 'Telegram API'] },
    ],
  },
  {
    name: 'MuzicMania', color: 'from-pink-500 to-rose-700', logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_ccolor.png',
    projects: [
      { name: 'MuzicMania Web', desc: 'Juego de ritmo musical con estética neon futurista. Próximamente.', tech: ['Next.js', 'TypeScript', 'Web Audio'] },
    ],
  },
  {
    name: 'Ciszuko Network', color: 'from-brand to-brand-300',
    projects: [
      { name: 'Ciszuko CLI', desc: 'CLI para automatizar flujos de trabajo de desarrollo y despliegue.', tech: ['Node.js', 'TypeScript'] },
      { name: 'Network Dashboard', desc: 'Panel de control para gestionar todos los servicios de la red.', tech: ['Next.js', 'Tailwind', 'Prisma'] },
      { name: 'API Gateway', desc: 'API Gateway unificada para todos los microservicios.', tech: ['Go', 'gRPC', 'Docker'] },
    ],
  },
  {
    name: 'Ciszuko Antony', color: 'from-brand-dark to-brand', logo: '/images/francisco_selfie/cisco-1.jpg',
    projects: [
      { name: 'Portfolio Web', desc: 'Portfolio personal con diseño tech y neón.', tech: ['Next.js', 'Framer Motion'] },
      { name: 'Sistema de Firmas', desc: 'Generador de firmas de correo corporativas.', tech: ['HTML', 'CSS'] },
    ],
  },
  {
    name: 'Personal', color: 'from-orange-500 to-red-600',
    projects: [
      { name: 'Open Source', desc: 'Contribuciones y proyectos de código abierto.', tech: ['TypeScript', 'Python'] },
      { name: 'Utility Scripts', desc: 'Colección de scripts útiles para el día a día.', tech: ['Bash', 'Python', 'PowerShell'] },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Projects
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Innovation in every line of code</p>
        </motion.div>

        {categories.map((cat, ci) => (
          <motion.section key={cat.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
{cat.logo ? (
                <SmartImage src={cat.logo} alt={cat.name} width={36} height={36} className="rounded-lg object-cover" />
              ) : (
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${cat.color}`} />
              )}
              <h2 className="text-2xl md:text-3xl font-header font-bold text-white">{cat.name}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.projects.map((p, i) => (
                <motion.div key={p.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-1"
                >
{cat.logo ? (
                    <SmartImage src={cat.logo} alt={p.name} width={40} height={40} className="rounded-xl object-cover mb-4" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} mb-4`} />
                  )}
                  <h3 className="text-xl font-header font-bold text-white mb-2 group-hover:text-brand transition-colors">{p.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
