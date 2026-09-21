'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  type InfoTheme,
  type InfoCardItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import { SOCIALS } from '@/config/navigation';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';

/**
 * Equipo de Ciszuko Antony.
 *
 * El proyecto lo lleva una sola persona, así que la página muestra al fundador
 * con detalle, los roles que cubre el ecosistema y cómo entrar a colaborar —
 * misma estructura que el resto de webs de Ciszu Network.
 */
const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const COPY = {
  name: 'Ciszuko Antony',
  legal: 'Francisco Antonio García Menolascina',
  role: 'CEO & Founder · Ciszuko Network',
  bio: 'Desarrollador full-stack y creador de Ciszuko Network. Diseña y mantiene las webs del ecosistema, los bots de Discord/WhatsApp/Telegram, MuzicMania y los servidores de Minecraft. También produce el contenido que se publica en el canal.',
  skillsTitle: 'Áreas que cubre el equipo',
  rolesTitle: 'Roles activos',
  joinTitle: 'Cómo colaborar',
  socialsTitle: 'Redes oficiales',
};

const SKILLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'Supabase',
  'Cloud & CI',
  'UI / UX',
  'Diseño de marca',
  'Minecraft / Plugins',
  'Edición de vídeo',
];

const ROLES: InfoCardItem[] = [
  {
    icon: 'crown',
    title: 'Dirección',
    body: 'Define la hoja de ruta del ecosistema, la identidad de marca y aprueba cada publicación y despliegue.',
  },
  {
    icon: 'terminal',
    title: 'Desarrollo',
    body: 'Webs, API, bots y automatizaciones. Todo el código vive en el GitHub de Ciszu Network.',
  },
  {
    icon: 'palette',
    title: 'Diseño',
    body: 'Logos, iconografía SVG, paletas y el sistema de UI compartido por las cuatro webs.',
  },
  {
    icon: 'music',
    title: 'Contenido',
    body: 'Vídeos, directos y material promocional de MuzicMania y los proyectos de Minecraft.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Únete a la comunidad',
    body: 'El punto de entrada es el servidor de Discord y la comunidad de CiszuGamens, donde se anuncian las vacantes y las colaboraciones.',
  },
  {
    title: 'Elige un área',
    body: 'Desarrollo, diseño, traducción, moderación o soporte. Se valora cualquier aporte, no solo el código.',
  },
  {
    title: 'Presenta tu propuesta',
    body: 'Abre un issue o un pull request en GitHub con la idea y el alcance. Se revisa y se responde siempre.',
  },
  {
    title: 'Publicación con crédito',
    body: 'Cada aporte aceptado se publica en el changelog con su autoría visible en la ficha del cambio.',
  },
];

export default function TeamPage() {
  usePageTitle('TEAM');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <InfoHero
            icon="users"
            title="Team"
            subtitle="Quién está detrás de Ciszuko Antony: el fundador, los roles que cubre el ecosistema y cómo entrar a colaborar."
            theme={THEME}
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-14 p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="relative z-10">
            <Image
              src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg')}
              alt={COPY.name}
              width={132}
              height={132}
              className="rounded-full object-cover mx-auto mb-6 border-2 border-neon-blue/40 w-32 h-32"
            />
            <h2 className="text-3xl font-header font-black text-white uppercase tracking-tight">{COPY.name}</h2>
            <p className="text-[11px] text-gray-500 mt-1">{COPY.legal}</p>
            <p className={`text-xs font-black uppercase tracking-[0.35em] mt-3 mb-6 ${THEME.accent}`}>
              {COPY.role}
            </p>
            <p className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed mb-8">{COPY.bio}</p>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.skillsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent}`}
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.socialsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  aria-label={social.name}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-gray-300 transition-all hover:scale-110 ${THEME.border} ${THEME.card}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="space-y-14">
          <InfoCardGrid title={COPY.rolesTitle} items={ROLES} theme={THEME} columns={4} />
          <InfoSteps title={COPY.joinTitle} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Contacto', href: '/contact', icon: 'mail' },
            { label: 'Ver proyectos', href: '/projects', icon: 'rocket', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
